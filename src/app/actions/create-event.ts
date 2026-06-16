"use server";

import { googleCalendarCreate } from "@/lib/corsair";
import { createServerSupabaseClient } from "@/lib/supabase";
import { DEMO_USER_ID, ACTION_STATUS } from "@/lib/constants";
import type { CalendarEventPayload } from "@/types";

export async function createCalendarEvent(payload: CalendarEventPayload) {
  try {
    const zoomLink = `https://zoom.us/j/${Date.now()}`;
    const description = payload.description 
      ? `${payload.description}\n\nZoom Link: ${zoomLink}` 
      : `Zoom Link: ${zoomLink}`;

    const result = await googleCalendarCreate({
      ...payload,
      description,
    });

    if (!result.success) {
      return result;
    }

    const event = result.data;
    const supabase = createServerSupabaseClient();

    const { error: eventError } = await supabase.from("calendar_events").upsert({
      user_id: DEMO_USER_ID,
      gcal_id: event.id,
      title: event.title,
      start_at: event.startAt,
      end_at: event.endAt,
      attendees: event.attendees,
      location: payload.location || null,
      zoom_link: zoomLink,
      description: payload.description || null,
      prep_card_sent: false,
    }, { onConflict: "gcal_id" });

    if (eventError) {
      console.error("Failed to upsert calendar event:", eventError);
    }

    const { error: dbError } = await supabase.from("agent_actions").insert({
      user_id: DEMO_USER_ID,
      command: "Create calendar event",
      status: ACTION_STATUS.COMPLETED,
      actions_taken: [
        {
          tool: "calendar_create",
          input: { title: payload.title, startAt: payload.startAt, endAt: payload.endAt },
          output: { eventId: event.id, zoomLink },
          executedAt: new Date().toISOString(),
        },
      ],
      completed_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Failed to log agent action:", dbError);
    }

    return { success: true, data: { eventId: event.id, zoomLink } };
  } catch (error: unknown) {
    return {
      success: false,
      error: {
        code: "CREATE_EVENT_ACTION_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}
