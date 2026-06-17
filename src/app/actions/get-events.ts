"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
import { getUserId } from "@/lib/user";
import { syncCalendarEvents } from "./sync-calendar";
import type { CalendarEventResult } from "@/types";

export async function getCalendarEvents(shouldSync: boolean = false): Promise<{ success: boolean; data?: CalendarEventResult[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const userId = await getUserId();

    if (shouldSync) {
      const syncResult = await syncCalendarEvents();
      if (!syncResult.success) {
        console.error("Failed to sync calendar:", syncResult.error);
      }
    }

    const { data: dbEvents, error: dbError } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .order("start_at", { ascending: true });

    if (dbError) {
      console.error("Failed to fetch calendar from DB:", dbError);
      return { success: false, error: dbError.message };
    }

    if ((!dbEvents || dbEvents.length === 0) && !shouldSync) {
      const syncResult = await syncCalendarEvents();
      if (syncResult.success) {
        const { data: refetchedEvents, error: refetchError } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", userId)
          .order("start_at", { ascending: true });
        
        if (!refetchError && refetchedEvents) {
          return { success: true, data: mapDbEventsToCalendarResults(refetchedEvents) };
        }
      }
    }

    return { success: true, data: mapDbEventsToCalendarResults(dbEvents || []) };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

function mapDbEventsToCalendarResults(dbEvents: any[]): CalendarEventResult[] {
  return dbEvents.map(evt => ({
    id: evt.gcal_id,
    title: evt.title,
    startAt: evt.start_at,
    endAt: evt.end_at,
    description: evt.description || "",
    location: evt.location || "",
    attendees: evt.attendees || [],
    htmlLink: evt.html_link || "",
    zoomLink: evt.zoom_link || ""
  }));
}
