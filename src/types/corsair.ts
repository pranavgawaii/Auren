// Typed Corsair API response shapes
// These are the shapes Corsair returns — intentionally permissive at edges
// but strict on the fields we actually read.

export interface CorsairEmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  internalDate?: string;
  createdAt?: string;
  labelIds?: string[];
  payload?: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{ mimeType: string; body?: { data?: string } }>;
    body?: { data?: string };
    mimeType?: string;
  };
  message?: {
    payload?: CorsairEmailMessage["payload"];
  };
  headers?: Array<{ name: string; value: string }>;
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
}

export interface CorsairCalendarEvent {
  id?: string;
  summary?: string;
  title?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  hangoutLink?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  startAt?: string;
  endAt?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  conferenceData?: {
    entryPoints?: Array<{ entryPointType: string; uri: string; label?: string }>;
  };
}

export interface CorsairGitHubIssue {
  id?: number;
  number?: number;
  title?: string;
  body?: string;
  html_url?: string;
  state?: string;
}

export interface CorsairListResult {
  data?: {
    messages?: Array<{ id: string }>;
  };
  messages?: Array<{ id: string }>;
  success?: boolean;
  message?: string;
}

export interface CorsairSearchResult {
  data?: CorsairEmailMessage[];
  success?: boolean;
  message?: string;
}

export interface CorsairSendResult {
  id?: string;
  success?: boolean;
  message?: string;
}
