import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = await request.json() as CalendarWebhookPayload;

    const supabase = createServerSupabaseClient();
    const userId = payload.user_id ?? "00000000-0000-0000-0000-000000000001";

    const attendees = (payload.attendees ?? []).map((a) => ({
      email: a.email,
      name: a.name ?? null,
      responseStatus: a.responseStatus ?? "needsAction",
    }));

    await supabase.from("calendar_events").upsert(
      {
        gcal_id: payload.gcal_id,
        user_id: userId,
        title: payload.title,
        start_at: payload.start_at,
        end_at: payload.end_at,
        attendees,
        description: payload.description ?? null,
        location: payload.location ?? null,
      },
      { onConflict: "gcal_id" }
    );

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
