"use server";

import { googleCalendarList } from "@/lib/corsair";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getUserId } from "@/lib/user";
import { currentUser } from "@clerk/nextjs/server";

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
    
    const supabase = createServerSupabaseClient();
    let syncCount = 0;
    
    for (const evt of events) {
      const { data: upserted, error: upsertError } = await supabase
        .from("calendar_events")
        .upsert(
          {
            user_id: userId,
            gcal_id: evt.id,
            title: evt.title || "Untitled Event",
            start_at: evt.startAt,
            end_at: evt.endAt,
            attendees: evt.attendees || [],
            html_link: evt.htmlLink || null,
            description: evt.description || null,
            location: evt.location || null,
          },
          { onConflict: "gcal_id" }
        )
        .select("id")
        .single();
        
      if (!upsertError && upserted) {
        syncCount++;
      } else if (upsertError) {
        console.error(`[Sync Calendar] Upsert failed for ${evt.id}:`, upsertError.message);
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
