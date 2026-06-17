"use server";

import { googleCalendarCreate } from "@/lib/corsair";
import { createServerSupabaseClient } from "@/lib/supabase";
import { DEMO_USER_ID, ACTION_STATUS } from "@/lib/constants";
import type { CalendarEventPayload } from "@/types";

export async function createCalendarEvent(payload: CalendarEventPayload) {
  try {
    const requestId = `auren-meet-${Date.now()}`;
    const description = payload.description || "";

    const result = await googleCalendarCreate({
      ...payload,
      description,
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      conferenceDataVersion: 1,
    } as CalendarEventPayload & Record<string, unknown>);

    if (!result.success) {
      // Fallback: save locally with warning
      const supabase = createServerSupabaseClient();
      const newGcalId = `evt_fallback_${Date.now()}`;
      await supabase.from("calendar_events").insert({
        user_id: DEMO_USER_ID,
        gcal_id: newGcalId,
        title: payload.title,
        start_at: payload.startAt,
        end_at: payload.endAt,
        attendees: payload.attendees || [],
        location: payload.location || null,
        description: payload.description || null,
        prep_card_sent: false,
      });
      return {
        success: true,
        warning: "calendar_sync_failed",
        data: { eventId: newGcalId, meetLink: null },
      };
    }

    const event = result.data;

    // Extract Google Meet link from Corsair response
    const raw = event as unknown as Record<string, unknown>;
    const meetLink: string | null =
      (raw.hangoutLink as string) ||
      ((raw.conferenceData as Record<string, unknown>)?.entryPoints as Array<Record<string, string>>)?.[0]?.uri ||
      null;

    const supabase = createServerSupabaseClient();

    const { error: eventError } = await supabase.from("calendar_events").upsert({
      user_id: DEMO_USER_ID,
      gcal_id: event.id,
      title: event.title,
      start_at: event.startAt,
      end_at: event.endAt,
      attendees: event.attendees,
      location: payload.location || null,
      zoom_link: meetLink,
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
          output: { eventId: event.id, meetLink },
          executedAt: new Date().toISOString(),
        },
      ],
      completed_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Failed to log agent action:", dbError);
    }

    return { success: true, data: { eventId: event.id, meetLink } };
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
