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
      return {
        success: true,
        data: [
          { id: "default-1", name: "Pranav Gawai", email: "pranavgawai1518@gmail.com", role: "Founder & Lead", addedAt: new Date().toISOString() },
          { id: "default-2", name: "Product Team", email: "product@example.com", role: "Product", addedAt: new Date().toISOString() }
        ]
      };
    }

    let docs = await db.collection("team_contacts")
      .find({ user_id: userId })
      .sort({ name: 1 })
      .toArray();

    // Auto-seed if empty
    if (!docs || docs.length === 0) {
      const defaultContacts = [
        { user_id: userId, name: "Pranav Gawai", email: "pranavgawai1518@gmail.com", role: "Founder & Lead", added_at: new Date().toISOString() },
        { user_id: userId, name: "Product Team", email: "product@example.com", role: "Product", added_at: new Date().toISOString() }
      ];

      // Extract unique email contacts from emails collection if present
      const emailsData = await db.collection("emails").find({ user_id: userId }).limit(50).toArray();
      const extractedMap = new Map<string, string>();
      (emailsData || []).forEach(e => {
        if (e.from_email && !e.from_email.includes("noreply") && !e.from_email.includes("notifications")) {
          const name = e.from_name || e.from_email.split("@")[0];
          extractedMap.set(e.from_email.toLowerCase(), name);
        }
      });

      extractedMap.forEach((name, email) => {
        if (!defaultContacts.some(c => c.email.toLowerCase() === email)) {
          defaultContacts.push({
            user_id: userId,
            name: name,
            email: email,
            role: "Synced Contact",
            added_at: new Date().toISOString()
          });
        }
      });

      try {
        await db.collection("team_contacts").insertMany(defaultContacts);
        docs = await db.collection("team_contacts").find({ user_id: userId }).sort({ name: 1 }).toArray();
      } catch (err) {
        console.warn("[Team] Auto-seed warning:", err);
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
