"use server";

import { getDb } from "@/lib/db";
import { DEMO_USER_ID } from "@/lib/constants";

export async function archiveEmail(emailId: string) {
  try {
    const db = await getDb();
    if (db) {
      await db.collection("emails").updateOne(
        { gmail_id: emailId, user_id: DEMO_USER_ID },
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
