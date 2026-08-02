<div align="center">

<img src="public/auren_logo.webp" alt="Auren" height="72" />

# Auren

**The execution layer between thinking and doing.**

Auren is an open-source AI command center for Gmail, Google Calendar, and GitHub.
Type one natural-language command — Auren plans every step, shows you the full execution plan, and executes everything simultaneously with a single approval.

<br />

<a href="https://www.youtube.com/watch?v=C-uXkFPFwmc"><code>➜ onboarding guide: Watch Setup Walkthrough</code></a><br>
<a href="https://youtu.be/uBdourG9P2w"><code>➜ demo video: Watch Demo Video</code></a><br>
<a href="https://tryauren.in"><code>➜ try live: tryauren.in</code></a><br>

<br />

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://mongodb.com)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-purple?logo=clerk)](https://clerk.com)

</div>

---

## What is Auren?

Most productivity tools make you manage them. Auren executes on your behalf.

Type:
```
Reply to Rahul confirming Thursday 3 PM and send a calendar invite with a Meet link.
```

Auren:
1. **Plans** — parses your intent into a structured JSON execution plan
2. **Shows you** — displays every action before running anything
3. **Executes** — fires Gmail reply + Calendar event + Meet link simultaneously
4. **Logs** — stores the full audit trail to your history

One command. One approval. Four seconds.

---

## Features

| Feature | Description |
|---|---|
| **Human-in-the-Loop Execution** | Every plan is shown before any API call. Review, edit, or cancel — you are always in control. |
| **Parallel Multi-Tool Execution** | One command dispatches Gmail, Calendar, and GitHub simultaneously — not sequentially. |
| **Real-Time Inbox Classification** | Every incoming email is classified as Urgent / Normal / FYI by Claude Haiku via webhooks. No polling. |
| **Google Meet Auto-Generation** | Calendar events created through Auren automatically carry a real, joinable Google Meet link. |
| **Meet-link chaining** | When scheduling a meeting and emailing the link in one command, Auren injects the live Meet URL into the email body before sending. |
| **Semantic Email Search** | Search your inbox by meaning. Powered by regex + vector-ready architecture. |
| **Agent History & Audit Trail** | Every action is logged — command, tool, inputs, outputs, timestamp, result. |
| **Keyboard-First Design** | `⌘K` command palette, `R` to reply, `E` to archive, `J`/`K` to navigate. Built for power users. |
| **Meeting Prep Cards** | 35 minutes before any meeting, Auren auto-generates a briefing from your email history with attendees. |
| **Rate Limiting** | 1,000 commands/hour for free users. Unlimited for Pro. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│   Natural language command (Terminal Drawer / ⌘K)       │
└────────────────────┬────────────────────────────────────┘
                     │  Next.js Server Action
                     ▼
┌─────────────────────────────────────────────────────────┐
│               Auren Planning Layer                      │
│   analyzeCommand()  →  Groq (Llama 3.3-70B)             │
│   Returns: { actions[], explanation, requiresConfirm }  │
└────────────────────┬────────────────────────────────────┘
                     │  Human-in-the-Loop gate
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Action Confirmation UI (client)               │
│   User reviews plan → edits parameters → Confirms       │
└────────────────────┬────────────────────────────────────┘
                     │  executePlan() Server Action
                     ▼
┌─────────────────────────────────────────────────────────┐
│                Execution Layer (parallel)               │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│   │  Gmail API   │  │ Calendar API │  │  GitHub API │  │
│   │  (Corsair)   │  │  (Corsair +  │  │  (Corsair)  │  │
│   │              │  │  Direct OAuth│  │             │  │
│   └──────────────┘  └──────────────┘  └─────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           MongoDB Atlas — Audit Log                     │
│   agent_actions, emails, calendar_events, contacts      │
└─────────────────────────────────────────────────────────┘

Real-time webhook pipeline:
Gmail Inbox → Corsair Webhook → Claude Haiku → Priority Classification → MongoDB
```

See [`docs/architecture.md`](docs/architecture.md) for a detailed component-by-component breakdown.

---

## How it Works

### 1. Command Intake
The user types a command in the terminal drawer or `⌘K` palette. The command is sent to a Next.js Server Action (`processAgentCommand`).

### 2. AI Planning
`analyzeCommand()` in `src/agents/executor.ts` sends the command plus context (current email, team contacts, chat history) to Groq's Llama 3.3-70B. The model returns a structured JSON plan:

```json
{
  "actions": [
    { "tool": "calendar_create", "parameters": { "title": "Sync with Rahul", "startAt": "...", "attendees": ["rahul@acme.in"], "withMeetLink": true }, "description": "..." },
    { "tool": "gmail_send", "parameters": { "to": "rahul@acme.in", "subject": "...", "body": "..." }, "description": "..." }
  ],
  "explanation": "I'll create a Google Meet event and send Rahul the invite.",
  "requiresConfirmation": true
}
```

### 3. Human Review
The `ActionConfirmation` component renders a card for every planned action. The user can edit any parameter field inline before confirming.

### 4. Parallel Execution
`executePlan()` dispatches all actions. When a `calendar_create` runs first, the resulting Meet link is automatically injected into the subsequent `gmail_send` body — no manual copy-paste.

### 5. Audit Logging
Every execution is written to `agent_actions` in MongoDB with full input/output/timing per tool.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Server Actions eliminate a separate API layer |
| **Language** | TypeScript 5 | End-to-end type safety |
| **Styling** | Tailwind CSS | Utility-first, zero runtime overhead |
| **Auth** | Clerk | Production-grade auth with webhooks and metadata |
| **Database** | MongoDB Atlas | Flexible document store; no schema migrations for AI data |
| **AI — Planning** | Groq / Llama 3.3-70B | 14,400 req/day free tier, 128k context, sub-second inference |
| **AI — Classification** | Anthropic Claude Haiku | Cost-effective per-email priority classification |
| **Integrations** | Corsair App SDK | Unified OAuth broker for Gmail, Calendar, GitHub |
| **Direct OAuth** | Google Calendar API | Real Google Meet link generation (requires `conferenceDataVersion=1`) |
| **Deploy** | Vercel | Zero-config Next.js deployment |

---

## Project Structure

```
auren/
├── src/
│   ├── agents/
│   │   └── executor.ts          # Core AI reasoning engine (Groq/Llama)
│   │
│   ├── app/
│   │   ├── (dashboard)/         # Auth-protected app shell
│   │   │   ├── dashboard/       # Home view
│   │   │   ├── mail/            # Inbox + email detail
│   │   │   ├── calendar/        # Full calendar view
│   │   │   ├── github/          # GitHub activity
│   │   │   ├── history/         # Agent action audit log
│   │   │   ├── settings/        # Integrations + preferences
│   │   │   └── team/            # Team contacts
│   │   │
│   │   ├── actions/             # Next.js Server Actions (backend)
│   │   │   ├── execute.ts       # executePlan() — parallel tool dispatch
│   │   │   ├── agent-command.ts # processAgentCommand() — AI routing
│   │   │   ├── create-event.ts  # Calendar event creation
│   │   │   ├── send-email.ts    # Gmail send
│   │   │   ├── archive-email.ts # Email archive
│   │   │   ├── search-emails.ts # Email search (IDOR-safe)
│   │   │   ├── sync-emails.ts   # Gmail → MongoDB sync
│   │   │   ├── sync-calendar.ts # Calendar → MongoDB sync
│   │   │   ├── team.ts          # Team contact CRUD
│   │   │   └── admin.ts         # Admin analytics
│   │   │
│   │   └── api/
│   │       └── webhooks/
│   │           ├── gmail/       # Real-time email classification
│   │           └── calendar/    # Meeting prep trigger
│   │
│   ├── components/
│   │   ├── auren/app/           # Dashboard UI components
│   │   │   ├── email-detail.tsx # Email viewer (sandboxed iframe)
│   │   │   ├── action-confirmation.tsx  # HITL review UI
│   │   │   ├── terminal-drawer.tsx      # Command input
│   │   │   └── ...
│   │   └── ui/                  # Design system primitives
│   │
│   ├── lib/
│   │   ├── corsair.ts           # Corsair SDK wrapper (Gmail, Calendar, GitHub)
│   │   ├── google-direct.ts     # Direct Google OAuth (Meet link generation)
│   │   ├── anthropic.ts         # Claude client (Haiku + Sonnet)
│   │   ├── gemini.ts            # Groq/Llama client
│   │   ├── db.ts                # MongoDB singleton
│   │   ├── user.ts              # getUserId() — session → userId
│   │   ├── rate-limit.ts        # Command + sync rate limiting
│   │   └── constants.ts         # App-wide constants
│   │
│   ├── db/
│   │   ├── schema.sql           # Reference schema (historical Supabase)
│   │   └── seed-demo.ts         # Demo data seeder
│   │
│   ├── types/
│   │   ├── index.ts             # Core type definitions
│   │   └── corsair.ts           # Corsair SDK types
│   │
│   └── proxy.ts                 # Clerk auth middleware (route protection)
│
├── docs/                        # Extended documentation
│   ├── architecture.md
│   ├── execution-flow.md
│   ├── security.md
│   ├── corsair.md
│   └── database.md
│
├── examples/                    # Realistic usage examples
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── next.config.mjs              # Security headers + CSP
├── SECURITY.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── ROADMAP.md
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- [Clerk](https://clerk.com) account
- [Corsair](https://corsair.dev) account (for Gmail, Calendar, GitHub OAuth)
- [Groq](https://groq.com) API key (free tier)
- [Anthropic](https://anthropic.com) API key

### Installation

```bash
git clone https://github.com/pranavgawaii/auren
cd auren
npm install
cp .env.example .env.local
```

Fill in `.env.local` (see [Environment Variables](#environment-variables) below), then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Corsair (Gmail, Calendar, GitHub broker)
CORSAIR_INSTANCE_ID=
CORSAIR_TENANT_ID=
CORSAIR_DEV_KEY=

# Google (Direct Calendar OAuth — for real Meet links)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
GROQ_API_KEY=
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHOOK_SECRET=
```

> See [`.env.example`](.env.example) for the full annotated list.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` | Open command palette |
| `R` | Reply to selected email |
| `E` | Archive selected email |
| `J` / `K` | Navigate emails up/down |
| `C` | Compose new email |
| `?` | Show all shortcuts |
| `G` → `I` | Go to Inbox |
| `G` → `C` | Go to Calendar |
| `G` → `H` | Go to History |
| `/` | Focus search |
| `Escape` | Close / dismiss |

---

## Security

Auren is designed with user safety as the primary constraint on the agent.

| Control | Implementation |
|---|---|
| **Human-in-the-Loop** | Agent cannot execute any action without explicit user confirmation |
| **Tenant Isolation** | Every DB query is scoped to the authenticated caller's `userId` via `getUserId()` — never a client-supplied value |
| **Constant-time secret comparison** | Webhook authentication uses `crypto.timingSafeEqual()` to prevent timing attacks |
| **Email iframe sandboxing** | HTML emails render in a sandboxed iframe with `origin: null` — no DOM access to the parent app |
| **Prompt injection guard** | External email content is wrapped in `<untrusted_email_context>` XML tags with an explicit system-level guard |
| **Content Security Policy** | Full CSP header restricts scripts, connect targets, frames, and form actions |
| **Regex injection / ReDoS** | Search queries are escaped before constructing regular expressions |
| **Strict OAuth scopes** | Only requests `calendar.events` — no read access to Drive, Contacts, or other user data |
| **Webhook fail-closed** | If `WEBHOOK_SECRET` is not configured, all webhook requests are rejected with `503` |
| **Rate limiting** | 1,000 commands/hour (free), cooldown on syncs, Pro tier bypass stored in Clerk metadata |

See [`SECURITY.md`](SECURITY.md) for the full threat model and responsible disclosure policy.

---

## Roadmap

| Status | Item |
|---|---|
| ✅ | Gmail read, send, draft, archive |
| ✅ | Google Calendar events + Google Meet links |
| ✅ | GitHub issues + PR reviews |
| ✅ | Real-time email classification (Claude Haiku) |
| ✅ | Human-in-the-Loop confirmation UI |
| ✅ | Team contacts + @mention resolution |
| ✅ | Meeting prep briefing cards |
| ✅ | Dark mode |
| 🔄 | Encrypted OAuth token storage at rest |
| 🔄 | Webhook rate limiting (per-tenant) |
| 📋 | Google Sheets integration |
| 📋 | Slack notifications on agent actions |
| 📋 | Notion — save email summaries |
| 📋 | Linear — create tickets from email/GitHub context |
| 📋 | Multi-account Gmail support |
| 📋 | Razorpay / Stripe Pro subscription |
| 🔭 | Self-hosted Auren (Docker, Ollama) |
| 🔭 | Agent memory — long-term context across sessions |

See [`ROADMAP.md`](ROADMAP.md) for the full plan with milestones.

---

## Examples

```
# Email + Calendar in one command
Reply to Rahul confirming Thursday 3 PM and send a calendar invite with a Meet link.

# GitHub from email context
Create a GitHub issue from this email and label it as a bug.

# Intelligent scheduling
Check my calendar and schedule a 30-minute meeting with Priya tomorrow afternoon.

# Batch actions
Archive all FYI emails and send Hitesh a summary of what I archived.
```

See [`examples/`](examples/) for the full library with expected outputs.

---

## FAQ

**Does Auren store my emails?**
Auren syncs email metadata (subject, sender, snippet, priority classification) to your MongoDB instance for fast retrieval. Raw email bodies are fetched live from Gmail and cached briefly in the browser session — they are not persisted to the database.

**Can Auren send emails without my approval?**
No. Every action — including sending emails — requires explicit confirmation through the HITL review UI. The agent cannot bypass this gate.

**What AI models does Auren use?**
Planning: Groq (Llama 3.3-70B) — fast, free tier, 128k context. Classification: Anthropic Claude Haiku — cost-effective per-email priority detection.

**Is Auren production-ready?**
Auren is in active development (v0.3.x). The security model, multi-tenant isolation, and HITL controls are production-grade. Token encryption at rest and webhook rate limiting are in progress.

**Can I self-host Auren?**
Yes — it's MIT licensed. You need a MongoDB instance, Clerk account, Corsair account, and API keys for Groq and Anthropic. Docker support is on the roadmap.

---

## Contributing

We welcome contributions. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for setup instructions, commit conventions, and the PR process.

---

## License

MIT — see [`LICENSE`](LICENSE) for details.

---

## Author

Built by **Pranav Gawai** — [X / Twitter](https://x.com/pranavgawaii_) · [Portfolio](https://pranavx.in)

---

<div align="center">
<i>The execution layer between thinking and doing.</i>
</div>
