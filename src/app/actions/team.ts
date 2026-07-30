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
    if (!db) {
      return { success: true, data: [] };
    }

    let docs = await db.collection("team_contacts")
      .find({ user_id: userId })
      .sort({ name: 1 })
      .toArray();

    // Auto-seed from the user's own Gmail contacts if empty — never from hardcoded people.
    if (!docs || docs.length === 0) {
      const emailsData = await db.collection("emails").find({ user_id: userId }).limit(50).toArray();
      const extractedMap = new Map<string, string>();
      (emailsData || []).forEach(e => {
        if (e.from_email && !e.from_email.includes("noreply") && !e.from_email.includes("notifications")) {
          const name = e.from_name || e.from_email.split("@")[0];
          extractedMap.set(e.from_email.toLowerCase(), name);
        }
      });

      const extractedContacts = Array.from(extractedMap.entries()).map(([email, name]) => ({
        user_id: userId,
        name,
        email,
        role: "Synced Contact",
        added_at: new Date().toISOString(),
      }));

      if (extractedContacts.length > 0) {
        try {
          await db.collection("team_contacts").insertMany(extractedContacts);
          docs = await db.collection("team_contacts").find({ user_id: userId }).sort({ name: 1 }).toArray();
        } catch (err) {
          console.warn("[Team] Auto-seed warning:", err);
        }
      }
    }

    return {
      success: true,
      data: docs.map(d => ({
        id: d._id.toString(),
        name: d.name,
        email: d.email,
        role: d.role || "Team Member",
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

    revalidatePath("/team");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTeamContact(
  contactId: string,
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

    const { ObjectId } = await import("mongodb");
    const normalizedEmail = email.toLowerCase().trim();

    // Another contact (not this one) must not already own the new address.
    const clash = await db.collection("team_contacts").findOne({
      user_id: userId,
      email: normalizedEmail,
      _id: { $ne: new ObjectId(contactId) },
    });
    if (clash) return { success: false, error: "Another contact already uses this email" };

    const res = await db.collection("team_contacts").updateOne(
      { _id: new ObjectId(contactId), user_id: userId },
      { $set: { name: name.trim(), email: normalizedEmail, role: role?.trim() || "" } }
    );

    if (res.matchedCount === 0) return { success: false, error: "Contact not found" };

    revalidatePath("/team");
    revalidatePath("/dashboard");
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

    revalidatePath("/team");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
