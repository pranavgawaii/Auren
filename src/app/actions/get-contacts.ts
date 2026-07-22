"use server";

import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/user";

export async function getContacts(): Promise<{ success: boolean; data?: { name: string; email: string }[]; error?: string }> {
  try {
    const userId = await getUserId();
    const db = await getDb();

    if (!db) {
      return { success: true, data: [] };
    }

    const contactsData = await db.collection("contacts")
      .find({ user_id: userId })
      .sort({ email_count: -1 })
      .toArray();

    if (contactsData && contactsData.length > 0) {
      return { success: true, data: contactsData.map(c => ({ name: c.name, email: c.email })) };
    }

    // Fallback: extract from emails if contacts is empty
    const emailsData = await db.collection("emails")
      .find({ user_id: userId })
      .limit(100)
      .toArray();

    const uniqueContacts = new Map<string, string>();
    (emailsData || []).forEach(e => {
      if (e.from_email) {
        const name = e.from_name || e.from_email.split("@")[0];
        uniqueContacts.set(e.from_email, name);
      }
    });

    const fallbackData = Array.from(uniqueContacts.entries()).map(([email, name]) => ({ name, email }));
    return { success: true, data: fallbackData };
  } catch (error: any) {
    console.error("Unexpected error in getContacts action:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
