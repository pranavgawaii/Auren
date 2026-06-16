"use server";

import { analyzeCommand } from "@/agents/executor";
import type { AgentReasoningResult, GmailMessage } from "@/types";

export async function processCommand(
  command: string,
  emailContext: GmailMessage | null
): Promise<{ success: boolean; data?: AgentReasoningResult; error?: string }> {
  try {
    const result = await analyzeCommand(command, emailContext);
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("Agent process error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
