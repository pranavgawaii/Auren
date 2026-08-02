# Database

Auren uses [MongoDB Atlas](https://mongodb.com/atlas) as its primary data store. This document describes every collection, its fields, indexes, and how it is accessed.

---

## Connection

**File:** `src/lib/db.ts`

The MongoDB client is initialized as a module-level singleton:

```typescript
const client = new MongoClient(process.env.MONGODB_URI!)
const db = client.db("auren")
```

In development, the singleton survives hot reloads via a global cache. In production (Vercel serverless), each function invocation may create a new client — MongoDB Atlas handles connection pooling on the server side.

`getDb()` returns `null` gracefully if `MONGODB_URI` is not set, allowing the app to run with empty state during local development without a database.

---

## Collections

### `emails`

Stores synced Gmail messages. Populated by:
- `syncInboxEmails()` — manual or triggered sync from Corsair
- `POST /api/webhooks/gmail` — real-time push from Corsair

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | MongoDB document ID |
| `user_id` | string | Clerk user ID — all queries filter by this |
| `gmail_id` | string | Unique Gmail message ID |
| `thread_id` | string | Gmail thread ID |
| `from_email` | string | Sender email address |
| `from_name` | string | Sender display name |
| `subject` | string | Email subject |
| `snippet` | string | Short preview (≤200 chars) |
| `body` | string | Full email body (HTML or plain text) |
| `priority` | `"urg" \| "nrm" \| "fyi"` | AI-assigned priority |
| `is_read` | boolean | Read state |
| `is_archived` | boolean | Archive state |
| `labels` | string[] | Gmail label IDs (e.g., `["INBOX", "UNREAD"]`) |
| `received_at` | ISO string | Message timestamp |
| `updated_at` | ISO string | Last sync timestamp |

**Indexes (recommended):**
```js
{ user_id: 1, received_at: -1 }  // inbox query
{ gmail_id: 1 }                   // upsert key (unique)
{ user_id: 1, labels: 1 }         // folder filtering
```

**Text index (roadmap):**
```js
{ subject: "text", snippet: "text", body: "text" }
```

---

### `calendar_events`

Stores synced Google Calendar events. Populated by:
- `syncCalendarEvents()` — manual or triggered sync from Corsair
- `POST /api/webhooks/calendar` — real-time push
- `createCalendarEvent()` — after a successful calendar create action

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | MongoDB document ID |
| `user_id` | string | Clerk user ID |
| `gcal_id` | string | Google Calendar event ID |
| `title` | string | Event summary |
| `start_at` | ISO string | Event start time |
| `end_at` | ISO string | Event end time |
| `attendees` | object[] | `{ email, name, responseStatus }` |
| `location` | string? | Physical location |
| `description` | string? | Event description |
| `zoom_link` | string? | Google Meet or Zoom URL |
| `meeting_prep` | object? | AI-generated briefing `{ lastDiscussed, youOweThem, theyAsked, lastEmailDate, pendingItems }` |
| `prep_card_sent` | boolean | Whether meeting prep was generated |
| `html_link` | string? | Google Calendar event URL |
| `updated_at` | ISO string | Last sync timestamp |
| `created_at` | ISO string | Document creation timestamp |

**Indexes (recommended):**
```js
{ user_id: 1, start_at: 1 }  // upcoming events query
{ gcal_id: 1 }                // upsert key (unique)
```

---

### `agent_actions`

Audit log of every agent command and its execution results.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | MongoDB document ID |
| `user_id` | string | Clerk user ID |
| `command` | string | Original natural language command |
| `status` | `"pending" \| "approved" \| "rejected" \| "completed" \| "failed"` | Execution outcome |
| `actions_taken` | object[] | Per-tool log: `{ tool, input, output, executedAt }` |
| `error_message` | string? | Combined error if any actions failed |
| `completed_at` | ISO string | When execution finished |
| `created_at` | ISO string | When the command was received |

**Indexes (recommended):**
```js
{ user_id: 1, created_at: -1 }  // history query
{ user_id: 1, status: 1 }        // filter by status
```

---

### `contacts`

Auto-populated from incoming email senders. Used for @mention resolution and the Contacts view.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | MongoDB document ID |
| `user_id` | string | Clerk user ID |
| `email` | string | Contact email address (unique per user) |
| `name` | string | Display name |
| `email_count` | number | Number of emails received from this contact |
| `last_email_date` | ISO string | Most recent email timestamp |
| `relationship_summary` | string? | AI-generated 1–2 sentence summary (generated when `email_count >= 3`) |
| `updated_at` | ISO string | Last update timestamp |

**Indexes (recommended):**
```js
{ user_id: 1, email: 1 }       // upsert key
{ user_id: 1, email_count: -1 } // most frequent contacts first
```

---

### `team_contacts`

User-managed team contacts. Manually added or auto-seeded from email history. Used for @mention resolution in the agent prompt.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | MongoDB document ID |
| `user_id` | string | Clerk user ID |
| `name` | string | Contact full name |
| `email` | string | Contact email (unique per user, stored lowercase) |
| `role` | string? | Role label (e.g., "Engineering Lead") |
| `added_at` | ISO string | When the contact was added |

---

### `user_preferences`

Per-user settings. Created on first save, defaults applied if missing.

| Field | Type | Default | Description |
|---|---|---|---|
| `user_id` | string | — | Clerk user ID (unique) |
| `reply_tone` | string | `"formal"` | `"formal" \| "casual" \| "friendly" \| "professional"` |
| `working_hours_start` | string | `"09:00"` | HH:MM format |
| `working_hours_end` | string | `"18:00"` | HH:MM format |
| `timezone` | string | `"Asia/Kolkata"` | IANA timezone string |
| `github_repo` | string? | — | Default GitHub repo URL for issue creation |
| `created_at` | ISO string | — | Document creation timestamp |

---

### `user_rate_limits`

Tracks command usage for rate limiting. One document per user.

| Field | Type | Description |
|---|---|---|
| `user_id` | string | Clerk user ID |
| `commands_count` | number | Commands used in current window |
| `commands_reset_at` | ISO string | When the hourly window resets |
| `last_sync_at` | ISO string | Last email or calendar sync timestamp |
| `created_at` | ISO string | Document creation timestamp |

---

### `google_direct_tokens`

OAuth tokens for the direct Google Calendar integration (Meet link generation). One document per user.

| Field | Type | Description |
|---|---|---|
| `user_id` | string | Clerk user ID |
| `access_token` | string | Google access token (currently plaintext — encryption planned) |
| `refresh_token` | string? | Google refresh token (persisted on first consent only) |
| `expires_at` | number | Unix timestamp (ms) when access token expires |
| `updated_at` | ISO string | Last token refresh timestamp |
| `created_at` | ISO string | Document creation timestamp |

> **Security note:** Tokens are currently stored in plaintext. AES-256-GCM encryption at rest is planned for v0.4.0. See [`docs/security.md`](security.md).

---

## Seeding Demo Data

```bash
npx tsx src/db/seed-demo.ts
```

Seeds 8 realistic demo emails with varied priorities (`urg`, `nrm`, `fyi`) and read states under `DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"`.

---

## Data Lifecycle

| Event | What happens |
|---|---|
| Email arrives in Gmail | Corsair webhook → upsert to `emails` |
| User opens inbox | Fetch from `emails` where `user_id = userId` |
| User runs command | Insert to `agent_actions` with status `pending` |
| User confirms | `execute.ts` dispatches tools, updates status to `completed` or `failed` |
| User archives email | `archive-email.ts` sets `is_archived: true` |
| User marks email read | `mark-read.ts` sets `is_read: true`, best-effort Gmail label sync |
| Calendar event synced | Upsert to `calendar_events` keyed on `gcal_id` |
| Meeting < 35 min away | `generateMeetingPrep()` → sets `meeting_prep` on the event document |
