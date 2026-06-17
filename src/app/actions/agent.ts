"use server";

import { analyzeCommand } from "@/agents/executor";
import { checkCommandRateLimit } from "@/lib/rate-limit";
import type { AgentReasoningResult, GmailMessage } from "@/types";
import { currentUser } from "@clerk/nextjs/server";

export async function processCommand(
  command: string,
  emailContext: GmailMessage | null,
  history?: { role: string, content: string }[]
): Promise<{ success: boolean; data?: AgentReasoningResult; error?: string }> {
  try {
    const rateLimit = await checkCommandRateLimit();
    if (!rateLimit.success) {
      return { success: false, error: rateLimit.error };
    }

    const user = await currentUser();
    const userName = user ? (user.fullName || user.firstName || "User") : "User";
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || "Unknown";

    const result = await analyzeCommand(command, emailContext, userName, userEmail, history);
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("Agent process error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
