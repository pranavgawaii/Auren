"use server";

import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/user";

export async function archiveEmail(emailId: string) {
  try {
    if (!emailId) return { success: false, error: "Missing email ID" };

    // SEC-FIX: Resolve authenticated caller on the server — never trust client-supplied userId.
    const userId = await getUserId();
    const db = await getDb();

    if (db) {
      await db.collection("emails").updateOne(
        { gmail_id: emailId, user_id: userId },
        { $set: { is_archived: true } }
      );
    }

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
