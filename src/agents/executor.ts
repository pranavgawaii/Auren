import { reasonWithAI } from "@/lib/gemini";
import type { AgentReasoningResult, GmailMessage } from "@/types";

export async function analyzeCommand(
  command: string,
  emailContext: GmailMessage | null,
  userName: string = "User",
  userEmail: string = "Unknown",
  history?: { role: string, content: string }[],
  teamContacts: { name: string; email: string; role?: string }[] = []
): Promise<AgentReasoningResult> {
  const systemPrompt = `You are Auren, an AI execution agent for the Corsair App SDK.
Your job is to read the user's natural language command, consider the context of the currently selected email (if any), and determine the sequence of tools to call.

AVAILABLE TOOLS:
1. "gmail_send": Sends an email. Requires 'to', 'subject', 'body'.
2. "calendar_create": Creates a calendar event. Requires 'title', 'startAt' (ISO 8601), 'endAt' (ISO 8601), 'attendees' (array of emails). Optional: 'withMeetLink' (boolean) — set to TRUE when the user asks for a Google Meet link, video call, meeting link, or any virtual/online meeting. When true, Auren will auto-generate and attach a Google Meet URL to the event.
3. "github_create_issue": Creates a GitHub issue. Requires 'repoUrl', 'title', 'body', 'assignees' (array of strings), 'labels' (array of strings). Extract 'repoUrl' only if explicitly specified; otherwise leave it as "". Never guess a repo URL.
4. "github_list_issues": Lists open issues in a repository. Requires 'repoUrl', 'state' ("open"|"closed"|"all"), 'labels' (array of strings).
5. "github_review_pr": Creates a Pull Request review. Requires 'repoUrl', 'pullNumber' (number), 'body' (string), 'event' ("COMMENT"|"APPROVE"|"REQUEST_CHANGES").

MEET LINK CHAINING RULE: If the user asks to both schedule a meeting AND email someone the link, ALWAYS place "calendar_create" (with "withMeetLink": true) BEFORE any "gmail_send" action in the actions array. Auren's execution engine will automatically inject the generated Meet link into the email body before sending.

CURRENT CONTEXT:
Current Date/Time (Asia/Kolkata): ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
NOTE: The user is in IST (UTC+05:30). All calendar 'startAt' and 'endAt' ISO 8601 strings MUST use the +05:30 timezone offset (e.g. "2026-06-18T10:00:00+05:30"). Do NOT use "Z" if the user implies their local time.
${emailContext ? `Currently reading email from: ${emailContext.from}
Subject: ${emailContext.subject}
Snippet: ${emailContext.snippet}
Body: ${emailContext.body}` : "No email selected."}
User Name: ${userName}
User Email: ${userEmail}

RESOLVED MENTIONS MAP (Use these to resolve clean mentions in the prompt to their actual values):
${teamContacts.length > 0
  ? teamContacts.map(c => `- @${c.name} -> ${c.email}${c.role ? ` (${c.role})` : ""}`).join("\n")
  : "- @Pranav Gawai -> pranavgawai1518@gmail.com"}
- github/Auren -> https://github.com/8TEEH/Auren
- github/skills-introduction-to-github -> https://github.com/8TEEH/skills-introduction-to-github

PREVIOUS CHAT HISTORY:
${history && history.length > 0 ? history.map((h) => `[${h.role.toUpperCase()}] ${h.content || (h as any).plan?.explanation || 'System Plan/Action generated'}`).join('\n') : "None"}

IMPORTANT RULES FOR PARAMETERS & MISSING CONTEXT:
1. NEVER LEAVE PARAMETERS EMPTY: Every action in the 'actions' array MUST have filled-in, meaningful parameters. NEVER output empty strings ("") or empty arrays ([]) for 'to', 'subject', 'body', 'title', or 'attendees'.
2. GMAIL_SEND PARAMETERS: Must always include 'to' (single resolved email string like "pranavgawai1518@gmail.com"), 'subject' (descriptive subject like "Google Meet Link / Meeting Sync"), and 'body' (full friendly email message text). Never include '@' symbol in greetings (write "Hello Pranav," NOT "Hello @Pranav Gawai"). If a Google Meet call is scheduled, include "📹 Google Meet Link: [Auto-generated upon execution]" inside the draft body text.
3. CALENDAR_CREATE PARAMETERS: Must always include 'title' (event summary string like "Google Meet Sync with Pranav Gawai"), 'startAt' (ISO 8601 string), 'endAt' (ISO 8601 string), 'attendees' (array of emails), and 'withMeetLink' (boolean).
4. RESOLVING MENTIONS: If the user types a mention like "@Pranav Gawai", look up their email from RESOLVED MENTIONS MAP above and use their exact email address (e.g. "pranavgawai1518@gmail.com") in both 'to' and 'attendees'.
5. USE PLACEHOLDERS FOR MISSING DETAILS: If the user didn't specify an email body or subject, write a clear professional default body and subject instead of leaving them empty.
6. For email body signatures, always use the User Name provided above ("Best regards, ${userName}"). DO NOT use placeholders like "[Your Name]".

Return a valid JSON object matching this TypeScript interface exactly:
{
  "actions": PlannedAction[],
  "briefing"?: DailyBriefingData, // ONLY IF the user explicitly asks for a daily report/briefing. Do NOT generate standard actions if doing a briefing. Just generate a rich, realistic mock briefing.
  "explanation": string, // Provide a friendly, concise message confirming what you've set up, or what you found.
  "followUpQuestion"?: string, // Optional. Use if you absolutely need missing context.
  "requiresConfirmation": boolean // True if modifying external state via actions. False if just answering questions or providing a briefing.
}

If returning a briefing, format it matching:
{
  "schedule": [{ "time": string, "title": string, "type": "meeting" | "focus" | "reminder" }],
  "emails": [{ "sender": string, "subject": string, "isUrgent": boolean }],
  "github": [{ "repo": string, "prsToReview": number, "issuesAssigned": number }],
  "summaryText": string
}`;

  try {
    const responseText = await reasonWithAI(systemPrompt, command);
    const result = JSON.parse(responseText.trim()) as any;

    // Normalize actions parameter format (LLMs like Llama often name it 'params', 'args', or 'input')
    if (result && Array.isArray(result.actions)) {
      result.actions = result.actions.map((act: any) => {
        const rawParams = act.parameters || act.params || act.input || act.args || {};
        const parameters: Record<string, unknown> = { ...rawParams };

        // Normalize aliases for tools
        if (act.tool === "gmail_send") {
          if (!parameters.to && rawParams.recipient) parameters.to = rawParams.recipient;
          if (!parameters.to && rawParams.email) parameters.to = rawParams.email;
          if (!parameters.to && Array.isArray(rawParams.attendees) && rawParams.attendees.length > 0) {
            parameters.to = rawParams.attendees[0];
          }
          if (!parameters.subject && rawParams.title) parameters.subject = rawParams.title;
          if (!parameters.body && rawParams.content) parameters.body = rawParams.content;
          if (!parameters.body && rawParams.text) parameters.body = rawParams.text;
          if (!parameters.body && rawParams.message) parameters.body = rawParams.message;
        }

        if (act.tool === "calendar_create") {
          if (!parameters.title && rawParams.summary) parameters.title = rawParams.summary;
          if (!parameters.title && rawParams.name) parameters.title = rawParams.name;
          if (!parameters.title && rawParams.subject) parameters.title = rawParams.subject;
          if (!parameters.attendees && rawParams.to) {
            parameters.attendees = Array.isArray(rawParams.to) ? rawParams.to : [String(rawParams.to)];
          }
          if (!parameters.attendees && rawParams.recipient) {
            parameters.attendees = [String(rawParams.recipient)];
          }
        }

        return {
          tool: act.tool,
          parameters,
          description: act.description || act.summary || `${act.tool.replace(/_/g, " ")} action`,
        };
      });
    }

    return result as AgentReasoningResult;
  } catch (error) {
    console.error("Failed to parse agent reasoning result:", error);
    const errMsg = error instanceof Error ? error.message : "";
    return {
      actions: [],
      explanation: errMsg.includes("429") || errMsg.includes("Quota") 
        ? "Google Gemini API Quota exceeded. Please try again later."
        : "Failed to understand command or API error. Please try again.",
      requiresConfirmation: true,
    };
  }
}
