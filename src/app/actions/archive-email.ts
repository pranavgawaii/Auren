"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
import { DEMO_USER_ID } from "@/lib/constants";

export async function archiveEmail(emailId: string) {
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("emails")
      .update({ is_archived: true })
      .eq("id", emailId)
      .eq("user_id", DEMO_USER_ID);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
