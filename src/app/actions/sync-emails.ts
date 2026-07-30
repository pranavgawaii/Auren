"use server";

import { gmailRead } from "@/lib/corsair";
import { updateContacts } from "@/app/actions/update-contacts";
import { getDb } from "@/lib/db";
import { classifyEmailPriority } from "@/lib/email-priority";
import { getUserId } from "@/lib/user";

export async function syncInboxEmails(maxResults: number = 20, folderType?: "INBOX" | "SENT" | "DRAFT"): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const userId = await getUserId();

    console.log(`[Sync] Fetching ${maxResults} emails from Gmail via Corsair...`);
    const corsairRes = await gmailRead(maxResults, folderType);

    if (!corsairRes.success) {
      console.error("[Sync] Corsair fetch failed:", corsairRes.error);
      return { success: false, error: corsairRes.error.message };
    }

    const emails = corsairRes.data;
    console.log(`[Sync] Fetched ${emails.length} emails from Gmail`);

    if (emails.length === 0) {
      return { success: true, count: 0 };
    }

    const db = await getDb();
    let syncCount = 0;
    let skipCount = 0;

    if (db) {
      const collection = db.collection("emails");
      for (const email of emails) {
        if (!email.id) {
          skipCount++;
          continue;
        }

        const priority = classifyEmailPriority({
          subject: email.subject,
          snippet: email.snippet,
          fromEmail: email.from,
          labels: email.labels,
        });

        await collection.updateOne(
          { gmail_id: email.id },
          {
            $set: {
              user_id: userId,
              gmail_id: email.id,
              thread_id: email.threadId || email.id,
              from_email: email.from || "",
              from_name: email.fromName || email.from || "Unknown",
              subject: email.subject || "(No Subject)",
              snippet: email.snippet || "",
              body: email.body || email.snippet || "",
              priority,
              is_read: email.isRead || false,
              received_at: email.date || new Date().toISOString(),
              labels: email.labels || [],
              updated_at: new Date().toISOString(),
            },
          },
          { upsert: true }
        );
        syncCount++;
      }
    }

    console.log(`[Sync] Done — saved ${syncCount}, skipped ${skipCount}`);

    try {
      await updateContacts(
        emails
          .filter((e) => !!e.from)
          .map((e) => ({
            fromEmail: e.from,
            fromName: e.fromName || e.from,
            subject: e.subject || "",
            receivedAt: e.date || new Date().toISOString(),
          })),
        userId
      );
    } catch (err) {
      console.warn("[Sync] Contact update failed (non-fatal):", err);
    }

    return { success: true, count: syncCount };
  } catch (error: unknown) {
    console.error("[Sync] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown sync error",
    };
  }
}
