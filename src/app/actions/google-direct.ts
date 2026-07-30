"use server";

import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/user";
import { buildAuthUrl, isDirectCalendarConnected } from "@/lib/google-direct";

/**
 * Returns the Google consent URL for the direct Calendar grant that Auren uses to
 * create real Google Meet links (see src/lib/google-direct.ts for why this exists).
 */
export async function getGoogleMeetAuthUrl(): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const userId = await getUserId();
    const h = await headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") || (host?.startsWith("localhost") ? "http" : "https");
    if (!host) return { success: false, error: "Could not determine app origin." };

    return { success: true, url: buildAuthUrl(`${proto}://${host}`, userId) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getGoogleMeetStatus(): Promise<{ connected: boolean }> {
  noStore();
  return { connected: await isDirectCalendarConnected() };
}

export async function disconnectGoogleMeet(): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    const db = await getDb();
    if (!db) return { success: false, error: "Database unavailable" };
    await db.collection("google_direct_tokens").deleteOne({ user_id: userId });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
