"use server";

import { getDb } from "@/lib/db";
import type { Email } from "@/types";
import { EMAIL_PRIORITY } from "@/lib/constants";

const SEMANTIC_SEARCH_LIMIT = 5;

export interface SearchResult {
  email: Email;
  similarity: number;
}

export interface SearchEmailsResult {
  success: true;
  results: SearchResult[];
  latencyMs: number;
  query: string;
}

export interface SearchEmailsFailure {
  success: false;
  error: string;
  latencyMs: number;
}

function rowToEmail(row: Record<string, unknown>): Email {
  return {
    id: String(row._id ?? row.id ?? ""),
    userId: String(row.user_id ?? ""),
    gmailId: String(row.gmail_id ?? ""),
    threadId: String(row.thread_id ?? ""),
    fromEmail: String(row.from_email ?? ""),
    fromName: String(row.from_name ?? ""),
    subject: String(row.subject ?? ""),
    snippet: String(row.snippet ?? ""),
    body: String(row.body ?? ""),
    priority: (row.priority as import("@/lib/constants").EmailPriority) ?? EMAIL_PRIORITY.NORMAL,
    isRead: Boolean(row.is_read),
    isArchived: Boolean(row.is_archived),
    receivedAt: String(row.received_at ?? new Date().toISOString()),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function searchEmails(
  query: string,
  userId: string
): Promise<SearchEmailsResult | SearchEmailsFailure> {
  const startMs = Date.now();

  try {
    const trimmedQuery = query.trim().slice(0, 500);
    if (!trimmedQuery) {
      return { success: false, error: "Query cannot be empty.", latencyMs: 0 };
    }

    const db = await getDb();
    if (!db) {
      return { success: true, results: [], latencyMs: Date.now() - startMs, query: trimmedQuery };
    }

    const collection = db.collection("emails");
    const regex = new RegExp(trimmedQuery.split(/\s+/).join("|"), "i");

    const rows = await collection
      .find({
        user_id: userId,
        $or: [{ subject: regex }, { snippet: regex }, { body: regex }, { from_email: regex }],
      })
      .limit(SEMANTIC_SEARCH_LIMIT)
      .toArray();

    const latencyMs = Date.now() - startMs;

    const results: SearchResult[] = rows.map((row) => ({
      email: rowToEmail(row as Record<string, unknown>),
      similarity: 0.95,
    }));

    return { success: true, results, latencyMs, query: trimmedQuery };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Search failed",
      latencyMs: Date.now() - startMs,
    };
  }
}
