"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
import { z } from "zod";

const emailSchema = z.string().email();

interface WaitlistResult {
  success: boolean;
  position?: number;
  error?: string;
}

export async function getWaitlistCount(): Promise<number> {
  try {
    const supabase = createServerSupabaseClient();
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });
    
    return count ?? 0;
  } catch {
    return 0;
  }
}

const detailsSchema = z.object({
  useCase: z.string().max(100).optional().or(z.literal("")),
  source: z.string().max(100).optional().or(z.literal("")),
});

export async function joinWaitlist(email: string, useCase?: string, source?: string): Promise<WaitlistResult> {
  try {
    const emailParsed = emailSchema.safeParse(email);
    if (!emailParsed.success) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const detailsParsed = detailsSchema.safeParse({ useCase, source });
    if (!detailsParsed.success) {
      return { success: false, error: "Invalid form input." };
    }

    const validEmail = emailParsed.data;
    const validUseCase = detailsParsed.data.useCase || null;
    const validSource = detailsParsed.data.source || null;

    const supabase = createServerSupabaseClient();

    // Check if user is already on the waitlist
    const { data: existingUser } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", validEmail)
      .single();

    if (existingUser) {
      return { success: false, error: "You are already on the waitlist!" };
    }

    const { error: insertError } = await supabase
      .from("waitlist")
      .insert({ 
        email: validEmail,
        use_case: validUseCase,
        source: validSource
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return { success: false, error: "Failed to join waitlist. Please try again." };
    }

    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    try {
      // 1. Clerk Waitlist Entry
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (clerkSecretKey) {
        const res = await fetch("https://api.clerk.com/v1/waitlist_entries", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${clerkSecretKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email_address: validEmail,
            notify: true
          })
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Clerk API returned error:", errorData);
        }
      }
    } catch {
      console.error("Clerk waitlist error");
    }

    const position = count ?? 1;

    return { success: true, position };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
    };
  }
}
