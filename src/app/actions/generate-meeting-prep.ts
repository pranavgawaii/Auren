"use server";

import { gmailSearch } from "@/lib/corsair";
import { classifyWithHaiku } from "@/lib/anthropic";
import { createServerSupabaseClient } from "@/lib/supabase";
import { z } from "zod";
import type { CorsairResponse } from "@/types";

const meetingBriefSchema = z.object({
  lastDiscussed: z.string(),
  youOweThem: z.string(),
  theyAsked: z.string(),
  lastEmailDate: z.string(),
  pendingItems: z.string(),
});

type MeetingBrief = z.infer<typeof meetingBriefSchema>;

type MeetingPrepResult = CorsairResponse<MeetingBrief>;

const SYSTEM_PROMPT = `You are a meeting preparation assistant.
Given email thread context, return only valid JSON with exactly these five fields as strings:
lastDiscussed, youOweThem, theyAsked, lastEmailDate, pendingItems.
Each field is one concise sentence. No markdown. No explanation.`;

export async function generateMeetingPrep(
  eventId: string,
  attendeeEmails: string[]
): Promise<MeetingPrepResult> {
  try {
    const emailContextParts: string[] = [];

    for (const attendeeEmail of attendeeEmails) {
      const searchResult = await gmailSearch(`from:${attendeeEmail}`);
      if (searchResult.success) {
        for (const msg of searchResult.data.messages.slice(0, 3)) {
          emailContextParts.push(`From: ${msg.from}\nSubject: ${msg.subject}\nSnippet: ${msg.snippet}`);
        }
      }
    }

    const emailContext = emailContextParts.length > 0
      ? emailContextParts.join("\n\n---\n\n")
      : "No recent emails found with these attendees.";

    const userMessage = `Here are recent email threads with my meeting attendees:\n\n${emailContext}\n\nGenerate the 5-field meeting brief.`;

    const rawResponse = await classifyWithHaiku(SYSTEM_PROMPT, userMessage);

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Haiku response");

    const parsed = meetingBriefSchema.parse(JSON.parse(jsonMatch[0]));

    const supabase = createServerSupabaseClient();
    const { error: updateError } = await supabase
      .from("calendar_events")
      .update({ meeting_prep: parsed })
      .eq("gcal_id", eventId);

    if (updateError) {
      console.error("Failed to persist meeting prep:", updateError.message);
    }

    return { success: true, data: parsed };
  } catch (error: unknown) {
    return {
      success: false,
      error: {
        code: "MEETING_PREP_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}
