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

export async function syncInboxEmails() {
  try {
    const userId = await getUserId();
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "";

    const isDeveloper = email.includes("pranvgg") || email.includes("pranavgawaii");

    if (!isDeveloper) {
      console.log("[Sync] Test user detected. Seeding mock emails...");
      const supabase = createServerSupabaseClient();
      const now = new Date();
      const minusHours = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
      const minusDays = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

      const demoEmails = [
        {
          user_id: userId,
          gmail_id: `test_001_${userId.slice(0, 5)}`,
          thread_id: `thread_001_${userId.slice(0, 5)}`,
          from_email: 'rahul.sharma@acmecorp.in',
          from_name: 'Rahul Sharma',
          subject: 'Re: Project deadline — need your answer today',
          snippet: 'Hi, following up on the proposal. We need to know by EOD if you can take on the project. Budget is confirmed at ₹2.4L. Please confirm.',
          body: 'Hi, following up on the proposal. We need to know by EOD if you can take on the project. Budget is confirmed at ₹2.4L. Please confirm.',
          priority: 'urg',
          is_read: false,
          received_at: minusHours(2),
        },
        {
          user_id: userId,
          gmail_id: `test_002_${userId.slice(0, 5)}`,
          thread_id: `test_002_${userId.slice(0, 5)}`,
          from_email: 'priya.verma@bluewave.co',
          from_name: 'Priya Verma',
          subject: 'Invoice #0042 overdue — please confirm receipt',
          snippet: 'The invoice for the brand identity project is now 14 days overdue. Could you confirm you received it and let us know the payment timeline?',
          body: 'The invoice for the brand identity project is now 14 days overdue. Could you confirm you received it and let us know the payment timeline?',
          priority: 'urg',
          is_read: false,
          received_at: minusHours(4),
        },
        {
          user_id: userId,
          gmail_id: `test_003_${userId.slice(0, 5)}`,
          thread_id: `test_003_${userId.slice(0, 5)}`,
          from_email: 'dev@corsair.dev',
          from_name: 'Dev · Corsair',
          subject: 'New webhooks endpoint ready for testing',
          snippet: 'We shipped a new webhooks endpoint with improved reliability. Check the docs at docs.corsair.dev for the updated configuration.',
          body: 'We shipped a new webhooks endpoint with improved reliability. Check the docs at docs.corsair.dev for the updated configuration.',
          priority: 'nrm',
          is_read: false,
          received_at: minusHours(6),
        },
        {
          user_id: userId,
          gmail_id: `test_004_${userId.slice(0, 5)}`,
          thread_id: `test_004_${userId.slice(0, 5)}`,
          from_email: 'hitesh@chaicode.com',
          from_name: 'Hitesh Choudhary',
          subject: 'Hackathon update — judges confirmed',
          snippet: 'Quick update on the hackathon. All judges are confirmed. Make sure your demo video is under 3 minutes and shows real integrations.',
          body: 'Quick update on the hackathon. All judges are confirmed. Make sure your demo video is under 3 minutes and shows real integrations.',
          priority: 'nrm',
          is_read: true,
          received_at: minusHours(8),
        },
        {
          user_id: userId,
          gmail_id: `test_005_${userId.slice(0, 5)}`,
          thread_id: `test_005_${userId.slice(0, 5)}`,
          from_email: 'ananya.singh@krutrim.ai',
          from_name: 'Ananya Singh',
          subject: 'SDE-1 Interview — Thursday 4PM IST',
          snippet: 'Congratulations on clearing the OA round. We would like to schedule your technical interview for Thursday at 4PM IST. Please confirm your availability.',
          body: 'Congratulations on clearing the OA round. We would like to schedule your technical interview for Thursday at 4PM IST. Please confirm your availability.',
          priority: 'urg',
          is_read: false,
          received_at: minusHours(10),
        },
        {
          user_id: userId,
          gmail_id: `test_006_${userId.slice(0, 5)}`,
          thread_id: `test_006_${userId.slice(0, 5)}`,
          from_email: 'noreply@github.com',
          from_name: 'GitHub',
          subject: 'PR #142 — auth refactor waiting for your review',
          snippet: 'Pranav Gawai requested your review on pull request auth refactor. This PR has been waiting for 48 hours.',
          body: 'Pranav Gawai requested your review on pull request auth refactor. This PR has been waiting for 48 hours.',
          priority: 'nrm',
          is_read: false,
          received_at: minusDays(1),
        },
        {
          user_id: userId,
          gmail_id: `test_007_${userId.slice(0, 5)}`,
          thread_id: `test_007_${userId.slice(0, 5)}`,
          from_email: 'newsletter@producthunt.com',
          from_name: 'Product Hunt',
          subject: 'Top products this week — AI tools edition',
          snippet: 'This week on Product Hunt: 5 AI tools that are changing how developers work. Plus the most upvoted product of the month.',
          body: 'This week on Product Hunt: 5 AI tools that are changing how developers work. Plus the most upvoted product of the month.',
          priority: 'fyi',
          is_read: true,
          received_at: minusDays(2),
        },
        {
          user_id: userId,
          gmail_id: `test_008_${userId.slice(0, 5)}`,
          thread_id: `test_008_${userId.slice(0, 5)}`,
          from_email: 'noreply@vercel.com',
          from_name: 'Vercel',
          subject: 'Deployment successful — auren.vercel.app',
          snippet: 'Your deployment to auren.vercel.app was successful. Build time: 43 seconds. All checks passed.',
          body: 'Your deployment to auren.vercel.app was successful. Build time: 43 seconds. All checks passed.',
          priority: 'fyi',
          is_read: true,
          received_at: minusDays(3),
        }
      ];

      await supabase.from("emails").upsert(demoEmails, { onConflict: "gmail_id" });
      return { success: true, count: demoEmails.length };
    }

    console.log("[Sync] Fetching emails from Gmail via Corsair...");
    const corsairRes = await gmailRead();

    if (!corsairRes.success) {
      console.error("[Sync] Corsair fetch failed:", corsairRes.error);
      return { success: false, error: corsairRes.error };
    }

    const emails = corsairRes.data;
    console.log(`[Sync] Fetched ${emails.length} emails from Gmail`);

    if (emails.length === 0) {
      return { success: true, count: 0 };
    }

    const supabase = createServerSupabaseClient();
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
      error: {
        code: "SYNC_ERROR",
        message: error instanceof Error ? error.message : "Unknown sync error",
      },
    };
  }
}
