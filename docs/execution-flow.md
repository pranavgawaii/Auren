# Execution Flow

This document traces a complete request through the Auren system — from the moment a user types a command to the moment actions are confirmed and executed.

---

## Example Command

```
Reply to Rahul confirming Thursday 3 PM and send a calendar invite with a Meet link.
```

---

## Step-by-Step Trace

### Step 1 — Command Intake

The user types the command in the terminal drawer (`terminal-drawer.tsx`) or the `⌘K` palette (`command-menu.tsx`).

The component calls the `agent.ts` Server Action:

```typescript
// src/app/actions/agent.ts
export async function processCommand(
  command: string,
  emailContext: GmailMessage | null,
  history: { role: string; content: string }[],
  teamContacts: TeamContact[]
): Promise<AgentReasoningResult>
```

---

### Step 2 — Rate Limit Check

Before calling the AI, `checkCommandRateLimit()` is called:
- Free users: 1,000 commands/hour (tracked per `userId` in `user_rate_limits` collection)
- Pro users (Clerk `publicMetadata.isPro === true`): unlimited
- DB offline: fail-open (allow the command)

---

### Step 3 — Context Assembly

`analyzeCommand()` in `src/agents/executor.ts` assembles the system prompt:

```
CURRENT CONTEXT:
  Current Date/Time: <IST timestamp>
  User Name: Pranav Gawai
  User Email: pranav@example.com

SECURITY GUARD:
  <untrusted_email_context>
    From: rahul@acmecorp.in
    Subject: Re: Project deadline
    Body: [trimmed to MAX_BODY_CHARS]
  </untrusted_email_context>

RESOLVED MENTIONS MAP:
  @Rahul → rahul@acmecorp.in (Client)

PREVIOUS CHAT HISTORY:
  [last 6 turns, capped at 500 chars each]

AVAILABLE TOOLS:
  gmail_send, calendar_create, github_create_issue, ...

RULES:
  - NEVER leave parameters empty
  - calendar_create must precede gmail_send when chaining Meet links
  - Sign off as "Best regards,\n{userName}"
  ...
```

---

### Step 4 — AI Planning (Groq)

The assembled prompt is sent to the Groq API (`src/lib/gemini.ts`):
- Model: `llama-3.3-70b-versatile`
- Temperature: `0.2`
- Response format: `{ type: "json_object" }`
- Retries: up to 3 on rate-limit (429) with exponential backoff

Groq returns:

```json
{
  "actions": [
    {
      "tool": "calendar_create",
      "parameters": {
        "title": "Sync with Rahul",
        "startAt": "2026-08-07T15:00:00+05:30",
        "endAt": "2026-08-07T15:30:00+05:30",
        "attendees": ["rahul@acmecorp.in"],
        "withMeetLink": true
      },
      "description": "Create a 30-min Google Meet event with Rahul on Thursday at 3 PM IST"
    },
    {
      "tool": "gmail_send",
      "parameters": {
        "to": "rahul@acmecorp.in",
        "subject": "Thursday 3 PM confirmed",
        "body": "Hi Rahul,\n\nThis confirms our meeting on Thursday, 7 August 2026 at 3:00 PM IST.\n\nMeeting link: [Auto-generated upon execution]\n\nBest regards,\nPranav Gawai"
      },
      "description": "Email Rahul the confirmation and Meet link"
    }
  ],
  "explanation": "I'll create a Google Meet event with Rahul for Thursday at 3 PM and send him a confirmation email with the link.",
  "requiresConfirmation": true
}
```

---

### Step 5 — Parameter Normalization

The executor normalizes the AI output:
- Resolves parameter key aliases: `params` → `parameters`, `summary` → `title`, `hasMeetLink` → `withMeetLink`
- Normalizes `withMeetLink` from string `"true"` to boolean `true`
- Generates a fallback `description` for any action missing one

---

### Step 6 — Human-in-the-Loop Display

The plan is returned to the client. Because `requiresConfirmation: true`, the `ActionConfirmation` component renders:

```
┌─────────────────────────────────────────────────┐
│  Auren's Plan                                   │
│                                                 │
│  ① Create calendar event                        │
│     Title: Sync with Rahul                      │
│     Start: Thursday, Aug 7 · 3:00 PM IST        │
│     Attendees: rahul@acmecorp.in                │
│     With Meet link: ✓                           │
│                                                 │
│  ② Send email to rahul@acmecorp.in              │
│     Subject: Thursday 3 PM confirmed            │
│     Body: [preview]                             │
│                                                 │
│   [Cancel]              [Confirm & Execute →]   │
└─────────────────────────────────────────────────┘
```

The user can edit any field inline before confirming.

---

### Step 7 — Execution (executePlan)

After the user clicks **Confirm**, the browser calls `executePlan()` in `src/app/actions/execute.ts`.

Actions are dispatched **sequentially**:

**Action 1 — `calendar_create`**

Because `withMeetLink: true`, Auren checks if the user has connected the direct Google OAuth grant (`isDirectCalendarConnected()`).
- If yes: calls `createEventDirect()` in `src/lib/google-direct.ts` with `conferenceDataVersion=1` → Google provisions a real Meet room and returns a `hangoutLink`.
- If no: falls back to Corsair's `googleCalendarCreate()` → no Meet link generated.

The `hangoutLink` (e.g., `https://meet.google.com/abc-defg-hij`) is captured as `lastMeetLink`.

**Action 2 — `gmail_send`**

The body contains `[Auto-generated upon execution]`. Before calling the Gmail API, `executePlan` replaces this placeholder with `lastMeetLink`:

```
Meeting link: https://meet.google.com/abc-defg-hij
```

The email is sent via Corsair's `gmailSend()`.

---

### Step 8 — Audit Logging

After all actions complete, a single document is written to MongoDB:

```json
{
  "user_id": "user_2abc...",
  "command": "Reply to Rahul confirming Thursday 3 PM and send a calendar invite with a Meet link.",
  "status": "completed",
  "actions_taken": [
    {
      "tool": "calendar_create",
      "input": { "title": "Sync with Rahul", "startAt": "...", "attendees": [...] },
      "output": { "success": true },
      "executedAt": "2026-08-02T11:58:01.234Z"
    },
    {
      "tool": "gmail_send",
      "input": { "to": "rahul@acmecorp.in", "subject": "...", "body": "..." },
      "output": { "success": true },
      "executedAt": "2026-08-02T11:58:02.789Z"
    }
  ],
  "completed_at": "2026-08-02T11:58:02.800Z",
  "created_at": "2026-08-02T11:58:00.100Z"
}
```

---

### Step 9 — UI Update

The terminal drawer shows the agent's explanation and links to the created event. The history panel updates on the next data fetch.

---

## Error Paths

| Failure point | Behaviour |
|---|---|
| Groq API down / 429 | Retry up to 3× with exponential backoff. If all retries fail, return an error explanation to the user — no actions executed. |
| Google Meet link unavailable | Use `htmlLink` (event page URL) as fallback if available. Replace `[Auto-generated upon execution]` with `"The meeting link will follow shortly."` if nothing is available — the placeholder never reaches the sent email. |
| Calendar API fails | Return partial success — actions before the failure are logged. The failure is included in `error_message`. |
| DB write fails | Execution results are returned to the user. The audit log write is not retried — the user can see the result in the UI even if the history entry is missing. |

---

## Sequence Diagram (simplified)

```
User         Browser          Server Action         Groq          Corsair/Google        MongoDB
 │               │                  │                │                  │                   │
 │─── type ─────►│                  │                │                  │                   │
 │               │── processCommand►│                │                  │                   │
 │               │                  │─ assemblePrompt│                  │                   │
 │               │                  │──── POST ─────►│                  │                   │
 │               │                  │◄── JSON plan ──│                  │                   │
 │               │◄── plan ─────────│                │                  │                   │
 │               │                  │                │                  │                   │
 │◄── show HITL──│                  │                │                  │                   │
 │── confirm ───►│                  │                │                  │                   │
 │               │── executePlan ──►│                │                  │                   │
 │               │                  │──── calendar ──────────────────►│                   │
 │               │                  │◄─── meetLink ───────────────────│                   │
 │               │                  │──── gmail send (+ meetLink) ────►│                   │
 │               │                  │◄─── messageId ──────────────────│                   │
 │               │                  │─────────────────────────────────────────────────── write │
 │               │◄── success ──────│                │                  │                   │
 │◄── done ──────│                  │                │                  │                   │
```
