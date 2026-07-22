"use server";

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { createHash } from "crypto";
import { getDb } from "@/lib/db";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { getCorsairInstance } from "@/lib/corsair";

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

  const db = await getDb();

  return {
    success: true,
    data: {
      gemini: !!process.env.GEMINI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      database: !!db,
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
    
    const db = await getDb();
    const rateLimits = db ? await db.collection("user_rate_limits").find({}).toArray() : [];
    const actions = db ? await db.collection("agent_actions").find({}).sort({ created_at: -1 }).toArray() : [];
    
    let totalCommands = 0;
    const inst = getCorsairInstance();
    
    const adminUsers: AdminUser[] = await Promise.all(users.data.map(async (u) => {
      const email = u.emailAddresses[0]?.emailAddress || "unknown";
      const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || email;
      const isPro = u.publicMetadata?.isPro === true || u.publicMetadata?.plan === "pro";
      const imageUrl = u.imageUrl || "";
      
      const hash = createHash("sha1").update(u.id).digest("hex");
      const supabaseId = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
      
      const rl = rateLimits?.find(r => r.user_id === supabaseId);
      const commandsUsed = rl?.commands_count || 0;
      totalCommands += commandsUsed;
      
      // Fetch real integrations from Corsair
      let userIntegrations: any[] = [];
      try {
        const [gmail, calendar, githubCredentials] = await Promise.all([
          inst.plugins.credentials.list("gmail", supabaseId).catch(() => ({ fields: [] })),
          inst.plugins.credentials.list("googlecalendar", supabaseId).catch(() => ({ fields: [] })),
          inst.plugins.credentials.list("github", supabaseId).catch(() => ({ fields: [] }))
        ]);
        
        const googleConnected = (gmail.fields?.find((f: any) => f.field === "access_token")?.set) || 
                                (calendar.fields?.find((f: any) => f.field === "access_token")?.set);
        const githubConnected = githubCredentials.fields?.find((f: any) => f.field === "access_token")?.set;
        
        if (googleConnected) userIntegrations.push({ provider: "google", status: "connected", connectedAt: new Date().toISOString() });
        if (githubConnected) userIntegrations.push({ provider: "github", status: "connected", connectedAt: new Date().toISOString() });
      } catch (err) {
        console.error(`Failed to fetch corsair credentials for ${supabaseId}:`, err);
      }

      // User specific recent actions
      const userActions = actions?.filter(a => a.user_id === supabaseId) || [];
      const recentCommands = userActions.slice(0, 10).map(a => ({
        id: a._id ? a._id.toString() : String(a.id || Math.random()),
        command: a.command,
        status: a.status,
        createdAt: a.created_at || new Date().toISOString()
      }));

      // Calculate token metrics for this user
      let inputTokens = 0;
      let outputTokens = 0;
      
      userActions.forEach(action => {
        inputTokens += 400 + ((action.command || "").length * 3);
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
    }));
    
    let globalTotalTokens = 0;
    let globalEstimatedCost = 0;
    let globalSonnetTokens = 0;
    let globalHaikuTokens = 0;
    let globalGeminiTokens = 0;

    adminUsers.forEach(u => {
      if (u.tokenConsumption) {
        globalTotalTokens += u.tokenConsumption.totalTokens;
        globalEstimatedCost += u.tokenConsumption.estimatedCost;
        const sonnet = u.tokenConsumption.byModel.find(m => m.modelName.includes("Sonnet"))?.tokens || 0;
        const haiku = u.tokenConsumption.byModel.find(m => m.modelName.includes("Haiku"))?.tokens || 0;
        const gemini = u.tokenConsumption.byModel.find(m => m.modelName.includes("Gemini"))?.tokens || 0;
        globalSonnetTokens += sonnet;
        globalHaikuTokens += haiku;
        globalGeminiTokens += gemini;
      }
    });

    const globalTokenMetrics = {
      totalTokens: globalTotalTokens,
      estimatedCost: globalEstimatedCost,
      byModel: [
        { 
          modelName: "Claude 3.5 Sonnet (OpenRouter)", 
          tokens: globalSonnetTokens, 
          percentage: globalTotalTokens > 0 ? Math.round((globalSonnetTokens / globalTotalTokens) * 100) : 0 
        },
        { 
          modelName: "Claude 3 Haiku (Direct)", 
          tokens: globalHaikuTokens, 
          percentage: globalTotalTokens > 0 ? Math.round((globalHaikuTokens / globalTotalTokens) * 100) : 0 
        },
        { 
          modelName: "Gemini 1.5 Pro (Workspace Mappings)", 
          tokens: globalGeminiTokens, 
          percentage: globalTotalTokens > 0 ? Math.round((globalGeminiTokens / globalTotalTokens) * 100) : 0 
        }
      ]
    };
    
    const globalRecentCommands = (actions || []).slice(0, 100).map((a: any) => {
      const user = adminUsers.find(u => u.supabaseId === a.user_id);
      return {
        id: a._id ? a._id.toString() : String(a.id || Math.random()),
        userEmail: user?.email || "Unknown",
        userName: user?.name || "Unknown",
        userImage: user?.imageUrl || "",
        command: a.command,
        status: a.status,
        createdAt: a.created_at || new Date().toISOString()
      };
    });

    return { 
      success: true, 
      data: {
        users: adminUsers,
        totalUsers: adminUsers.length,
        proUsers: adminUsers.filter(u => u.isPro).length,
        totalCommands,
        limit: RATE_LIMITS.COMMANDS_PER_HOUR,
        globalTokenMetrics,
        globalRecentCommands
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
    const db = await getDb();
    if (db) {
      await db.collection("user_rate_limits").updateOne(
        { user_id: supabaseUserId },
        {
          $set: {
            commands_count: 0,
            commands_reset_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
          }
        }
      );
    }
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
