"use server";

import { gmailCreateDraft } from "@/lib/corsair";
import type { GmailSendPayload } from "@/types";

export async function saveDraft(payload: GmailSendPayload) {
  return gmailCreateDraft(payload);
}
