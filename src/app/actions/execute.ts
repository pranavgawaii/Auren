"use server";

import { gmailSend, googleCalendarCreate, githubCreateIssue, githubListIssues, githubReviewPr } from "@/lib/corsair";
import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/user";
import type { AgentReasoningResult, GmailSendPayload, CalendarEventPayload, GitHubIssuePayload, GitHubListIssuesPayload, GitHubReviewPrPayload } from "@/types";

export async function executePlan(
  plan: AgentReasoningResult,
  command?: string
): Promise<{ success: boolean; results: Record<string, unknown>[]; error?: string }> {
  try {
    const results: Record<string, unknown>[] = [];

    // Execute actions sequentially so results from earlier steps
    // (e.g. a Google Meet link from calendar_create) can be injected
    // into later steps (e.g. the body of a gmail_send).
    let lastMeetLink: string | null = null;
    let lastEventLink: string | null = null;

    for (const action of plan.actions) {
      if (action.tool === "calendar_create") {
        const payload = action.parameters as unknown as CalendarEventPayload;
        const res = await googleCalendarCreate(payload);
        const eventData = res.success ? res.data : null;
        const eventError = !res.success ? res.error : null;
        // Capture the real Meet link (if Google actually generated one) for sequential chaining.
        // Never fabricate a fake meet.google.com URL — an invented code can never resolve to a
        // real meeting. If no direct Meet link came back but the calendar event itself was
        // really created, its htmlLink is a genuine, working fallback (the event page has its
        // own "Join with Google Meet" button), so use that instead of a hollow promise.
        if (eventData && typeof eventData === "object") {
          if ("meetLink" in eventData && eventData.meetLink) {
            lastMeetLink = eventData.meetLink as string;
          } else if ("htmlLink" in eventData && eventData.htmlLink) {
            lastEventLink = eventData.htmlLink as string;
          }
        }
        results.push({ tool: action.tool, success: res.success, data: eventData ?? eventError });
      } else if (action.tool === "gmail_send") {
        if (action.parameters.body) {
          let bodyStr = String(action.parameters.body);

          // Clean any remaining @ mentions in email text (e.g. "@Pranav Gawai" -> "Pranav Gawai")
          bodyStr = bodyStr.replace(/@([A-Z][a-zA-Z0-9_\s]+)/g, (match, p1) => p1.trim());

          // Outgoing mail is business correspondence — strip any emoji/pictographs the model
          // still slipped in, then tidy the whitespace they leave behind.
          bodyStr = bodyStr
            .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/gu, "")
            .replace(/[ \t]{2,}/g, " ")
            .replace(/^[ \t]+/gm, "")
            .trim();

          const placeholderPattern = /\[Auto-generated upon (execution|confirmation)\]/;
          // Match the WHOLE line containing the placeholder (e.g. "Meeting link: [...]") so we
          // can swap in a complete sentence/link rather than a fragment glued onto a label.
          const placeholderLinePattern = /^.*\[Auto-generated upon (execution|confirmation)\].*$/m;
          if (lastMeetLink) {
            if (placeholderPattern.test(bodyStr)) {
              bodyStr = bodyStr.replace(placeholderPattern, lastMeetLink);
            } else if (bodyStr.includes("link below.") || bodyStr.includes("link below")) {
              bodyStr = bodyStr.replace(/link below\.?/gi, `link: ${lastMeetLink}`);
            } else if (!bodyStr.includes(lastMeetLink)) {
              bodyStr += `\n\nJoin the meeting: ${lastMeetLink}`;
            }
          } else if (lastEventLink && placeholderLinePattern.test(bodyStr)) {
            // No Meet URI came back (Corsair's calendar endpoint can't create Meet rooms), but
            // the event genuinely exists on Google Calendar — link straight to it. Word it as a
            // calendar link, not a Meet link, so the text matches what the recipient will find.
            bodyStr = bodyStr.replace(placeholderLinePattern, `Meeting details: ${lastEventLink}`);
          } else if (placeholderLinePattern.test(bodyStr)) {
            // Nothing real to link to (calendar event creation didn't succeed, or wasn't even
            // requested for this send). A raw "[Auto-generated upon ...]" placeholder must never
            // reach a sent email regardless of why it's still there, so always clean it up here.
            bodyStr = bodyStr.replace(placeholderLinePattern, "The meeting link will follow shortly.");
          }
          action.parameters.body = bodyStr;
        }
        const payload = action.parameters as unknown as GmailSendPayload;
        const res = await gmailSend(payload);
        results.push({ tool: "gmail_send", success: res.success, data: "data" in res ? res.data : res.error });
      } else if (action.tool === "github_create_issue") {
        const payload = action.parameters as unknown as GitHubIssuePayload;
        const res = await githubCreateIssue(payload);
        results.push({ tool: action.tool, success: res.success, data: "data" in res ? res.data : res.error });
      } else if (action.tool === "github_list_issues") {
        const payload = action.parameters as unknown as GitHubListIssuesPayload;
        const res = await githubListIssues(payload);
        results.push({ tool: action.tool, success: res.success, data: "data" in res ? res.data : res.error });
      } else if (action.tool === "github_review_pr") {
        const payload = action.parameters as unknown as GitHubReviewPrPayload;
        const res = await githubReviewPr(payload);
        results.push({ tool: action.tool, success: res.success, data: "data" in res ? res.data : res.error });
      } else {
        results.push({ tool: action.tool, success: false, data: "Unknown tool" });
      }

      // Stamp the result that was just pushed with the moment this action actually
      // finished. Doing it here (rather than in the logging loop below) is what keeps
      // each action's real timing — otherwise every action in a plan ends up sharing
      // one identical timestamp taken after the whole plan had already run.
      const justPushed = results[results.length - 1];
      if (justPushed) justPushed.executedAt = new Date().toISOString();
    }

    const userId = await getUserId();
    const db = await getDb();
    
    // Format action items for logging
    const actionsTaken = [];
    let allSuccess = true;
    let combinedError = "";

    for (let i = 0; i < plan.actions.length; i++) {
      const action = plan.actions[i];
      const result = results[i];
      if (!result.success) {
        allSuccess = false;
        const errDetails = typeof result.data === "string" 
          ? result.data 
          : JSON.stringify(result.data);
        combinedError += (combinedError ? " | " : "") + `${action.tool}: ${errDetails}`;
      }
      actionsTaken.push({
        tool: action.tool,
        input: action.parameters,
        output: result.success ? { success: true } : { success: false, error: result.data },
        // Real per-action completion time captured during execution above.
        executedAt: (result.executedAt as string) || new Date().toISOString()
      });
    }

    if (db) {
      await db.collection("agent_actions").insertOne({
        user_id: userId,
        command: command || plan.explanation || "Agent command execution",
        status: allSuccess ? "completed" : "failed",
        actions_taken: actionsTaken,
        error_message: allSuccess ? null : combinedError,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }

    const failedResults = results.filter(r => !r.success);
    const hasErrors = failedResults.length > 0;
    
    if (hasErrors) {
      console.error("[ExecutePlan] Actions failed:", failedResults);
      const errorMsg = failedResults
        .map(r => {
           const errObj = r.data as any;
           const details = errObj?.message || errObj?.code || JSON.stringify(errObj);
           return `${r.tool}: ${details}`;
        })
        .join(" | ");
      return { success: false, results, error: errorMsg };
    }

    return { success: true, results };
  } catch (error: unknown) {
    console.error("Execute plan error:", error);
    return { success: false, results: [], error: error instanceof Error ? error.message : "Unknown error" };
  }
}
