import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/user";

/**
 * Direct Google Calendar integration.
 *
 * Why this exists alongside the Corsair integration: Google only creates a Google Meet
 * room when `conferenceDataVersion=1` is sent as a QUERY parameter on events.insert.
 * Corsair's `googlecalendar.api.events.create` does not forward that parameter (verified
 * empirically — conferenceData.createRequest is accepted and silently discarded, and no
 * hangoutLink is ever returned), and Corsair never exposes the raw OAuth token, so there
 * is no way to add it from the outside.
 *
 * This module holds its own Google OAuth grant so Auren can call events.insert directly
 * and get a real, joinable meet.google.com link.
 */

const TOKEN_COLLECTION = "google_direct_tokens";

export const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

export function getRedirectUri(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/google/callback`;
}

export function buildAuthUrl(origin: string, state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not configured.");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(origin),
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPE,
    // offline + consent so we always receive a refresh_token, even on re-authorisation.
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, origin: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: getRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Token exchange failed");
  }
  return data as { access_token: string; refresh_token?: string; expires_in: number };
}

export async function saveTokens(
  userId: string,
  tokens: { access_token: string; refresh_token?: string; expires_in: number }
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const update: Record<string, unknown> = {
    access_token: tokens.access_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
    updated_at: new Date().toISOString(),
  };
  // Google only returns refresh_token on first consent — never overwrite a good one with undefined.
  if (tokens.refresh_token) update.refresh_token = tokens.refresh_token;

  await db.collection(TOKEN_COLLECTION).updateOne(
    { user_id: userId },
    { $set: update, $setOnInsert: { user_id: userId, created_at: new Date().toISOString() } },
    { upsert: true }
  );
}

/**
 * Returns a valid access token for this user, refreshing it if expired.
 * Returns null when the user has not connected the direct Google integration.
 */
export async function getAccessToken(): Promise<string | null> {
  const userId = await getUserId();
  const db = await getDb();
  if (!db) return null;

  const doc = await db.collection(TOKEN_COLLECTION).findOne({ user_id: userId });
  if (!doc) return null;

  // Refresh a minute early to avoid racing the expiry.
  if (doc.access_token && typeof doc.expires_at === "number" && doc.expires_at > Date.now() + 60_000) {
    return doc.access_token as string;
  }

  if (!doc.refresh_token) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: doc.refresh_token as string,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("[GoogleDirect] Refresh failed:", data);
    return null;
  }

  await db.collection(TOKEN_COLLECTION).updateOne(
    { user_id: userId },
    {
      $set: {
        access_token: data.access_token,
        expires_at: Date.now() + data.expires_in * 1000,
        updated_at: new Date().toISOString(),
      },
    }
  );

  return data.access_token as string;
}

export async function isDirectCalendarConnected(): Promise<boolean> {
  try {
    const userId = await getUserId();
    const db = await getDb();
    if (!db) return false;
    const doc = await db.collection(TOKEN_COLLECTION).findOne({ user_id: userId });
    return Boolean(doc?.refresh_token);
  } catch {
    return false;
  }
}

export interface DirectEventInput {
  title: string;
  description?: string;
  startIso: string;
  endIso: string;
  attendees?: string[];
  withMeetLink?: boolean;
}

export interface DirectEventResult {
  id: string;
  htmlLink: string;
  meetLink?: string;
  start?: string;
  end?: string;
}

/**
 * Creates a Google Calendar event directly against Google's API.
 * When `withMeetLink` is set, passes conferenceDataVersion=1 so Google actually
 * provisions a Meet room and returns a joinable hangoutLink.
 */
export async function createEventDirect(
  input: DirectEventInput
): Promise<{ success: true; data: DirectEventResult } | { success: false; error: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "NOT_CONNECTED" };

  const requestBody: Record<string, unknown> = {
    summary: input.title,
    description: input.description,
    start: { dateTime: input.startIso },
    end: { dateTime: input.endIso },
  };

  if (input.attendees && input.attendees.length > 0) {
    requestBody.attendees = input.attendees.map((email) => ({ email }));
  }

  if (input.withMeetLink) {
    requestBody.conferenceData = {
      createRequest: {
        requestId: `auren-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  // The parameter that actually makes Google create the Meet room.
  if (input.withMeetLink) url.searchParams.set("conferenceDataVersion", "1");
  // Let Google email the invite to attendees so they get the event in their own calendar.
  if (input.attendees && input.attendees.length > 0) url.searchParams.set("sendUpdates", "all");

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || "Google Calendar rejected the request";
    console.error("[GoogleDirect] events.insert failed:", message);
    return { success: false, error: message };
  }

  const meetFromEntry = data.conferenceData?.entryPoints?.find(
    (ep: { entryPointType?: string; uri?: string }) => ep.entryPointType === "video"
  )?.uri;

  return {
    success: true,
    data: {
      id: String(data.id || ""),
      htmlLink: String(data.htmlLink || ""),
      meetLink: data.hangoutLink || meetFromEntry || undefined,
      start: data.start?.dateTime,
      end: data.end?.dateTime,
    },
  };
}
