import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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
  const secret = request.headers.get('x-webhook-secret') || request.headers.get('x-corsair-secret');
  const expectedSecret = process.env.WEBHOOK_SECRET;
  if (expectedSecret && secret !== expectedSecret) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const payload = await request.json() as CalendarWebhookPayload;

    const db = await getDb();
    const userId = payload.user_id ?? process.env.CORSAIR_TENANT_ID ?? "default-user";

    const attendees = (payload.attendees ?? []).map((a) => ({
      email: a.email,
      name: a.name ?? null,
      responseStatus: a.responseStatus ?? "needsAction",
    }));

    if (db) {
      await db.collection("calendar_events").updateOne(
        { gcal_id: payload.gcal_id },
        {
          $set: {
            gcal_id: payload.gcal_id,
            user_id: userId,
            title: payload.title,
            start_at: payload.start_at,
            end_at: payload.end_at,
            attendees,
            description: payload.description ?? null,
            location: payload.location ?? null,
            updated_at: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }

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
