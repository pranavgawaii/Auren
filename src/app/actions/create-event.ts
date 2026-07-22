"use server";

import { googleCalendarCreate } from "@/lib/corsair";
import { getDb } from "@/lib/db";
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

    const db = await getDb();

    if (!result.success) {
      const newGcalId = `evt_fallback_${Date.now()}`;
      if (db) {
        await db.collection("calendar_events").insertOne({
          user_id: DEMO_USER_ID,
          gcal_id: newGcalId,
          title: payload.title,
          start_at: payload.startAt,
          end_at: payload.endAt,
          attendees: payload.attendees || [],
          location: payload.location || null,
          description: payload.description || null,
          prep_card_sent: false,
          created_at: new Date().toISOString(),
        });
      }
      return {
        success: true,
        warning: "calendar_sync_failed",
        data: { eventId: newGcalId, meetLink: null },
      };
    }

    const event = result.data;
    const raw = event as unknown as Record<string, unknown>;
    const meetLink: string | null =
      (raw.hangoutLink as string) ||
      ((raw.conferenceData as Record<string, unknown>)?.entryPoints as Array<Record<string, string>>)?.[0]?.uri ||
      null;

    if (db) {
      await db.collection("calendar_events").updateOne(
        { gcal_id: event.id },
        {
          $set: {
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
            updated_at: new Date().toISOString(),
          },
        },
        { upsert: true }
      );

      await db.collection("agent_actions").insertOne({
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
        created_at: new Date().toISOString(),
      });
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
