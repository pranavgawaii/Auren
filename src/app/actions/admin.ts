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
      
      return {
        id: u.id,
        email,
        name,
        imageUrl,
        isPro,
        commandsUsed,
        resetAt: rl?.commands_reset_at || null,
        supabaseId
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
