"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
import { sendEmail } from "@/app/actions/send-email";
import { createCalendarEvent } from "@/app/actions/create-event";
import { createGithubIssue } from "@/app/actions/create-github-issue";
import { ACTION_STATUS, DEFAULT_REPLY_TONE, DEFAULT_WORKING_HOURS_START, DEFAULT_WORKING_HOURS_END, DEFAULT_TIMEZONE } from "@/lib/constants";
import type { PlannedAction } from "@/types";

interface AgentCommandResult {
  success: boolean;
  plannedActions: PlannedAction[];
  error?: string;
}

interface UserPrefsSnapshot {
  replyTone: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  timezone: string;
}

async function fetchUserPreferences(userId: string): Promise<UserPrefsSnapshot> {
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from("user_preferences")
      .select("reply_tone, working_hours_start, working_hours_end, timezone")
      .eq("user_id", userId)
      .single();
    return {
      replyTone: String(data?.reply_tone ?? DEFAULT_REPLY_TONE),
      workingHoursStart: String(data?.working_hours_start ?? DEFAULT_WORKING_HOURS_START),
      workingHoursEnd: String(data?.working_hours_end ?? DEFAULT_WORKING_HOURS_END),
      timezone: String(data?.timezone ?? DEFAULT_TIMEZONE),
    };
  } catch {
    return {
      replyTone: DEFAULT_REPLY_TONE,
      workingHoursStart: DEFAULT_WORKING_HOURS_START,
      workingHoursEnd: DEFAULT_WORKING_HOURS_END,
      timezone: DEFAULT_TIMEZONE,
    };
  }
}

function buildMcpUrl(): string {
  const instanceId = process.env.CORSAIR_INSTANCE_ID;
  const tenantId = process.env.CORSAIR_TENANT_ID;
  if (!instanceId || !tenantId) throw new Error("Missing CORSAIR_INSTANCE_ID or CORSAIR_TENANT_ID");
  return `https://api.corsair.dev/mcp/${instanceId}?tenantId=${tenantId}`;
}

function parseCommandLocally(command: string): PlannedAction[] {
  const lower = command.toLowerCase();
  const actions: PlannedAction[] = [];

  if (lower.includes("reply") || lower.includes("respond")) {
    actions.push({ tool: "gmail_send", parameters: { command }, description: "Send reply via Gmail" });
  }
  if (lower.includes("calendar") || lower.includes("schedule") || lower.includes("thursday") || /\d(am|pm)/.test(lower)) {
    actions.push({ tool: "calendar_create", parameters: { command }, description: "Create calendar event" });
  }
  if (lower.includes("github") || lower.includes("issue") || lower.includes("bug")) {
    actions.push({ tool: "github_create_issue", parameters: { command }, description: "Create GitHub issue" });
  }
  return actions;
}

async function executeFallbackActions(plannedActions: PlannedAction[], command: string) {
  for (const action of plannedActions) {
    try {
      if (action.tool === "gmail_send") {
        await sendEmail({ to: process.env.FALLBACK_REPLY_TO ?? "", subject: `Re: ${command}`, body: command });
      } else if (action.tool === "calendar_create") {
        const start = new Date();
        start.setHours(start.getHours() + 24);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 30);
        await createCalendarEvent({ title: command, startAt: start.toISOString(), endAt: end.toISOString(), attendees: [] });
      } else if (action.tool === "github_create_issue") {
        await createGithubIssue({ title: command, body: `Created from agent command: ${command}` });
      }
    } catch (actionError: unknown) {
      console.error(`Fallback action ${action.tool} failed:`, actionError instanceof Error ? actionError.message : actionError);
    }
  }
}

export async function executeAgentCommand(command: string, userId: string): Promise<AgentCommandResult> {
  try {
    const prefs = await fetchUserPreferences(userId);
    const mcpToken = process.env.CORSAIR_MCP_TOKEN;
    const mcpUrl = buildMcpUrl();

    if (mcpToken) {
      const response = await fetch(mcpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mcpToken}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "execute_command",
            arguments: {
              command,
              userId,
              systemContext: `User prefers ${prefs.replyTone} tone in replies. Working hours are ${prefs.workingHoursStart}–${prefs.workingHoursEnd} ${prefs.timezone}. Do not schedule events outside working hours.`,
            },
          },
        }),
      });

      if (response.ok) {
        const json = await response.json() as Record<string, unknown>;
        const result = json.result as Record<string, unknown> | undefined;
        const rawActions = (result?.plannedActions ?? []) as PlannedAction[];

        const supabase = createServerSupabaseClient();
        for (const action of rawActions) {
          await supabase.from("agent_actions").insert({
            user_id: userId,
            command,
            status: ACTION_STATUS.PENDING,
            actions_taken: [{ tool: action.tool, input: action.parameters, output: null, executedAt: new Date().toISOString() }],
          });
        }
        return { success: true, plannedActions: rawActions };
      }
    }

    const localActions = parseCommandLocally(command);
    await executeFallbackActions(localActions, command);
    return { success: true, plannedActions: localActions };
  } catch (error: unknown) {
    return {
      success: false,
      plannedActions: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
