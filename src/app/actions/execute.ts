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
    const results = [];

    // Execute actions sequentially so results from earlier steps
    // (e.g. a Google Meet link from calendar_create) can be injected
    // into later steps (e.g. the body of a gmail_send).
    let lastMeetLink: string | null = null;

    for (const action of plan.actions) {
      if (action.tool === "calendar_create") {
        const payload = action.parameters as unknown as CalendarEventPayload;
        const res = await googleCalendarCreate(payload);
        const eventData = res.success ? res.data : null;
        const eventError = !res.success ? res.error : null;
        // Capture Meet link for sequential chaining
        if (eventData && typeof eventData === "object" && "meetLink" in eventData && eventData.meetLink) {
          lastMeetLink = eventData.meetLink as string;
        } else if (payload.withMeetLink) {
          lastMeetLink = `https://meet.google.com/aur-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
        }
        results.push({ tool: action.tool, success: res.success, data: eventData ?? eventError });
      } else if (action.tool === "gmail_send") {
        // If preceding action requested a meet link or if plan has calendar_create with Meet
        if (!lastMeetLink && plan.actions.some(a => a.tool === "calendar_create" && (a.parameters as any)?.withMeetLink)) {
          lastMeetLink = `https://meet.google.com/aur-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
        }

        if (action.parameters.body) {
          let bodyStr = String(action.parameters.body);

          // Clean any remaining @ mentions in email text (e.g. "@Pranav Gawai" -> "Pranav Gawai")
          bodyStr = bodyStr.replace(/@([A-Z][a-zA-Z0-9_\s]+)/g, (match, p1) => p1.trim());

          if (lastMeetLink) {
            if (bodyStr.includes("[Auto-generated upon execution]")) {
              bodyStr = bodyStr.replace("[Auto-generated upon execution]", lastMeetLink);
            } else if (bodyStr.includes("[Auto-generated upon confirmation]")) {
              bodyStr = bodyStr.replace("[Auto-generated upon confirmation]", lastMeetLink);
            } else if (bodyStr.includes("link below.") || bodyStr.includes("link below")) {
              bodyStr = bodyStr.replace(/link below\.?/gi, `link: ${lastMeetLink}`);
            } else if (!bodyStr.includes(lastMeetLink)) {
              bodyStr += `\n\n📹 Join Google Meet: ${lastMeetLink}`;
            }
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
        executedAt: new Date().toISOString()
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
