"use server";

import { gmailSend } from "@/lib/corsair";
import { getDb } from "@/lib/db";
import { DEMO_USER_ID, ACTION_STATUS } from "@/lib/constants";

interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
  originalEmailId?: string;
}

export async function sendEmail(payload: SendEmailPayload) {
  try {
    const result = await gmailSend({
      to: payload.to,
      subject: payload.subject,
      body: payload.body,
      threadId: payload.threadId,
    });

    if (!result.success) {
      return result;
    }

    const messageId = result.data;
    const db = await getDb();

    if (db) {
      await db.collection("agent_actions").insertOne({
        user_id: DEMO_USER_ID,
        command: "Send email",
        status: ACTION_STATUS.COMPLETED,
        actions_taken: [
          {
            tool: "gmail_send",
            input: { to: payload.to, subject: payload.subject, threadId: payload.threadId },
            output: { messageId },
            executedAt: new Date().toISOString(),
          },
        ],
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }

    return { success: true, data: messageId };
  } catch (error: unknown) {
    return {
      success: false,
      error: {
        code: "SEND_EMAIL_ACTION_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}
