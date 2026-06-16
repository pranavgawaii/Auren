"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
import { classifyWithHaiku } from "@/lib/anthropic";

interface EmailRecord {
  fromEmail: string;
  fromName: string;
  subject: string;
  receivedAt: string;
}

async function generateRelationshipSummary(
  contactEmail: string,
  contactName: string,
  recentSubjects: string[]
): Promise<string> {
  const subjectList = recentSubjects.slice(0, 5).join("\n- ");
  const prompt = `Based on these recent email subjects from ${contactName} (${contactEmail}), write 1-2 sentences describing who this person is and what they typically communicate about:

- ${subjectList}`;

  const summary = await classifyWithHaiku(
    "You are a CRM assistant. Write a concise relationship summary based on email context. No greetings, no formatting, just plain text.",
    prompt
  );
  return summary.trim().slice(0, 500);
}

export async function updateContacts(emails: EmailRecord[], userId: string): Promise<void> {
  const supabase = createServerSupabaseClient();

  for (const email of emails) {
    if (!email.fromEmail) continue;

    const { data: existing } = await supabase
      .from("contacts")
      .select("id, email_count")
      .eq("user_id", userId)
      .eq("email", email.fromEmail)
      .single();

    const newCount = (existing?.email_count ?? 0) + 1;

    const { error: upsertError } = await supabase.from("contacts").upsert(
      {
        user_id: userId,
        email: email.fromEmail,
        name: email.fromName || email.fromEmail.split("@")[0],
        email_count: newCount,
        last_email_date: email.receivedAt,
      },
      { onConflict: "user_id,email" }
    );

    if (upsertError) continue;

    if (newCount >= 3) {
      try {
        const { data: recentEmails } = await supabase
          .from("emails")
          .select("subject")
          .eq("user_id", userId)
          .eq("from_email", email.fromEmail)
          .order("received_at", { ascending: false })
          .limit(5);

        const subjects = (recentEmails ?? []).map((e) => String(e.subject));
        if (subjects.length > 0) {
          const relationshipSummary = await generateRelationshipSummary(
            email.fromEmail,
            email.fromName || email.fromEmail,
            subjects
          );
          await supabase
            .from("contacts")
            .update({ relationship_summary: relationshipSummary })
            .eq("user_id", userId)
            .eq("email", email.fromEmail);
        }
      } catch {
        // Relationship summary failure is non-fatal
      }
    }
  }
}
