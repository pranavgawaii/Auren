"use server";

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { createHash } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase";
import { RATE_LIMITS } from "@/lib/rate-limit";

export type AdminUser = {
  id: string; // Clerk ID
  email: string;
  name: string;
  imageUrl: string;
  isPro: boolean;
  commandsUsed: number;
  resetAt: string | null;
  supabaseId: string;
  integrations?: { provider: string; status: string; connectedAt: string | null }[];
  recentCommands?: { id: string; command: string; status: string; createdAt: string }[];
  tokenConsumption?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
    byModel: { modelName: string; tokens: number; percentage: number }[];
  };
};

export async function getSystemStatus() {
  const user = await currentUser();
  const adminEmail = user?.emailAddresses[0]?.emailAddress;

  if (adminEmail !== "pranvgg@gmail.com") {
    return { success: false, error: "Unauthorized." };
  }

  return {
    success: true,
    data: {
      gemini: !!process.env.GEMINI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    }
  };
}

export async function getAdminAnalytics() {
  try {
    const user = await currentUser();
    const adminEmail = user?.emailAddresses[0]?.emailAddress;

    if (adminEmail !== "pranvgg@gmail.com") {
      return { success: false, error: "Unauthorized. You are not the admin." };
    }

    const client = await clerkClient();
    const users = await client.users.getUserList({ limit: 100 });
    
    const supabase = createServerSupabaseClient();
    const { data: rateLimits } = await supabase.from("user_rate_limits").select("*");
    const { data: integrations } = await supabase.from("integrations").select("*");
    const { data: actions } = await supabase.from("agent_actions").select("*").order("created_at", { ascending: false });
    
    let totalCommands = 0;
    
    const adminUsers: AdminUser[] = users.data.map((u) => {
      const email = u.emailAddresses[0]?.emailAddress || "unknown";
      const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || email;
      const isPro = u.publicMetadata?.isPro === true || u.publicMetadata?.plan === "pro";
      const imageUrl = u.imageUrl || "";
      
      const hash = createHash("sha1").update(u.id).digest("hex");
      const supabaseId = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
      
      const rl = rateLimits?.find(r => r.user_id === supabaseId);
      const commandsUsed = rl?.commands_count || 0;
      totalCommands += commandsUsed;
      
      // User specific integrations
      const userIntegrations = integrations
        ?.filter(i => i.user_id === supabaseId)
        ?.map(i => ({
          provider: i.provider,
          status: i.status,
          connectedAt: i.connected_at
        })) || [];

      // User specific recent actions
      const userActions = actions?.filter(a => a.user_id === supabaseId) || [];
      const recentCommands = userActions.slice(0, 10).map(a => ({
        id: a.id,
        command: a.command,
        status: a.status,
        createdAt: a.created_at
      }));

      // Calculate token metrics for this user
      let inputTokens = 0;
      let outputTokens = 0;
      
      userActions.forEach(action => {
        inputTokens += 400 + (action.command.length * 3);
        outputTokens += 600;
        
        const actionsCount = Array.isArray(action.actions_taken) ? action.actions_taken.length : 0;
        inputTokens += actionsCount * 1200;
        outputTokens += actionsCount * 800;
      });
      
      const totalTokens = inputTokens + outputTokens;
      const estimatedCost = (inputTokens * 0.000003) + (outputTokens * 0.000015);
      
      const sonnetTokens = Math.round(totalTokens * 0.65);
      const haikuTokens = Math.round(totalTokens * 0.25);
      const geminiTokens = Math.round(totalTokens * 0.10);
      
      const byModel = [
        { modelName: "Claude 3.5 Sonnet", tokens: sonnetTokens, percentage: 65 },
        { modelName: "Claude 3 Haiku", tokens: haikuTokens, percentage: 25 },
        { modelName: "Gemini 1.5 Pro", tokens: geminiTokens, percentage: 10 }
      ];
      
      return {
        id: u.id,
        email,
        name,
        imageUrl,
        isPro,
        commandsUsed,
        resetAt: rl?.commands_reset_at || null,
        supabaseId,
        integrations: userIntegrations,
        recentCommands,
        tokenConsumption: {
          inputTokens,
          outputTokens,
          totalTokens,
          estimatedCost,
          byModel
        }
      };
    });
    
    return { 
      success: true, 
      data: {
        users: adminUsers,
        totalUsers: adminUsers.length,
        proUsers: adminUsers.filter(u => u.isPro).length,
        totalCommands,
        limit: RATE_LIMITS.COMMANDS_PER_HOUR
      }
    };
  } catch (error: any) {
    console.error("Failed to fetch analytics:", error);
    return { success: false, error: "Failed to fetch data." };
  }
}

export async function toggleAurenPro(clerkUserId: string, targetStatus: boolean) {
  try {
    const user = await currentUser();
    const adminEmail = user?.emailAddresses[0]?.emailAddress;

    if (adminEmail !== "pranvgg@gmail.com") {
      return { success: false, error: "Unauthorized." };
    }

    const client = await clerkClient();
    const targetUser = await client.users.getUser(clerkUserId);
    
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        ...targetUser.publicMetadata,
        isPro: targetStatus,
      }
    });
    return { success: true, message: `Successfully ${targetStatus ? "granted" : "revoked"} Auren Pro.` };
  } catch (error: any) {
    console.error("Failed to toggle pro:", error);
    return { success: false, error: error.message || "Failed to update Pro status." };
  }
}

export async function resetUserRateLimit(supabaseUserId: string) {
  try {
    const user = await currentUser();
    const adminEmail = user?.emailAddresses[0]?.emailAddress;
    if (adminEmail !== "pranvgg@gmail.com") {
      return { success: false, error: "Unauthorized." };
    }
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("user_rate_limits")
      .update({
        commands_count: 0,
        commands_reset_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      })
      .eq("user_id", supabaseUserId);
    if (error) throw error;
    return { success: true, message: "Successfully reset user rate limits." };
  } catch (error: any) {
    console.error("Failed to reset rate limit:", error);
    return { success: false, error: error.message || "Failed to reset limits." };
  }
}

export async function deleteUserAccount(clerkUserId: string) {
  try {
    const user = await currentUser();
    const adminEmail = user?.emailAddresses[0]?.emailAddress;
    if (adminEmail !== "pranvgg@gmail.com") {
      return { success: false, error: "Unauthorized." };
    }
    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);
    return { success: true, message: "Successfully deleted user account." };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { success: false, error: error.message || "Failed to delete user." };
  }
}
