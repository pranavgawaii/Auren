import { NextResponse } from "next/server";
import { z } from "zod";
import { classifyWithHaiku } from "@/lib/anthropic";
import { createServerSupabaseClient } from "@/lib/supabase";
import { EMAIL_PRIORITY_VALUES, EMAIL_PRIORITY, type EmailPriority } from "@/lib/constants";

const PrioritySchema = z.object({
  priority: z.enum(EMAIL_PRIORITY_VALUES),
});

export async function POST(req: Request) {
  // Webhook secret verification (backward-compatible — only enforced if WEBHOOK_SECRET is set)
  const secret = req.headers.get('x-webhook-secret') || req.headers.get('x-corsair-secret');
  const expectedSecret = process.env.WEBHOOK_SECRET;
  if (expectedSecret && secret !== expectedSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();

    // Support both { data: { id, ... } } wrapper and flat object payload from Corsair webhooks
    const payload = body.data || body;

    // Validate required fields
    if (!payload || !payload.id || !payload.from || !payload.subject) {
      return NextResponse.json(
        { error: "Missing required fields in webhook payload" },
        { status: 400 }
      );
    }

    const email = {
      id: payload.id,
      threadId: payload.threadId || payload.id,
      from: payload.from,
      fromName: payload.from, // simplified
      to: payload.to || "",
      subject: payload.subject,
      snippet: payload.snippet || "",
      body: payload.body || "",
      date: payload.internalDate || payload.createdAt || new Date().toISOString(),
      isRead: payload.isRead || false,
    };

    const supabase = createServerSupabaseClient();

    const userId = "00000000-0000-0000-0000-000000000001";

    // Classify Priority
    const systemPrompt = `You are an email classifier.
Return only valid JSON with one field called priority.
The value must be exactly one of: urg, nrm, or fyi.
urg means urgent and needs immediate attention.
nrm means normal priority.
fyi means informational only.
No explanation. No markdown. Only JSON.`;

    const userMessage = `Subject: ${email.subject}
Preview: ${email.snippet}`;

    let priority: EmailPriority = EMAIL_PRIORITY.NORMAL;
    try {
      const haikuResponse = await classifyWithHaiku(systemPrompt, userMessage);
      const parsed = JSON.parse(haikuResponse.trim());
      const validated = PrioritySchema.parse(parsed);
      priority = validated.priority;
    } catch {
      // Fallback
      priority = EMAIL_PRIORITY.NORMAL;
    }

    // Upsert into Supabase
    const { error: upsertError } = await supabase
      .from("emails")
      .upsert(
        {
          user_id: userId,
          gmail_id: email.id,
          thread_id: email.threadId,
          from_email: email.from,
          from_name: email.fromName,
          subject: email.subject,
          snippet: email.snippet,
          body: email.body,
          priority: priority,
          is_read: email.isRead,
          received_at: email.date,
        },
        {
          onConflict: "gmail_id",
        }
      );

    if (upsertError) {
      return NextResponse.json(
        { error: `Database upsert failed: ${upsertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
