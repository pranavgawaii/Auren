"use server";

import { getDb } from "@/lib/db";
import { syncInboxEmails } from "./sync-emails";
import { getUserId } from "@/lib/user";
import { checkSyncRateLimit } from "@/lib/rate-limit";
import type { GmailMessage } from "@/types";

export async function getInboxEmails(
  shouldSync: boolean = false, 
  maxResults: number = 20,
  folderType: "INBOX" | "SENT" | "DRAFT" = "INBOX"
): Promise<{ success: boolean; data?: GmailMessage[]; error?: string }> {
  try {
    const userId = await getUserId();
    const db = await getDb();

    if (shouldSync) {
      const rateLimit = await checkSyncRateLimit();
      if (rateLimit.success) {
        const syncResult = await syncInboxEmails(maxResults, folderType);
        if (!syncResult.success) {
          console.error("Failed to sync emails:", syncResult.error);
        }
      }
    }

    if (!db) {
      return { success: true, data: [] };
    }

    const collection = db.collection("emails");
    const filter: Record<string, unknown> = { user_id: userId };
    if (folderType === "INBOX") {
      filter.labels = { $in: ["INBOX"] };
    } else if (folderType === "SENT") {
      filter.labels = { $in: ["SENT"] };
    } else if (folderType === "DRAFT") {
      filter.labels = { $in: ["DRAFT"] };
    }

    let dbEmails = await collection
      .find(filter)
      .sort({ received_at: -1 })
      .toArray();

    if ((!dbEmails || dbEmails.length === 0) && !shouldSync) {
      const syncResult = await syncInboxEmails(maxResults, folderType);
      if (syncResult.success) {
        dbEmails = await collection
          .find(filter)
          .sort({ received_at: -1 })
          .toArray();
      }
    }

    return { success: true, data: mapDbEmailsToGmailMessages(dbEmails || []) };
  } catch (error: unknown) {
    console.error("Inbox fetch error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

function mapDbEmailsToGmailMessages(dbEmails: any[]): GmailMessage[] {
  return dbEmails
    .filter((email) => {
      const hasSender = email.from_email && email.from_email.trim() !== "";
      const hasSubject = email.subject && email.subject.trim() !== "" && email.subject !== "(No Subject)";
      return hasSender || hasSubject;
    })
    .map((email) => ({
      id: email.gmail_id || email._id.toString(),
      threadId: email.thread_id || email.gmail_id,
      from: email.from_email || "",
      fromName: email.from_name || email.from_email || "Unknown Sender",
      to: "",
      subject: email.subject || "(No Subject)",
      snippet: email.snippet || "",
      body: email.body || "",
      date: email.received_at,
      isRead: email.is_read || false,
      priority: email.priority,
    }));
}
