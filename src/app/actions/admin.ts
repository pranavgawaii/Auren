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
  };
};

export async function getSystemStatus() {
  const user = await currentUser();
  const adminEmail = user?.emailAddresses[0]?.emailAddress;

  if (adminEmail !== "pranvgg@gmail.com") {
    return { success: false, error: "Unauthorized." };
  }

  const db = await getDb();

  // Reflects the services the app actually calls, not a fixed list of every
  // provider key in .env — GROQ is the live reasoning engine (src/lib/gemini.ts),
  // not Anthropic/OpenAI/Gemini directly, so this used to report the wrong engine
  // as "active" and leave the real one unmonitored.
  return {
    success: true,
    data: {
      groq: !!process.env.GROQ_API_KEY,
      corsair: !!(process.env.CORSAIR_DEV_KEY && process.env.CORSAIR_INSTANCE_ID),
      resend: !!process.env.RESEND_API_KEY,
      clerk: !!process.env.CLERK_SECRET_KEY,
      googleOAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
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

      // Token estimate — there's no per-call token metering on the Groq path today
      // (src/lib/gemini.ts doesn't record usage), so this stays a length-derived
      // approximation, same as before. What's removed is the old 65/25/10 Claude/
      // Gemini/Sonnet split: the app only ever calls Groq's Llama 3.3 70B for
      // reasoning, so presenting a three-model breakdown was fabricated, not
      // rounded — none of those models are in the request path.
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
        tokenConsumption: { inputTokens, outputTokens, totalTokens }
      };
    }));

    let globalTotalTokens = 0;
    adminUsers.forEach(u => { globalTotalTokens += u.tokenConsumption?.totalTokens || 0; });

    // Real, not estimated: every action row carries a status, so these counts
    // come straight out of the same query already run above.
    const statusBreakdown = {
      completed: actions.filter((a: any) => a.status === "completed").length,
      failed: actions.filter((a: any) => a.status === "failed").length,
      pending: actions.filter((a: any) => a.status !== "completed" && a.status !== "failed").length,
    };

    // Real: derived from the Corsair credential lookups already done per user above.
    const usersWithGoogle = adminUsers.filter(u => u.integrations?.some(i => i.provider === "google")).length;
    const usersWithGithub = adminUsers.filter(u => u.integrations?.some(i => i.provider === "github")).length;
    const integrationBreakdown = {
      google: usersWithGoogle,
      github: usersWithGithub,
      googlePct: adminUsers.length ? Math.round((usersWithGoogle / adminUsers.length) * 100) : 0,
      githubPct: adminUsers.length ? Math.round((usersWithGithub / adminUsers.length) * 100) : 0,
    };

    const globalTokenMetrics = {
      totalTokens: globalTotalTokens,
      engine: "Llama 3.3 70B (Groq)",
      tpmLimit: 12000, // Groq free-tier cap that executor.ts now guards against — see src/agents/executor.ts
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
        globalRecentCommands,
        statusBreakdown,
        integrationBreakdown,
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
