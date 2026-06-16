"use server";

import { generateEmbedding } from "@/lib/openai";
import { createServerSupabaseClient } from "@/lib/supabase";
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
    id: String(row.id ?? ""),
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

    const queryEmbedding = await generateEmbedding(trimmedQuery);
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc("search_emails_by_embedding", {
      query_embedding: queryEmbedding,
      match_user_id: userId,
      match_count: SEMANTIC_SEARCH_LIMIT,
    });

    const latencyMs = Date.now() - startMs;
    console.log(`[search] query="${trimmedQuery}" latency=${latencyMs}ms`);

    if (error) {
      return { success: false, error: error.message, latencyMs };
    }

    const results: SearchResult[] = ((data as Record<string, unknown>[]) ?? []).map((row) => ({
      email: rowToEmail(row),
      similarity: Number(row.similarity ?? 0),
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
