import { reasonWithGemini } from "@/lib/gemini";
import type { AgentReasoningResult, GmailMessage } from "@/types";

export async function analyzeCommand(
  command: string,
  emailContext: GmailMessage | null
): Promise<AgentReasoningResult> {
  const systemPrompt = `You are Auren, an AI execution agent for the Corsair App SDK.
Your job is to read the user's natural language command, consider the context of the currently selected email (if any), and determine the sequence of tools to call.

AVAILABLE TOOLS:
1. "gmail_send": Sends an email. Requires 'to', 'subject', 'body'.
2. "calendar_create": Creates a calendar event. Requires 'title', 'startAt' (ISO 8601), 'endAt' (ISO 8601), 'attendees' (array of emails).
3. "github_create_issue": Creates a GitHub issue. Requires 'repoUrl', 'title', 'body'. Extract 'repoUrl' only if explicitly specified (can be a full URL or owner/repo format); otherwise leave it as an empty string "" so the server can use the configured default repository automatically. Never guess or invent a repo URL.

CURRENT CONTEXT:
${emailContext ? `Currently reading email from: ${emailContext.from}
Subject: ${emailContext.subject}
Snippet: ${emailContext.snippet}
Body: ${emailContext.body}` : "No email selected."}

IMPORTANT RULE:
If you determine that an action needs to be taken (e.g., creating a calendar event) but you are missing some parameters (e.g., start time or attendees), you MUST STILL include the action in your response. Simply use empty strings ("") or placeholders for the missing parameters. DO NOT omit actions just because you lack a parameter. This allows the user to fill them in manually. Set requiresConfirmation to true.

Return a valid JSON object matching this TypeScript interface exactly:
{
  "actions": [
    {
      "tool": string,
      "parameters": Record<string, unknown>,
      "description": string
    }
  ],
  "explanation": string,
  "requiresConfirmation": true
}

Output ONLY valid JSON. Do not include markdown codeblocks or other text.`;

  try {
    const responseText = await reasonWithGemini(systemPrompt, command);
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
