"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
import { getUserId } from "@/lib/user";
import type { AgentAction } from "@/types";

export async function getAgentHistory(limit = 50): Promise<{ success: boolean; data?: AgentAction[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const userId = await getUserId();

    const { data, error } = await supabase
      .from("agent_actions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to fetch agent history:", error);
      return { success: false, error: error.message };
    }

    const formattedData: AgentAction[] = (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      command: row.command,
      status: row.status,
      actionsTaken: row.actions_taken || [],
      errorMessage: row.error_message,
      createdAt: row.created_at,
      completedAt: row.completed_at
    }));

    return { success: true, data: formattedData };
  } catch (error: unknown) {
    console.error("History fetch error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
