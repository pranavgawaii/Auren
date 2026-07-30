import { EMAIL_PRIORITY, type EmailPriority } from "@/lib/constants";

/**
 * Email priority classification.
 *
 * The original version matched keywords against subject + snippet only, which made
 * bulk mail look urgent: a newsletter titled "Action required: X is deprecating"
 * scored URGENT because the sender was never considered. Real signals, in order of
 * reliability, are now:
 *
 *   1. Gmail's own category labels (Promotions/Social/Forums/Updates) — Google has
 *      already done this classification well, so trust it first.
 *   2. The sender address (no-reply@, notifications@, updates.<domain>, …).
 *   3. Keywords — only as a last resort, and never enough to make bulk mail urgent.
 */

/** Gmail category labels that mean "this is bulk, not personal correspondence". */
const BULK_LABELS = new Set([
  "CATEGORY_PROMOTIONS",
  "CATEGORY_SOCIAL",
  "CATEGORY_FORUMS",
  "CATEGORY_UPDATES",
  "SPAM",
]);

/** Local parts that are almost always automated senders. */
const BULK_LOCAL_PARTS =
  /^(no-?reply|do-?not-?reply|donotreply|notifications?|notify|updates?|news|newsletters?|mailer|mail|marketing|promo(tions?)?|alerts?|bounces?|postmaster|automated|system|digest|hello|team)$/;

/** Subdomains used for bulk sending (updates.acme.com, mail.acme.com, …). */
const BULK_SUBDOMAINS =
  /^(updates?|news|newsletters?|mail|email|em|mailer|notifications?|alerts?|marketing|promo|send|sg|smtp|bounce|reply)\./;

/** Phrases that genuinely signal urgency in human correspondence. */
const URGENT_PHRASES = [
  "urgent",
  "asap",
  "immediately",
  "critical",
  "deadline",
  "emergency",
  "action required",
  "time sensitive",
  "overdue",
  "payment due",
  "invoice due",
  "final notice",
  "expires today",
  "by end of day",
  "eod today",
];

/** Content that marks a message as low-priority even from a normal-looking sender. */
const FYI_PHRASES = [
  "unsubscribe",
  "newsletter",
  "you're subscribed",
  "you are subscribed",
  "view in browser",
  "manage preferences",
  "promotional",
  "limited time offer",
  "% off",
  "coupon",
  "flash sale",
];

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Whole-word/phrase matching so "deadline" doesn't fire on "deadlines are gone" style
 * substrings inside longer words, and "asap" doesn't match inside "asaparagus".
 */
function containsPhrase(haystack: string, phrases: string[]): boolean {
  return phrases.some((p) => new RegExp(`(^|[^a-z0-9])${escapeRegex(p)}([^a-z0-9]|$)`, "i").test(haystack));
}

/** True when the message looks machine-sent rather than person-sent. */
export function isBulkSender(fromEmail: string, labels: string[] = []): boolean {
  if (labels.some((l) => BULK_LABELS.has(l))) return true;

  const addr = (fromEmail || "").toLowerCase().trim();
  const match = addr.match(/<([^>]+)>/);
  const clean = (match ? match[1] : addr).trim();

  const [localPart = "", domain = ""] = clean.split("@");
  if (!domain) return false;

  if (BULK_LOCAL_PARTS.test(localPart)) return true;
  // Catch variants like "no-reply-123", "notifications-team", "mailer-daemon".
  if (/^(no-?reply|do-?not-?reply|notifications?|mailer|bounces?)[-.+_]/.test(localPart)) return true;
  if (BULK_SUBDOMAINS.test(domain)) return true;

  return false;
}

export function classifyEmailPriority(input: {
  subject?: string;
  snippet?: string;
  fromEmail?: string;
  labels?: string[];
}): EmailPriority {
  const subject = input.subject || "";
  const snippet = input.snippet || "";
  const text = `${subject} ${snippet}`.toLowerCase();

  // Bulk mail is never urgent, no matter how loudly it shouts "Action required".
  if (isBulkSender(input.fromEmail || "", input.labels || [])) {
    return EMAIL_PRIORITY.FYI;
  }

  if (containsPhrase(text, FYI_PHRASES)) {
    return EMAIL_PRIORITY.FYI;
  }

  if (containsPhrase(text, URGENT_PHRASES)) {
    return EMAIL_PRIORITY.URGENT;
  }

  return EMAIL_PRIORITY.NORMAL;
}
