"use server";

import { googleCalendarList } from "@/lib/corsair";
import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/user";

export async function syncCalendarEvents() {
  try {
    const userId = await getUserId();

    console.log("[Sync Calendar] Fetching events from Google Calendar via Corsair...");
    
    const corsairRes = await googleCalendarList();
    
    if (!corsairRes.success) {
      console.error("[Sync Calendar] Corsair fetch failed:", corsairRes.error);
      return { success: false, error: corsairRes.error };
    }
    
    const events = corsairRes.data;
    console.log(`[Sync Calendar] Fetched ${events.length} events from Calendar`);
    
    if (events.length === 0) {
      return { success: true, count: 0 };
    }
    
    const db = await getDb();
    let syncCount = 0;
    
    if (db) {
      const collection = db.collection("calendar_events");
      for (const evt of events) {
        await collection.updateOne(
          { gcal_id: evt.id },
          {
            $set: {
              user_id: userId,
              gcal_id: evt.id,
              title: evt.title || "Untitled Event",
              start_at: evt.startAt,
              end_at: evt.endAt,
              attendees: evt.attendees || [],
              html_link: evt.htmlLink || null,
              description: evt.description || null,
              location: evt.location || null,
              updated_at: new Date().toISOString(),
            },
          },
          { upsert: true }
        );
        syncCount++;
      }
    }
    
    console.log(`[Sync Calendar] Done — saved ${syncCount} events`);
    return { success: true, count: syncCount };
  } catch (error: unknown) {
    console.error("[Sync Calendar] Unexpected error:", error);
    return {
      success: false,
      error: {
        code: "SYNC_CALENDAR_ERROR",
        message: error instanceof Error ? error.message : "Unknown sync error",
      },
    };
  }
}
