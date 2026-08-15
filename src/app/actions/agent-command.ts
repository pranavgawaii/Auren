"use server";

import { getDb } from "@/lib/db";
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
    const db = await getDb();
    if (db) {
      const data = await db.collection("user_preferences").findOne({ user_id: userId });
      if (data) {
        return {
          replyTone: String(data.reply_tone ?? DEFAULT_REPLY_TONE),
          workingHoursStart: String(data.working_hours_start ?? DEFAULT_WORKING_HOURS_START),
          workingHoursEnd: String(data.working_hours_end ?? DEFAULT_WORKING_HOURS_END),
          timezone: String(data.timezone ?? DEFAULT_TIMEZONE),
        };
      }
    }
    return {
      replyTone: DEFAULT_REPLY_TONE,
      workingHoursStart: DEFAULT_WORKING_HOURS_START,
      workingHoursEnd: DEFAULT_WORKING_HOURS_END,
      timezone: DEFAULT_TIMEZONE,
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

function parseCommandLocally(command: string): PlannedAction[] {
  const actions: PlannedAction[] = [];
  const lower = command.toLowerCase();

  if (lower.includes("meeting") || lower.includes("event") || lower.includes("calendar") || lower.includes("schedule")) {
    const start = new Date(Date.now() + 3600 * 1000);
    const end = new Date(start.getTime() + 3600 * 1000);
    actions.push({
      tool: "calendar_create",
      description: `Create calendar event: ${command}`,
      parameters: { title: command, startAt: start.toISOString(), endAt: end.toISOString() },
    });
  }

  if (lower.includes("issue") || lower.includes("github") || lower.includes("bug")) {
    actions.push({
      tool: "github_create_issue",
      description: `Create GitHub issue: ${command}`,
      parameters: { title: command, body: `Created from agent command: ${command}` },
    });
  }

  // BUG-11: Never produce actions with a hardcoded placeholder recipient.
  // Email and catch-all fallback actions have been removed; the main agent
  // flow (processCommand / analyzeCommand) handles email intents correctly.

  return actions;
}

async function executeFallbackActions(actions: PlannedAction[], command: string) {
  for (const action of actions) {
    if (action.tool === "calendar_create") {
      const p = action.parameters as Record<string, string>;
      await createCalendarEvent({ title: p.title || command, startAt: p.startAt, endAt: p.endAt, attendees: [] });
    } else if (action.tool === "github_create_issue") {
      const p = action.parameters as Record<string, string>;
      await createGithubIssue({ title: p.title || command, body: p.body || "" });
    }
    // BUG-11: gmail_send removed — never execute a send to a placeholder address.
  }
}

export async function processAgentCommand(
  command: string,
  userId: string,
  _emailContextId?: string
): Promise<AgentCommandResult> {
  try {
    const prefs = await fetchUserPreferences(userId);
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (anthropicKey) {
      const prompt = `User preferences: ${JSON.stringify(prefs)}. Analyze command: "${command}". Return JSON with plannedActions array.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        // BUG-02: Anthropic Messages API response shape is
        // { content: [{ type: "text", text: "..." }] }, NOT { result: { ... } }.
        const text = json.content?.[0]?.text ?? "{}";
        let parsed: Record<string, unknown> = {};
        try { parsed = JSON.parse(text); } catch { /* fallback to empty */ }
        const rawActions = (parsed?.plannedActions ?? []) as PlannedAction[];

        const db = await getDb();
        if (db) {
          for (const action of rawActions) {
            await db.collection("agent_actions").insertOne({
              user_id: userId,
              command,
              status: ACTION_STATUS.PENDING,
              actions_taken: [{ tool: action.tool, input: action.parameters, output: null, executedAt: new Date().toISOString() }],
              created_at: new Date().toISOString(),
            });
          }
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
