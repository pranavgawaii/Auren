"use server";

import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/user";
import { syncCalendarEvents } from "./sync-calendar";
import type { CalendarEventResult } from "@/types";

export async function getCalendarEvents(shouldSync: boolean = false): Promise<{ success: boolean; data?: CalendarEventResult[]; error?: string }> {
  try {
    const userId = await getUserId();
    const db = await getDb();

    if (shouldSync) {
      const syncResult = await syncCalendarEvents();
      if (!syncResult.success) {
        console.error("Failed to sync calendar:", syncResult.error);
      }
    }

    if (!db) {
      return { success: true, data: [] };
    }

    const collection = db.collection("calendar_events");
    const dbEvents = await collection
      .find({ user_id: userId })
      .sort({ start_at: 1 })
      .toArray();

    if ((!dbEvents || dbEvents.length === 0) && !shouldSync) {
      const syncResult = await syncCalendarEvents();
      if (syncResult.success) {
        const refetchedEvents = await collection
          .find({ user_id: userId })
          .sort({ start_at: 1 })
          .toArray();
        
        return { success: true, data: mapDbEventsToCalendarResults(refetchedEvents) };
      }
    }

    return { success: true, data: mapDbEventsToCalendarResults(dbEvents || []) };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

function mapDbEventsToCalendarResults(dbEvents: any[]): CalendarEventResult[] {
  return dbEvents.map(evt => ({
    id: evt.gcal_id || evt._id.toString(),
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
