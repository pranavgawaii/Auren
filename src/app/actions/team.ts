"use server";

import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/user";
import { revalidatePath } from "next/cache";

export interface TeamContact {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  addedAt: string;
}

export async function getTeamContacts(): Promise<{ success: boolean; data?: TeamContact[]; error?: string }> {
  try {
    const userId = await getUserId();
    const db = await getDb();
    if (!db) return { success: true, data: [] };

    const docs = await db.collection("team_contacts")
      .find({ user_id: userId })
      .sort({ name: 1 })
      .toArray();

    return {
      success: true,
      data: docs.map(d => ({
        id: d._id.toString(),
        name: d.name,
        email: d.email,
        role: d.role || "",
        addedAt: d.added_at || new Date().toISOString(),
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTeamContact(
  name: string,
  email: string,
  role?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!name || !email) return { success: false, error: "Name and email are required" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { success: false, error: "Invalid email address" };

    const userId = await getUserId();
    const db = await getDb();
    if (!db) return { success: false, error: "Database unavailable" };

    // Prevent duplicates
    const existing = await db.collection("team_contacts").findOne({ user_id: userId, email: email.toLowerCase().trim() });
    if (existing) return { success: false, error: "This contact is already in your team" };

    await db.collection("team_contacts").insertOne({
      user_id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role?.trim() || "",
      added_at: new Date().toISOString(),
    });

    revalidatePath("/app");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTeamContact(contactId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    const db = await getDb();
    if (!db) return { success: false, error: "Database unavailable" };

    const { ObjectId } = await import("mongodb");
    await db.collection("team_contacts").deleteOne({ _id: new ObjectId(contactId), user_id: userId });

    revalidatePath("/app");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
