import { reasonWithAI } from "@/lib/gemini";
import type { AgentReasoningResult, GmailMessage } from "@/types";

export async function analyzeCommand(
  command: string,
  emailContext: GmailMessage | null,
  userName: string = "User",
  userEmail: string = "Unknown",
  history?: { role: string, content: string }[]
): Promise<AgentReasoningResult> {
  const systemPrompt = `You are Auren, an AI execution agent for the Corsair App SDK.
Your job is to read the user's natural language command, consider the context of the currently selected email (if any), and determine the sequence of tools to call.

AVAILABLE TOOLS:
1. "gmail_send": Sends an email. Requires 'to', 'subject', 'body'.
2. "calendar_create": Creates a calendar event. Requires 'title', 'startAt' (ISO 8601), 'endAt' (ISO 8601), 'attendees' (array of emails).
3. "github_create_issue": Creates a GitHub issue. Requires 'repoUrl', 'title', 'body', 'assignees' (array of strings), 'labels' (array of strings). Extract 'repoUrl' only if explicitly specified; otherwise leave it as "". Never guess a repo URL.
4. "github_list_issues": Lists open issues in a repository. Requires 'repoUrl', 'state' ("open"|"closed"|"all"), 'labels' (array of strings).
5. "github_review_pr": Creates a Pull Request review. Requires 'repoUrl', 'pullNumber' (number), 'body' (string), 'event' ("COMMENT"|"APPROVE"|"REQUEST_CHANGES").

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
- @Pranav Gawai -> pranavgawai1518@gmail.com
- @Product Team -> product@example.com
- github/Auren -> https://github.com/8TEEH/Auren
- github/skills-introduction-to-github -> https://github.com/8TEEH/skills-introduction-to-github

PREVIOUS CHAT HISTORY:
${history && history.length > 0 ? history.map((h) => `[${h.role.toUpperCase()}] ${h.content || (h as any).plan?.explanation || 'System Plan/Action generated'}`).join('\n') : "None"}

IMPORTANT RULES FOR PARAMETERS & MISSING CONTEXT:
1. AVOID FOLLOW-UP QUESTIONS IF POSSIBLE: Do not bombard the user with questions for every missing detail (like email body, subject, or meeting time).
2. USE PLACEHOLDERS: If the user provides partial information, generate the action cards immediately. Use reasonable defaults or placeholders (e.g., "Discuss login bug" for a subject, or tomorrow at 10:00 AM for a meeting) for any missing fields.
3. If the user provides a name for an email recipient (e.g. "to Pranav Gawai"), try to deduce their email if obvious or format it as "Name <email@example.com>".
4. For email body signatures, always use the User Name provided above (e.g., "Best regards, ${userName}"). DO NOT use placeholders like "[Your Name]".
5. Only use 'followUpQuestion' if a TRULY CRITICAL piece of information is missing (like the repository URL) AND you absolutely cannot guess a placeholder. Otherwise, output the actions.

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
    const result = JSON.parse(responseText.trim()) as AgentReasoningResult;
    return result;
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
