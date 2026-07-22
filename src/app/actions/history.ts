"use server";

import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/user";
import type { AgentAction } from "@/types";

export async function getAgentHistory(limit = 50): Promise<{ success: boolean; data?: AgentAction[]; error?: string }> {
  try {
    const userId = await getUserId();
    const db = await getDb();

    if (!db) {
      return { success: true, data: [] }; // Fail open with clean empty list if DB offline
    }

    const collection = db.collection("agent_actions");
    const rows = await collection
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    const formattedData: AgentAction[] = rows.map((row) => ({
      id: row._id.toString(),
      userId: row.user_id,
      command: row.command,
      status: row.status,
      actionsTaken: row.actions_taken || [],
      errorMessage: row.error_message,
      createdAt: row.created_at || new Date().toISOString(),
      completedAt: row.completed_at || new Date().toISOString(),
    }));

    return { success: true, data: formattedData };
  } catch (error: unknown) {
    console.error("History fetch error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
