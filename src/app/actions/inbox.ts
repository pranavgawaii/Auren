"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
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
    const supabase = createServerSupabaseClient();
    const userId = await getUserId();

    // If sync is requested, sync first
    if (shouldSync) {
      const rateLimit = await checkSyncRateLimit();
      if (!rateLimit.success) {
        console.warn("Sync rate limit exceeded:", rateLimit.error);
        // Continue to query from DB anyway so we don't crash
      } else {
        const syncResult = await syncInboxEmails(maxResults, folderType as "INBOX" | "SENT" | "DRAFT");
        if (!syncResult.success) {
          console.error("Failed to sync emails:", syncResult.error);
        }
      }
    }

    // Fetch emails from Supabase for this specific user
    let query = supabase
      .from("emails")
      .select("*")
      .eq("user_id", userId)
      .order("received_at", { ascending: false });

    // Apply folder filter
    if (folderType === "INBOX") {
      query = query.contains("labels", ["INBOX"]);
    } else if (folderType === "SENT") {
      query = query.contains("labels", ["SENT"]);
    } else if (folderType === "DRAFT") {
      query = query.contains("labels", ["DRAFT"]);
    }

    let { data: dbEmails, error: dbError } = await query;

    // Fallback if the 'labels' column doesn't exist yet (user didn't run SQL migration)
    if (dbError && dbError.message.includes("Could not find the 'labels' column")) {
      console.warn("Labels column missing. Falling back to fetching all emails.");
      const fallbackQuery = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", userId)
        .order("received_at", { ascending: false });
      
      dbEmails = fallbackQuery.data;
      dbError = fallbackQuery.error;
    }

    if (dbError) {
      console.error("Failed to fetch emails from DB:", dbError);
      return { success: false, error: dbError.message };
    }

    // If DB is empty and shouldSync wasn't run, trigger an initial sync automatically
    if ((!dbEmails || dbEmails.length === 0) && !shouldSync) {
      const syncResult = await syncInboxEmails(maxResults, folderType as "INBOX" | "SENT" | "DRAFT");
      if (syncResult.success) {
        // Fetch again after initial sync
        const refetch = await supabase
          .from("emails")
          .select("*")
          .eq("user_id", userId)
          .order("received_at", { ascending: false });
        
        if (!refetch.error && refetch.data) {
          return { success: true, data: mapDbEmailsToGmailMessages(refetch.data) };
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
