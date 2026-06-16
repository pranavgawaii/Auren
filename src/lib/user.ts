import { auth, currentUser } from "@clerk/nextjs/server";
import { createHash } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase";

/**
 * Ensures a corresponding user exists in Supabase Auth so that any table rows
 * referencing auth.users do not violate foreign key constraints.
 */
async function ensureSupabaseUser(userId: string): Promise<void> {
  try {
    const user = await currentUser();
    if (!user) return;
    
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return;

    const supabase = createServerSupabaseClient();
    
    // Attempt to create the user in Supabase Auth
    await supabase.auth.admin.createUser({
      id: userId,
      email: email,
      email_confirm: true,
      user_metadata: { source: "clerk_sync" }
    });
  } catch (err) {
    // Ignore if user already exists
  }
}

/**
 * Returns the user_id to use for database queries.
 *
 * We hash the Clerk user ID (e.g., "user_xxx") into a deterministic UUIDv5-like format
 * to fit into the database's UUID column type. This ensures perfect multi-user isolation.
 */
export async function getUserId(): Promise<string> {
  let clerkUserId: string | null = null;
  try {
    const { userId } = auth();
    clerkUserId = userId;
  } catch {
    // auth() may throw outside of a Next.js request context (e.g., during static analysis or builds)
  }

  if (!clerkUserId) {
    throw new Error("Unauthorized: You must be logged in to execute this action.");
  }

  const hash = createHash("sha1").update(clerkUserId).digest("hex");
  const userId = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;

  // Provision in Supabase Auth in the background to ensure FK checks pass
  ensureSupabaseUser(userId).catch(() => {});

  return userId;
}

/**
 * Returns the raw Clerk user ID string (e.g. "user_xxx").
 * Use this for non-DB operations like logging or analytics.
 */
export async function getClerkUserId(): Promise<string | null> {
  try {
    const { userId } = auth();
    return userId;
  } catch {
    return null;
  }
}
