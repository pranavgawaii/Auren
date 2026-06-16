"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
import { getUserId } from "@/lib/user";

export async function getContacts(): Promise<{ success: boolean; data?: { name: string; email: string }[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const userId = await getUserId();

    // Query contacts table ordered by email count
    const { data: contactsData, error: contactsError } = await supabase
      .from("contacts")
      .select("name, email")
      .eq("user_id", userId)
      .order("email_count", { ascending: false });

    if (contactsError) {
      console.error("Error fetching contacts from DB:", contactsError);
    }

    if (contactsData && contactsData.length > 0) {
      return { success: true, data: contactsData };
    }

    // Fallback: extract from emails if contacts is empty
    const { data: emailsData, error: emailsError } = await supabase
      .from("emails")
      .select("from_name, from_email")
      .eq("user_id", userId)
      .limit(100);

    if (emailsError) {
      console.error("Error fetching emails for fallback contacts:", emailsError);
      return { success: false, error: emailsError.message };
    }

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
