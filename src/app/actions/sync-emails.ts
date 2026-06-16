"use server";

import { gmailRead } from "@/lib/corsair";
import { updateContacts } from "@/app/actions/update-contacts";
import { createServerSupabaseClient } from "@/lib/supabase";
import { EMAIL_PRIORITY, type EmailPriority } from "@/lib/constants";
import { getUserId } from "@/lib/user";
import { currentUser } from "@clerk/nextjs/server";

// ─── Keyword-only priority classification — NO API calls, always instant ──────
const FYI_KEYWORDS = [
  "newsletter", "unsubscribe", "promotion", "sale", "offer", "no-reply",
  "noreply", "notification", "digest", "weekly", "monthly", "coupon",
  "discount", "deals", "updates from", "you're subscribed",
];
const URGENT_KEYWORDS = [
  "urgent", "asap", "immediately", "critical", "deadline", "emergency",
  "action required", "time sensitive", "overdue", "payment due", "invoice due",
];

function classifyPriorityLocal(subject: string, snippet: string): EmailPriority {
  const text = `${subject} ${snippet}`.toLowerCase();
  for (const kw of FYI_KEYWORDS) {
    if (text.includes(kw)) return EMAIL_PRIORITY.FYI;
  }
  for (const kw of URGENT_KEYWORDS) {
    if (text.includes(kw)) return EMAIL_PRIORITY.URGENT;
  }
  return EMAIL_PRIORITY.NORMAL;
}

export async function syncInboxEmails(maxResults: number = 20, folderType?: "INBOX" | "SENT" | "DRAFT"): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const userId = await getUserId();
    const supabase = createServerSupabaseClient();


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

    let syncCount = 0;
    let skipCount = 0;

    for (const email of emails) {
      // Debug: log raw fields from Corsair
      console.log(`[Sync] Email raw:`, {
        id: email.id,
        from: email.from,
        fromName: email.fromName,
        subject: email.subject,
        hasBody: !!email.body,
        date: email.date,
      });

      // Skip completely empty messages (malformed API responses)
      if (!email.id) {
        console.log("[Sync] Skipped: no id");
        skipCount++;
        continue;
      }

      // Classify without any API call — purely local heuristics
      const priority = classifyPriorityLocal(email.subject || "", email.snippet || "");

      const { data: upserted, error: upsertError } = await supabase
        .from("emails")
        .upsert(
          {
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
          },
          { onConflict: "gmail_id" }
        )
        .select("id")
        .single();

      if (!upsertError && upserted) {
        syncCount++;
        console.log(`[Sync] Saved: "${email.subject}" from ${email.from}`);
      } else if (upsertError) {
        console.error(`[Sync] Upsert failed for ${email.id}:`, upsertError.message);
      }
    }

    console.log(`[Sync] Done — saved ${syncCount}, skipped ${skipCount}`);

    // Update contacts — completely non-blocking, never crashes the sync
    setImmediate(async () => {
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
    });

    return { success: true, count: syncCount };
  } catch (error: unknown) {
    console.error("[Sync] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown sync error",
    };
  }
}
