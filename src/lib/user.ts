import { auth } from "@clerk/nextjs/server";
import { createHash } from "crypto";

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
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
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
