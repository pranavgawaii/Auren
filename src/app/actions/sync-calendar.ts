"use server";

import { googleCalendarList } from "@/lib/corsair";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getUserId } from "@/lib/user";
import { currentUser } from "@clerk/nextjs/server";

export async function syncCalendarEvents() {
  try {
    const userId = await getUserId();
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "";
    
    const isDeveloper = email.includes("pranvgg") || email.includes("pranavgawaii");
    
    if (!isDeveloper) {
      console.log("[Sync Calendar] Test user detected. Seeding mock events...");
      const supabase = createServerSupabaseClient();
      const now = new Date();
      const addHours = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
      const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      
      const demoEvents = [
        {
          user_id: userId,
          gcal_id: `test_evt_001_${userId.slice(0, 5)}`,
          title: "ChaiCode x Corsair Demo Sync",
          start_at: addHours(2),
          end_at: addHours(3),
          attendees: [{ email: "hitesh@chaicode.com" }],
          description: "Sync to review hackathon submission code and integrations.",
          location: "Google Meet",
        },
        {
          user_id: userId,
          gcal_id: `test_evt_002_${userId.slice(0, 5)}`,
          title: "Project Review & Feedback",
          start_at: addDays(1),
          end_at: new Date(new Date(addDays(1)).getTime() + 60 * 60 * 1000).toISOString(),
          attendees: [{ email: "priya.verma@bluewave.co" }],
          description: "Go over branding and onboarding page design feedback.",
          location: "Zoom",
        }
      ];
      
      await supabase.from("calendar_events").upsert(demoEvents, { onConflict: "gcal_id" });
      return { success: true, count: demoEvents.length };
    }

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
