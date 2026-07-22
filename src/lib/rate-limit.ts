import { getDb } from "./db";
import { getUserId } from "./user";
import { currentUser } from "@clerk/nextjs/server";

export const RATE_LIMITS = {
  COMMANDS_PER_HOUR: 1000,
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

    const db = await getDb();
    if (!db) return { success: true }; // Fail open for 100% uptime if DB offline

    const collection = db.collection("user_rate_limits");
    const data = await collection.findOne({ user_id: userId });
    const now = new Date();

    if (!data) {
      await collection.insertOne({
        user_id: userId,
        commands_count: 1,
        commands_reset_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      });
      return { success: true };
    }

    const resetTime = new Date(data.commands_reset_at || Date.now());
    if (now > resetTime) {
      await collection.updateOne(
        { user_id: userId },
        {
          $set: {
            commands_count: 1,
            commands_reset_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
          },
        }
      );
      return { success: true };
    }

    if ((data.commands_count || 0) >= RATE_LIMITS.COMMANDS_PER_HOUR) {
      return { 
        success: false, 
        error: `Rate limit exceeded. You can run up to ${RATE_LIMITS.COMMANDS_PER_HOUR} commands per hour.` 
      };
    }

    await collection.updateOne(
      { user_id: userId },
      { $inc: { commands_count: 1 } }
    );

    return { success: true };
  } catch (err) {
    console.error("Rate limit check failed:", err);
    return { success: true }; // Fail open
  }
}

export async function checkSyncRateLimit(): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    const db = await getDb();
    if (!db) return { success: true }; // Fail open

    const collection = db.collection("user_rate_limits");
    const data = await collection.findOne({ user_id: userId });
    const now = new Date();

    if (!data) {
      await collection.insertOne({
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

    await collection.updateOne(
      { user_id: userId },
      { $set: { last_sync_at: now.toISOString() } }
    );

    return { success: true };
  } catch (err) {
    console.error("Sync rate limit check failed:", err);
    return { success: true };
  }
}
