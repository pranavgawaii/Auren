"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
import { syncInboxEmails } from "./sync-emails";
import { getUserId } from "@/lib/user";
import type { GmailMessage } from "@/types";

export async function getInboxEmails(shouldSync: boolean = false, maxResults: number = 20): Promise<{ success: boolean; data?: GmailMessage[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const userId = await getUserId();

    // If sync is requested, sync first
    if (shouldSync) {
      const syncResult = await syncInboxEmails(maxResults);
      if (!syncResult.success) {
        console.error("Failed to sync emails:", syncResult.error);
        // Continue to query from DB anyway so we don't crash
      }
    }

    // Fetch emails from Supabase for this specific user
    const { data: dbEmails, error: dbError } = await supabase
      .from("emails")
      .select("*")
      .eq("user_id", userId)
      .order("received_at", { ascending: false });

    if (dbError) {
      console.error("Failed to fetch emails from DB:", dbError);
      return { success: false, error: dbError.message };
    }

    // If DB is empty and shouldSync wasn't run, trigger an initial sync automatically
    if ((!dbEmails || dbEmails.length === 0) && !shouldSync) {
      const syncResult = await syncInboxEmails(maxResults);
      if (syncResult.success) {
        // Fetch again after initial sync
        const { data: refetchedEmails, error: refetchError } = await supabase
          .from("emails")
          .select("*")
          .eq("user_id", userId)
          .order("received_at", { ascending: false });
        
        if (!refetchError && refetchedEmails) {
          return { success: true, data: mapDbEmailsToGmailMessages(refetchedEmails) };
        }
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
      // Skip corrupted rows — must have at least a sender email OR a subject
      const hasSender = email.from_email && email.from_email.trim() !== "";
      const hasSubject = email.subject && email.subject.trim() !== "" && email.subject !== "(No Subject)";
      return hasSender || hasSubject;
    })
    .map((email) => ({
      id: email.gmail_id,
      threadId: email.thread_id,
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
