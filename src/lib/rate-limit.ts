import { createServerSupabaseClient } from "./supabase";
import { getUserId } from "./user";
import { currentUser } from "@clerk/nextjs/server";

export const RATE_LIMITS = {
  COMMANDS_PER_HOUR: 1000, // Increased default limit for development
  SYNC_COOLDOWN_MS: 3 * 60 * 1000, // 3 minutes
};

export async function checkCommandRateLimit(): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    
    // Check for Auren Pro in Clerk metadata
    const user = await currentUser();
    const isPro = user?.publicMetadata?.isPro === true || 
                  user?.publicMetadata?.plan === "pro" || 
                  user?.publicMetadata?.tier === "pro";
                  
    if (isPro) {
      return { success: true }; // Unlimited for Pro users
    }

    const supabase = createServerSupabaseClient();

    // Fetch current rate limit record
    const { data, error } = await supabase
      .from("user_rate_limits")
      .select("*")
      .eq("user_id", userId)
      .single();

    const now = new Date();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is fine (first time)
      console.error("Rate limit fetch error:", error);
      return { success: true }; // Fail open so we don't break app on DB error
    }

    if (!data) {
      // Create first record
      await supabase.from("user_rate_limits").insert({
        user_id: userId,
        commands_count: 1,
        commands_reset_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      });
      return { success: true };
    }

    // Check if reset time has passed
    const resetTime = new Date(data.commands_reset_at);
    if (now > resetTime) {
      // Reset counter
      await supabase
        .from("user_rate_limits")
        .update({
          commands_count: 1,
          commands_reset_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        })
        .eq("user_id", userId);
      return { success: true };
    }

    // Check if over limit
    if (data.commands_count >= RATE_LIMITS.COMMANDS_PER_HOUR) {
      return { 
        success: false, 
        error: `Rate limit exceeded. You can run up to ${RATE_LIMITS.COMMANDS_PER_HOUR} commands per hour. Upgrade to Auren Pro for unlimited access.` 
      };
    }

    // Increment counter
    await supabase
      .from("user_rate_limits")
      .update({
        commands_count: data.commands_count + 1,
      })
      .eq("user_id", userId);

    return { success: true };
  } catch (err) {
    console.error("Rate limit check failed:", err);
    return { success: true }; // Fail open
  }
}

export async function checkSyncRateLimit(): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("user_rate_limits")
      .select("*")
      .eq("user_id", userId)
      .single();

    const now = new Date();

    if (error && error.code !== "PGRST116") {
      return { success: true };
    }

    if (!data) {
      await supabase.from("user_rate_limits").insert({
        user_id: userId,
        last_sync_at: now.toISOString(),
      });
      return { success: true };
    }

    if (data.last_sync_at) {
      const lastSync = new Date(data.last_sync_at);
      if (now.getTime() - lastSync.getTime() < RATE_LIMITS.SYNC_COOLDOWN_MS) {
        return { 
          success: false, 
          error: `Sync is on cooldown. Please wait before syncing again.` 
        };
      }
    }

    await supabase
      .from("user_rate_limits")
      .update({
        last_sync_at: now.toISOString(),
      })
      .eq("user_id", userId);

    return { success: true };
  } catch (err) {
    console.error("Sync rate limit check failed:", err);
    return { success: true };
  }
}
