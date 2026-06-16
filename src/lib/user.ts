import { auth } from "@clerk/nextjs/server";
import { DEMO_USER_ID } from "@/lib/constants";

/**
 * Returns the user_id to use for database queries.
 *
 * CURRENT ARCHITECTURE:
 * The Supabase `emails` and `calendar_events` tables use a UUID column for user_id.
 * Clerk returns string IDs like "user_3FBQjSir3vCqKmnAXshjgSBgDF1" which are not UUIDs.
 *
 * For now we map the authenticated user to DEMO_USER_ID so the app functions.
 * To support true multi-user isolation, the DB schema's user_id column must be
 * changed from UUID → TEXT (or VARCHAR), then this function can return userId directly.
 *
 * Schema migration needed:
 *   ALTER TABLE emails ALTER COLUMN user_id TYPE TEXT;
 *   ALTER TABLE calendar_events ALTER COLUMN user_id TYPE TEXT;
 *   ALTER TABLE contacts ALTER COLUMN user_id TYPE TEXT;
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

  return DEMO_USER_ID;
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
