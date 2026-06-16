import type {
  EmailPriority,
  ActionStatus,
  IntegrationProvider,
  IntegrationStatus,
  ReplyTone,
} from "@/lib/constants";

export interface Email {
  id: string;
  userId: string;
  gmailId: string;
  threadId: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  snippet: string;
  body: string;
  priority: EmailPriority;
  isRead: boolean;
  isArchived: boolean;
  receivedAt: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  gcalId: string;
  title: string;
  startAt: string;
  endAt: string;
  attendees: CalendarAttendee[];
  location: string | null;
  zoomLink: string | null;
  description: string | null;
  prepCardSent: boolean;
  createdAt: string;
}

export interface CalendarAttendee {
  email: string;
  name: string | null;
  responseStatus: string;
}

export interface AgentActionEntry {
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  executedAt: string;
}

export interface AgentAction {
  id: string;
  userId: string;
  command: string;
  status: ActionStatus;
  actionsTaken: AgentActionEntry[];
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Contact {
  id: string;
  userId: string;
  email: string;
  name: string;
  relationshipSummary: string | null;
  lastEmailDate: string | null;
  emailCount: number;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  replyTone: ReplyTone;
  workingHoursStart: string;
  workingHoursEnd: string;
  timezone: string;
  githubRepo: string | null;
  createdAt: string;
}

export interface Integration {
  id: string;
  userId: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  connectedAt: string | null;
}

export interface CorsairError {
  code: string;
  message: string;
  statusCode: number;
}

export interface CorsairResult<T> {
  data: T;
  success: true;
}

export interface CorsairFailure {
  error: CorsairError;
  success: false;
}

export type CorsairResponse<T> = CorsairResult<T> | CorsairFailure;

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  isRead: boolean;
  priority?: string;
}

export interface GmailSendPayload {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
}

export interface GmailSearchResult {
  messages: GmailMessage[];
  resultCount: number;
}

export interface CalendarEventPayload {
  title: string;
  startAt: string;
  endAt: string;
  attendees: string[];
  location?: string;
  description?: string;
}

export interface CalendarEventResult {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  attendees: CalendarAttendee[];
  htmlLink: string;
  description?: string;
  location?: string;
}

export interface GitHubIssuePayload {
  owner: string;
  repo: string;
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
}

export interface GitHubIssueResult {
  id: number;
  number: number;
  title: string;
  htmlUrl: string;
  state: string;
}

export interface ClassificationResult {
  priority: EmailPriority;
  confidence: number;
  reasoning: string;
}

export interface AgentReasoningResult {
  actions: PlannedAction[];
  explanation: string;
  requiresConfirmation: boolean;
}

export interface PlannedAction {
  tool: "gmail_send" | "gmail_search" | "calendar_create" | "github_create_issue";
  parameters: Record<string, unknown>;
  description: string;
}
