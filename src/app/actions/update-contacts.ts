"use server";

import { getDb } from "@/lib/db";
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
  const db = await getDb();
  if (!db) return;

  const contactsCollection = db.collection("contacts");
  const emailsCollection = db.collection("emails");

  for (const email of emails) {
    if (!email.fromEmail) continue;

    const existing = await contactsCollection.findOne({ user_id: userId, email: email.fromEmail });
    const newCount = (existing?.email_count ?? 0) + 1;

    await contactsCollection.updateOne(
      { user_id: userId, email: email.fromEmail },
      {
        $set: {
          user_id: userId,
          email: email.fromEmail,
          name: email.fromName || email.fromEmail.split("@")[0],
          email_count: newCount,
          last_email_date: email.receivedAt,
          updated_at: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    if (newCount >= 3) {
      try {
        const recentEmails = await emailsCollection
          .find({ user_id: userId, from_email: email.fromEmail })
          .sort({ received_at: -1 })
          .limit(5)
          .toArray();

        const subjects = (recentEmails ?? []).map((e) => String(e.subject));
        if (subjects.length > 0) {
          const relationshipSummary = await generateRelationshipSummary(
            email.fromEmail,
            email.fromName || email.fromEmail,
            subjects
          );
          await contactsCollection.updateOne(
            { user_id: userId, email: email.fromEmail },
            { $set: { relationship_summary: relationshipSummary } }
          );
        }
      } catch {
        // Non-fatal
      }
    }
  }
}
