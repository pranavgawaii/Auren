"use server";

import { gmailSend, googleCalendarCreate, githubCreateIssue, githubListIssues, githubReviewPr } from "@/lib/corsair";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getUserId } from "@/lib/user";
import type { AgentReasoningResult, GmailSendPayload, CalendarEventPayload, GitHubIssuePayload, GitHubListIssuesPayload, GitHubReviewPrPayload } from "@/types";

export async function executePlan(
  plan: AgentReasoningResult,
  command?: string
): Promise<{ success: boolean; results: Record<string, unknown>[]; error?: string }> {
  try {
    const results = [];

    for (const action of plan.actions) {
      if (action.tool === "gmail_send") {
        const payload = action.parameters as unknown as GmailSendPayload;
        const res = await gmailSend(payload);
        results.push({ tool: "gmail_send", success: res.success, data: "data" in res ? res.data : res.error });
      } else if (action.tool === "calendar_create") {
        const payload = action.parameters as unknown as CalendarEventPayload;
        const res = await googleCalendarCreate(payload);
        results.push({ tool: action.tool, success: res.success, data: "data" in res ? res.data : res.error });
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

    const supabase = createServerSupabaseClient();
    const userId = await getUserId();
    
    // Log actions to the database using the correct agent_actions schema
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

    await supabase.from("agent_actions").insert({
      user_id: userId,
      command: command || plan.explanation || "Agent command execution",
      status: allSuccess ? "completed" : "failed",
      actions_taken: actionsTaken,
      error_message: allSuccess ? null : combinedError,
      completed_at: new Date().toISOString()
    });

    const failedResults = results.filter(r => !r.success);
    const hasErrors = failedResults.length > 0;
    
    if (hasErrors) {
      console.error("[ExecutePlan] Actions failed:", failedResults);
      const errorMsg = failedResults
        .map(r => {
           // Corsair error might be under r.data.message or similar if it's passed back
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
