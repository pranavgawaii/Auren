# System Architecture & Execution Lifecycle — Auren

Auren is a unified AI task execution platform designed to eliminate developer context-switching across Gmail, Google Calendar, and GitHub.

---

## 🏗️ High-Level System Architecture

```
[ User Intent (Natural Language) ]
               │
               ▼
   [ Next.js 16 App Router ] ── (Clerk Auth & SHA-1 User Hashing)
               │
               ▼
   [ OpenRouter / Claude Haiku ] ── (Zod Schema Validation: PlannedAction[])
               │
               ▼
   [ Human-in-the-Loop Gate ] ── (Status: PENDING in MongoDB Atlas)
               │
      (User 1-Click Approval)
               │
               ▼
   [ Corsair App SDK ] ── (Parallel API Dispatch: Promise.all())
         ├── Gmail API (Send Email)
         ├── Google Calendar API (Create Meet Event)
         └── GitHub API (Create Issue)
               │
               ▼
   [ MongoDB Atlas Persistence ] ── (Fail-Open Connection Pool)
```

---

## 🔄 End-to-End Execution Flow

### 1. Ingestion & Authentication Isolation
- User submits natural language intent via the Next.js `/app` dashboard.
- Clerk handles OAuth session authentication.
- `getUserId()` hashes the Clerk user string ID using SHA-1 into a 32-character hex UUID to guarantee strict multi-tenant query isolation across database collections.

### 2. Context Extraction & AI Intent Parsing
- `processAgentCommand` compiles workspace context (unread emails, upcoming calendar events).
- The prompt and context payload are dispatched to OpenRouter / Claude Haiku.
- The model returns a structured JSON payload validated against a Zod schema producing a strongly-typed `PlannedAction[]` array.

### 3. Human-in-the-Loop Safety Gate (Stage 1)
- To prevent destructive side-effects, Auren logs proposed actions in MongoDB Atlas (`agent_actions`) with a status of `PENDING`.
- Zero external APIs are invoked at this stage.
- The UI renders an interactive parameter review modal displaying exact email targets, calendar times, or issue descriptions.

### 4. Parallel Tool Execution (Stage 2)
- Upon explicit user confirmation, Server Actions fire parallel Corsair SDK requests using `Promise.all()`.
- Operations run concurrently:
  - `gmailSend`: Dispatches formatted email messages.
  - `googleCalendarCreate`: Schedules event and generates Google Meet video links.
  - `githubCreateIssue`: Creates issue in the designated repository.
- Action status updates to `COMPLETED` upon success.

### 5. Asynchronous Webhook & Priority Pipeline
- Gmail webhooks hit `/api/webhooks/gmail`.
- Header cryptographic HMAC signatures are verified.
- Snippet payloads are evaluated by Claude Haiku in under 200ms to classify messages into `URGENT`, `NORMAL`, or `FYI` tiers.
- Contacts and classified messages are upserted into MongoDB Atlas.

---

## 🛡️ Key Resilience Patterns

- **Fail-Open Database Resilience (`src/lib/db.ts`)**: Singleton `MongoClient` connection helper catches connection drops and returns graceful fallback states, ensuring 100% UI availability.
- **Deterministic SHA-1 User Hashing**: Maps string user IDs to clean B-tree collection index keys.
- **Strict Slotted Rate Limiting**: Caps user command velocity to prevent API abuse.
