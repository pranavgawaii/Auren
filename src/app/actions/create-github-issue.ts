"use server";

import { githubCreateIssue } from "@/lib/corsair";
import { createServerSupabaseClient } from "@/lib/supabase";
import { DEMO_USER_ID, ACTION_STATUS } from "@/lib/constants";

interface CreateGithubIssuePayload {
  title: string;
  body: string;
  repo?: string;
}

export async function createGithubIssue(payload: CreateGithubIssuePayload) {
  try {
    const result = await githubCreateIssue({
      repoUrl: payload.repo || "",
      title: payload.title,
      body: payload.body,
    });

    if (!result.success) {
      return result;
    }

    const issue = result.data;
    const supabase = createServerSupabaseClient();

    const { error: dbError } = await supabase.from("agent_actions").insert({
      user_id: DEMO_USER_ID,
      command: "Create GitHub issue",
      status: ACTION_STATUS.COMPLETED,
      actions_taken: [
        {
          tool: "github_create_issue",
          input: { title: payload.title, body: payload.body, repoUrl: payload.repo || "" },
          output: { issueUrl: issue.htmlUrl, issueNumber: issue.number },
          executedAt: new Date().toISOString(),
        },
      ],
      completed_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Failed to log agent action:", dbError);
    }

    return { success: true, data: { issueUrl: issue.htmlUrl, issueNumber: issue.number } };
  } catch (error: unknown) {
    return {
      success: false,
      error: {
        code: "CREATE_GITHUB_ISSUE_ACTION_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}
