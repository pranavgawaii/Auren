"use server";

import { gmailCreateDraft } from "@/lib/corsair";
import type { GmailSendPayload } from "@/types";

export async function saveDraft(payload: GmailSendPayload) {
  if (!payload || !payload.to || typeof payload.to !== "string" || !payload.to.trim()) {
    return {
      success: false,
      error: {
        code: "INVALID_RECIPIENT",
        message: "Recipient email is required to create a draft.",
        statusCode: 400,
      },
    };
  }
  return gmailCreateDraft({
    to: payload.to.trim(),
    subject: payload.subject || "(No Subject)",
    body: payload.body || "",
    threadId: payload.threadId,
  });
}

