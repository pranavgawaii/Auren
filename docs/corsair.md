# Corsair Integration

This document explains how Auren integrates with the [Corsair App SDK](https://corsair.dev) and what each integration provides.

---

## What is Corsair?

Corsair is an OAuth broker and integration SDK. It handles:
- OAuth consent flows for Gmail, Google Calendar, and GitHub
- Per-user token storage (tokens are stored in Corsair's infrastructure, not in Auren's database)
- A unified `tenant.run("tool.action", params)` API for calling third-party services
- Real-time webhooks pushed to your endpoint when events occur

Auren uses Corsair instead of managing OAuth grants directly for Gmail and GitHub. The only exception is Google Calendar event creation with Meet links, which requires a direct Google OAuth grant (see [Direct Google OAuth](#direct-google-oauth-exception) below).

---

## Configuration

The Corsair SDK requires three environment variables:

```env
CORSAIR_DEV_KEY=       # Your Corsair developer API key
CORSAIR_INSTANCE_ID=   # The Corsair App instance ID for Auren
CORSAIR_TENANT_ID=     # Default tenant (used as fallback in webhooks)
```

The tenant is resolved dynamically in most contexts:

```typescript
// src/lib/corsair.ts
export async function getTenant() {
  const devKey = process.env.CORSAIR_DEV_KEY
  const instanceId = process.env.CORSAIR_INSTANCE_ID

  let tenantId = process.env.CORSAIR_TENANT_ID
  try {
    tenantId = await getUserId() // Resolved from Clerk session
  } catch {
    // Fallback if called outside a request context
  }

  const app = createApp({ apiKey: devKey })
  return app.instance(instanceId).tenant(tenantId)
}
```

---

## Gmail Integration

### Reading emails

```typescript
// src/lib/corsair.ts — gmailRead()
const listResult = await tenant.run("gmail.api.messages.list", {
  userId: "me",
  maxResults,
  labelIds: ["INBOX"],
  q: "-in:spam -in:trash",
})

// Fetch full message details for each summary
const detailResult = await tenant.run("gmail.api.messages.get", {
  userId: "me",
  id: summary.id,
})
```

HTML email bodies are decoded from base64:

```typescript
body = Buffer.from(htmlPart.body.data, "base64").toString("utf-8")
```

### Sending emails

```typescript
// src/lib/corsair.ts — gmailSend()
await tenant.run("gmail.api.messages.send", {
  userId: "me",
  raw: base64EncodedMimeMessage,
})
```

### Creating drafts

```typescript
// src/lib/corsair.ts — gmailCreateDraft()
await tenant.run("gmail.api.drafts.create", {
  userId: "me",
  message: { raw: base64EncodedMimeMessage },
})
```

### Searching emails

```typescript
// src/lib/corsair.ts — gmailSearch()
await tenant.run("gmail.db.messages.search", {
  query: "from:rahul@acmecorp.in",
  limit: 10,
})
```

### Modifying labels (mark as read)

```typescript
// src/app/actions/mark-read.ts
await tenant.run("gmail.api.messages.modify", {
  userId: "me",
  id: gmailId,
  removeLabelIds: ["UNREAD"],
})
```

---

## Google Calendar Integration

### Listing events

```typescript
// src/lib/corsair.ts — googleCalendarList()
await tenant.run("googlecalendar.api.events.list", {
  calendarId: "primary",
  maxResults: 20,
  orderBy: "startTime",
  singleEvents: true,
  timeMin: new Date().toISOString(),
})
```

### Creating events

```typescript
// src/lib/corsair.ts — googleCalendarCreate()
await tenant.run("googlecalendar.api.events.create", {
  calendarId: "primary",
  summary: payload.title,
  start: { dateTime: payload.startAt },
  end: { dateTime: payload.endAt },
  attendees: payload.attendees?.map(email => ({ email })),
  sendUpdates: "all",
})
```

> **Note:** This Corsair endpoint does not support `conferenceDataVersion=1`, so it cannot generate a real Google Meet link. See [Direct Google OAuth](#direct-google-oauth-exception) for how Meet links are created.

---

## GitHub Integration

### Creating issues

```typescript
// src/lib/corsair.ts — githubCreateIssue()
await tenant.run("github.api.issues.create", {
  owner,
  repo,
  title: payload.title,
  body: payload.body,
  assignees: payload.assignees ?? [],
  labels: payload.labels ?? [],
})
```

### Listing issues

```typescript
// src/lib/corsair.ts — githubListIssues()
await tenant.run("github.api.issues.list", {
  owner,
  repo,
  state: payload.state || "open",
  labels: payload.labels?.join(","),
})
```

### Submitting PR reviews

```typescript
// src/lib/corsair.ts — githubReviewPr()
await tenant.run("github.api.pulls.createReview", {
  owner,
  repo,
  pull_number: payload.pullNumber,
  body: payload.body,
  event: payload.event, // "APPROVE" | "REQUEST_CHANGES" | "COMMENT"
})
```

---

## Real-Time Webhooks

Corsair pushes events to Auren's webhook endpoints when:
- A new email arrives in Gmail (`POST /api/webhooks/gmail`)
- A calendar event is created or updated (`POST /api/webhooks/calendar`)

Both endpoints verify the `x-webhook-secret` or `x-corsair-secret` header before processing. See [`docs/security.md`](security.md#webhook-authentication) for the implementation.

---

## Direct Google OAuth Exception

**File:** `src/lib/google-direct.ts`

The Corsair `googlecalendar.api.events.create` call does not forward `conferenceDataVersion=1` to the Google Calendar API. This parameter is required to provision a real Google Meet room.

To work around this, Auren maintains a second, independent OAuth grant directly with Google:

1. User connects via **Settings → Google Meet**.
2. Auren requests only the `https://www.googleapis.com/auth/calendar.events` scope.
3. The `access_token` and `refresh_token` are stored in the `google_direct_tokens` MongoDB collection.
4. When `withMeetLink: true` is present in a `calendar_create` action, `createEventDirect()` calls the Google Calendar REST API directly with `conferenceDataVersion=1`.
5. The resulting `hangoutLink` is a real, joinable `meet.google.com` URL.

This integration is optional — if the user has not connected it, Corsair's calendar endpoint is used as a fallback (no Meet link generated).

---

## Error Handling

All Corsair calls are wrapped and return a typed `CorsairResponse<T>`:

```typescript
type CorsairResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; statusCode: number } }
```

When Corsair returns a `success: false` response (e.g., unauthenticated, disconnected), Auren returns it to the client without rethrowing. The UI shows the error message and prompts the user to reconnect the integration.

---

## Connecting Integrations

Users connect integrations from **Settings → Integrations**:

1. Click **Connect** next to Gmail/Calendar or GitHub.
2. `getConnectUrl()` (`src/app/actions/connect.ts`) calls Corsair's instance to generate an OAuth consent URL.
3. The user completes the OAuth flow in a popup window.
4. Corsair stores the tokens. `checkConnectionStatus()` reads the connection state back from Corsair.

Disconnecting calls `disconnectService()`, which removes the Corsair integration for that tenant.
