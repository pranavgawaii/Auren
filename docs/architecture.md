# Architecture

This document provides a detailed component-by-component breakdown of the Auren system.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│   Dashboard (Next.js App Router — Client Components)        │
│   Terminal Drawer / ⌘K Palette → natural language command   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS (Next.js Server Action POST)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server (Vercel)                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Planning Layer                         │   │
│  │   src/agents/executor.ts — analyzeCommand()          │   │
│  │   Model: Groq API / Llama 3.3-70B                    │   │
│  │   Output: { actions[], explanation, requiresConfirm} │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │ JSON plan returned to client       │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │           Human-in-the-Loop Gate (client)            │   │
│  │   ActionConfirmation UI — user reviews + approves    │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │ Confirmed plan POST                │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │             Execution Layer                          │   │
│  │   src/app/actions/execute.ts — executePlan()         │   │
│  │   Sequential dispatch with Meet-link chaining        │   │
│  └──────────┬──────────────┬──────────────┬─────────────┘   │
│             │              │              │                  │
└─────────────┼──────────────┼──────────────┼──────────────────┘
              │              │              │
    ┌─────────▼──┐  ┌────────▼──┐  ┌───────▼──┐
    │  Gmail API │  │ Calendar  │  │ GitHub   │
    │  (Corsair) │  │ (Corsair  │  │ (Corsair)│
    │            │  │  + Direct │  │          │
    └────────────┘  └───────────┘  └──────────┘
              │              │              │
              └──────────────┴──────────────┘
                             │
                    ┌────────▼────────┐
                    │  MongoDB Atlas  │
                    │  agent_actions  │
                    │  emails         │
                    │  calendar_events│
                    │  contacts       │
                    └─────────────────┘
```

---

## Component Reference

### 1. Browser / Client Layer

**Files:** `src/components/auren/app/`

The dashboard is a Next.js App Router application. The root shell (`app-shell.tsx`) is a Client Component that manages:
- Active view state (inbox, calendar, GitHub, history, settings)
- Selected email state
- Agent loading state
- Chat history (multi-turn command context, kept in memory)

Key components:

| Component | Responsibility |
|---|---|
| `terminal-drawer.tsx` | Command input, chat history display, agent response rendering |
| `action-confirmation.tsx` | HITL review card — renders each planned action with editable parameters |
| `email-detail.tsx` | Email viewer with sandboxed iframe for HTML email rendering |
| `inbox-panel.tsx` | Email list with priority badges, unread indicators |
| `calendar-panel.tsx` | Upcoming events sidebar |
| `home-view.tsx` | Dashboard home with daily briefing |
| `settings-view.tsx` | Integration connection management |

---

### 2. Auth Middleware

**File:** `src/proxy.ts`

Clerk middleware runs on every request (except static assets). It:
- Protects all routes under `/(dashboard)/`, `/admin/`
- Allows public access to `/`, `/sign-in`, `/sign-up`, `/docs`, `/features`, `/integrations`, `/privacy`, `/terms`, `/api/webhooks/*`
- Redirects authenticated users from `/` to `/dashboard`

The middleware runs at the Edge — it adds zero cold-start latency to API routes.

---

### 3. Planning Layer

**File:** `src/agents/executor.ts` — `analyzeCommand()`

This is the core AI reasoning function. It constructs a system prompt containing:
- Available tools and their required parameters
- Current date/time (IST timezone)
- The currently selected email (wrapped in `<untrusted_email_context>` tags)
- Resolved team contact mentions (`@Name → email`)
- Recent chat history (last 6 turns, capped at 500 chars each)
- Strict output format rules

The prompt is sent to Groq (Llama 3.3-70B via `src/lib/gemini.ts`). The response is parsed as JSON and validated. Parameter aliases are normalized (e.g., `params` → `parameters`, `summary` → `title`).

**Prompt budget controls:**

| Constant | Value | Purpose |
|---|---|---|
| `MAX_BODY_CHARS` | 3,000 | Prevents a single large email body from exceeding token limits |
| `MAX_SNIPPET_CHARS` | 300 | Snippet sent to LLM is capped |
| `MAX_HISTORY_TURNS` | 6 | Only the last 6 turns of chat history are included |
| `MAX_HISTORY_CHARS` | 500 | Each history turn is capped at 500 characters |

---

### 4. Human-in-the-Loop Gate

**File:** `src/components/auren/app/action-confirmation.tsx`

After the planning layer returns, the `requiresConfirmation` flag determines if the confirmation UI is shown:
- `true` — any action that writes to external services (email, calendar, GitHub)
- `false` — read-only queries (listing issues, answering questions about the schedule)

The confirmation card renders each action in the plan with its parameters. Users can edit any parameter value inline before confirming.

---

### 5. Execution Layer

**File:** `src/app/actions/execute.ts` — `executePlan()`

Actions are dispatched **sequentially** (not in parallel) to allow result chaining:

1. `calendar_create` runs first and captures the `hangoutLink` (real Meet URL) from the Google Calendar API response.
2. If a subsequent `gmail_send` action has a placeholder `[Auto-generated upon execution]` in its body, the actual Meet URL is injected before the email is sent.

This is the "Meet-link chaining" feature. The alternative (parallel dispatch) would require the email body to be constructed without knowing the Meet link in advance.

After all actions complete, a single document is written to the `agent_actions` MongoDB collection with the full command, all action inputs/outputs, and per-action timestamps.

---

### 6. Corsair Integration Layer

**File:** `src/lib/corsair.ts`

Corsair is an OAuth broker SDK that handles Gmail, Google Calendar, and GitHub. It provides:
- Per-tenant OAuth token management (no token storage in Auren's DB for Corsair-managed integrations)
- A unified `tenant.run("tool.action", params)` interface
- Real-time webhooks

The `getTenant()` helper resolves the Corsair tenant from the authenticated Clerk user session.

See [`docs/corsair.md`](corsair.md) for the full API reference.

---

### 7. Direct Google OAuth

**File:** `src/lib/google-direct.ts`

Corsair's calendar integration does not support `conferenceDataVersion=1`, which is the Google Calendar API parameter that provisions a real Google Meet room. To work around this, Auren maintains a second, independent OAuth grant directly with Google.

This module handles:
- Building the Google OAuth consent URL
- Exchanging the authorization code for tokens
- Storing/refreshing tokens in the `google_direct_tokens` MongoDB collection
- Making direct `events.insert` calls to the Google Calendar API with `conferenceDataVersion=1`

---

### 8. Real-Time Webhook Pipeline

**Files:** `src/app/api/webhooks/gmail/route.ts`, `src/app/api/webhooks/calendar/route.ts`

```
Gmail activity
     → Corsair webhook (POST /api/webhooks/gmail)
     → Verify x-webhook-secret (timingSafeEqual)
     → classifyWithHaiku() → priority: "urg" | "nrm" | "fyi"
     → Upsert to MongoDB emails collection
     → UI re-fetches on next poll
```

```
Calendar event upserted
     → Corsair webhook (POST /api/webhooks/calendar)
     → Verify x-webhook-secret
     → Upsert to MongoDB calendar_events collection
     → If event starts within 35 minutes → generateMeetingPrep()
```

---

### 9. Database Layer

**File:** `src/lib/db.ts`

MongoDB Atlas is used as the primary data store. The client is initialized as a module-level singleton to survive hot reloads in development.

See [`docs/database.md`](database.md) for the full collection schema.

---

## Data Flow Diagram — Email Classification

```
External sender
     │
     ▼  (SMTP)
Gmail Inbox
     │
     ▼  (Corsair webhook push)
POST /api/webhooks/gmail
     │
     ├── Verify x-webhook-secret (timingSafeEqual)
     ├── Parse payload
     │
     ▼
Claude Haiku (Anthropic)
  System: "classify priority as urg / nrm / fyi"
  User: "Subject: ... Preview: ..."
     │
     ▼
priority: "urg" | "nrm" | "fyi"
     │
     ▼
MongoDB.emails.updateOne({ gmail_id }, { $set: { priority, ... } }, { upsert: true })
     │
     ▼
Inbox UI (next poll or manual refresh)
```
