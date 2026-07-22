import { auth } from "@clerk/nextjs/server";
import { createHash } from "crypto";

/**
 * Returns the user_id to use for database queries and user isolation.
 */
export async function getUserId(): Promise<string> {
  let clerkUserId: string | null = null;
  try {
    const { userId } = await auth();
    clerkUserId = userId;
  } catch {
    // auth() may throw outside of a Next.js request context
  }

  if (!clerkUserId) {
    throw new Error("Unauthorized: You must be logged in to execute this action.");
  }

  const hash = createHash("sha1").update(clerkUserId).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Returns the raw Clerk user ID string (e.g. "user_xxx").
 */
export async function getClerkUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}
