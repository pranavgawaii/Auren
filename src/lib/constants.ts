export const EMAIL_PRIORITY = {
  URGENT: "urg",
  NORMAL: "nrm",
  FYI: "fyi",
} as const;

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export type EmailPriority = (typeof EMAIL_PRIORITY)[keyof typeof EMAIL_PRIORITY];

export const EMAIL_PRIORITY_VALUES = [
  EMAIL_PRIORITY.URGENT,
  EMAIL_PRIORITY.NORMAL,
  EMAIL_PRIORITY.FYI,
] as const;

export const ACTION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type ActionStatus = (typeof ACTION_STATUS)[keyof typeof ACTION_STATUS];

export const ACTION_STATUS_VALUES = [
  ACTION_STATUS.PENDING,
  ACTION_STATUS.APPROVED,
  ACTION_STATUS.REJECTED,
  ACTION_STATUS.COMPLETED,
  ACTION_STATUS.FAILED,
] as const;

export const INTEGRATION_PROVIDER = {
  GMAIL: "gmail",
  GOOGLE_CALENDAR: "google_calendar",
  GITHUB: "github",
} as const;

export type IntegrationProvider =
  (typeof INTEGRATION_PROVIDER)[keyof typeof INTEGRATION_PROVIDER];

export const INTEGRATION_STATUS = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
} as const;

export type IntegrationStatus =
  (typeof INTEGRATION_STATUS)[keyof typeof INTEGRATION_STATUS];

export const REPLY_TONE = {
  FORMAL: "formal",
  CASUAL: "casual",
  FRIENDLY: "friendly",
  PROFESSIONAL: "professional",
} as const;

export type ReplyTone = (typeof REPLY_TONE)[keyof typeof REPLY_TONE];

export const DEFAULT_WORKING_HOURS_START = "09:00";
export const DEFAULT_WORKING_HOURS_END = "18:00";
export const DEFAULT_TIMEZONE = "Asia/Kolkata";
export const DEFAULT_REPLY_TONE = REPLY_TONE.FORMAL;

export const ANTHROPIC_MODEL = {
  HAIKU: "claude-3-5-haiku-20241022",
  SONNET: "claude-sonnet-4-20250514",
} as const;

export const EMBEDDING_DIMENSIONS = 1536;

export const MAX_SEARCH_RESULTS = 50;
export const MAX_EMAIL_BODY_LENGTH = 100000;
export const MAX_COMMAND_LENGTH = 500;

export const ROUTES = {
  HOME: "/",
  DEMO: "/demo",
  ONBOARDING: "/onboarding",
  APP: "/app",
  APP_SEARCH: "/app/search",
  APP_COMPOSE: "/app/compose",
  SETTINGS: "/settings",
  DOCS: "/docs",
} as const;
