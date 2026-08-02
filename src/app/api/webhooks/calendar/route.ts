import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getDb } from "@/lib/db";
import { generateMeetingPrep } from "@/app/actions/generate-meeting-prep";

interface CalendarWebhookPayload {
  gcal_id: string;
  title: string;
  start_at: string;
  end_at: string;
  attendees?: Array<{ email: string; name?: string; responseStatus?: string }>;
  description?: string;
  location?: string;
  user_id?: string;
}

const MEETING_PREP_WINDOW_MINUTES = 35;

/**
 * SEC-FIX: Constant-time comparison to prevent timing-attack secret enumeration (CWE-208).
 */
function safeCompareSecrets(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const receivedSecret = request.headers.get("x-webhook-secret") || request.headers.get("x-corsair-secret");
  const expectedSecret = process.env.WEBHOOK_SECRET;

  // SEC-FIX: Fail closed when no secret is configured.
  if (!expectedSecret) {
    console.error("[webhook/calendar] WEBHOOK_SECRET env var is not set — rejecting all requests.");
    return new NextResponse("Webhook not configured", { status: 503 });
  }
  if (!receivedSecret || !safeCompareSecrets(receivedSecret, expectedSecret)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const payload = await request.json() as CalendarWebhookPayload;

    const db = await getDb();
    const userId = String(payload.user_id ?? process.env.CORSAIR_TENANT_ID ?? "default-user");

    const attendees = (payload.attendees ?? []).map((a) => ({
      email: String(a.email),
      name: a.name ?? null,
      responseStatus: a.responseStatus ?? "needsAction",
    }));

    if (db) {
      await db.collection("calendar_events").updateOne(
        { gcal_id: payload.gcal_id },
        {
          $set: {
            gcal_id: payload.gcal_id,
            user_id: userId,
            title: payload.title,
            start_at: payload.start_at,
            end_at: payload.end_at,
            attendees,
            description: payload.description ?? null,
            location: payload.location ?? null,
            updated_at: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }

    const startTime = new Date(payload.start_at);
    const minutesUntilStart = (startTime.getTime() - Date.now()) / 60000;

    if (minutesUntilStart > 0 && minutesUntilStart <= MEETING_PREP_WINDOW_MINUTES && attendees.length > 0) {
      const attendeeEmails = attendees.map((a) => a.email);
      await generateMeetingPrep(payload.gcal_id, attendeeEmails);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
