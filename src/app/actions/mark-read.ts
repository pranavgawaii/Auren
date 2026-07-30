"use server";

import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/user";
import { getTenant } from "@/lib/corsair";

/**
 * Marks an email as read locally and in Gmail.
 *
 * Opening a message previously changed nothing — there was no mark-as-read path at
 * all — so unread/urgent indicators stayed lit after the user had already read the
 * mail. The local DB write is what the UI reads back, so it must succeed even if the
 * Gmail API call fails (offline, token expiry); the label removal is best-effort.
 */
export async function markEmailAsRead(
  gmailId: string
): Promise<{ success: boolean; error?: string }> {
  if (!gmailId) return { success: false, error: "Missing message id" };

  try {
    const userId = await getUserId();
    const db = await getDb();

    if (db) {
      await db.collection("emails").updateOne(
        { user_id: userId, gmail_id: gmailId },
        { $set: { is_read: true } }
      );
    }

    // Best-effort: clear the UNREAD label in Gmail so the change sticks across syncs.
    try {
      const tenant = await getTenant();
      await tenant.run("gmail.api.messages.modify", {
        userId: "me",
        id: gmailId,
        removeLabelIds: ["UNREAD"],
      });
    } catch (err) {
      console.warn("[markEmailAsRead] Gmail label update failed (local state still updated):", err);
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("[markEmailAsRead] error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
