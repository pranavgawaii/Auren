# Auren

**The execution layer between thinking and doing.**

Auren is an AI-powered command center for Gmail, Google Calendar, and GitHub.
Type one natural language command — Auren plans the steps, shows you the
full execution plan, and executes everything simultaneously with a single approval.

<br />
<a href="https://www.youtube.com/watch?v=C-uXkFPFwmc"><code>➜ demo video: Watch 60-Second Demo</code></a><br>
<a href="https://tryauren.in"><code>➜ try live: tryauren.in</code></a><br>
<br />

---

## What is Auren?

Most productivity tools make you manage them.
Auren executes on your behalf.

Type: `reply to rahul confirming thursday 3pm and send a calendar invite`

Auren plans → shows you the full execution plan → Gmail replies + Calendar
event creates simultaneously → one approval, everything done in 4 seconds.

---

## Core Features

**Human-in-the-Loop Execution**
The agent always shows you the full plan before any API call is made.
Review, edit, or cancel — you are always in control.

**Premium Guided Onboarding**
A clean, guided workspace setup experience that gets you connected to Google Workspace (Gmail & Calendar) and GitHub in less than a minute, complete with a video setup walkthrough.

**Parallel Multi-Tool Execution**
One command fires Gmail, Google Calendar, and GitHub simultaneously.
Not sequentially. At the same time.

**Real-Time Inbox Classification**
Every incoming email is classified as Urgent, Normal, or FYI
by Claude Haiku via Corsair webhooks. No polling. Instant.

**Semantic Email Search**
Search your inbox by meaning, not just keywords.
Powered by vector embeddings and Corsair's DB search API.

**Agent History & Audit Trail**
Every action the AI takes is logged. Full transparency —
command, actions taken, timestamp, result.

**Keyboard-First Design**
⌘K command palette, R to reply, E to archive, J/K to navigate,
voice input via Web Speech API. Designed for power users.

**Google Meet Auto-Generation**
Every calendar event created through Auren automatically
includes a Google Meet link. No extra steps.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Framer Motion |
| Database | Supabase (PostgreSQL + RLS + Realtime) |
| Auth | Clerk |
| AI — Agent | OpenRouter (auto-routing to best model) |
| AI — Classification | Claude Haiku (per-email priority classification) |
| Integrations | Corsair MCP (Gmail, Google Calendar, GitHub) |
| Deploy | Vercel |

---

## Integrations via Corsair MCP

| Integration | Capabilities |
|---|---|
| **Gmail** | Read, send, draft, search, real-time webhooks |
| **Google Calendar** | List events, create events, Google Meet links, real-time webhooks |
| **GitHub** | Create issues, list issues, submit PR reviews |

All integrations are handled through Corsair's Model Context Protocol (MCP) —
a unified interface that lets the AI agent reason across all tools
without complex prompt engineering per integration.

---

## Architecture

```
User Command
     ↓
Corsair MCP ←→ Claude Sonnet (OpenRouter)
     ↓
┌────────────────────────────┐
│  Gmail API                 │
│  Google Calendar API       │  ← executes in parallel
│  GitHub API                │
└────────────────────────────┘
     ↓
Human-in-the-Loop Confirmation
     ↓
Execution + Agent History Log

Real-time webhook pipeline:
Gmail Inbox → Corsair Webhook → Claude Haiku → Priority Classification
           → Vector Embeddings → Supabase → Auren UI (live update)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Clerk account
- Corsair account (for integrations)
- OpenRouter API key
- Anthropic API key

### Installation

```bash
git clone https://github.com/pranavgawaii/auren
cd auren
npm install
cp .env.example .env.local
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Corsair
CORSAIR_INSTANCE_ID=
CORSAIR_TENANT_ID=
CORSAIR_DEV_KEY=
CORSAIR_MCP_TOKEN=

# AI
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://tryauren.in
WEBHOOK_SECRET=
DEMO_REPLY_EMAIL=
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── actions/          # Server actions (send email, create event, etc.)
│   ├── api/webhooks/     # Real-time Gmail + Calendar webhook handlers
│   ├── app/              # Main /app dashboard
│   ├── calendar/         # Full calendar view
│   ├── history/          # Agent action history
│   ├── github/           # GitHub activity view
│   ├── settings/         # User settings + integrations
│   └── docs/             # Documentation page
├── agents/
│   └── executor.ts       # Core AI agent + HITL execution engine
├── components/auren/     # All UI components
├── lib/
│   ├── corsair.ts        # Corsair MCP integration layer
│   ├── anthropic.ts      # Claude Haiku classification
│   └── rate-limit.ts     # Pro tier rate limiting
└── types/
    └── index.ts          # TypeScript types + Corsair types
```

---

## Agent Architecture

Auren uses a Human-in-the-Loop (HITL) pattern for all agent actions:

```
1. User types a natural language command
2. analyzeCommand() sends to OpenRouter (Claude Sonnet via auto-routing)
3. AI returns a structured JSON plan: { actions: [...] }
4. ActionConfirmation UI shows the full plan to the user
5. User reviews, optionally edits details, then confirms
6. executePlan() dispatches to Corsair APIs in parallel
7. Results logged to agent_actions table in Supabase
8. History panel updates in real time via Supabase Realtime
```

Available agent tools:
- `gmail_send` — Send an email via Gmail
- `calendar_create` — Create a Calendar event with Meet link
- `github_create_issue` — Create a GitHub issue
- `github_list_issues` — List repository issues
- `github_review_pr` — Submit a PR review

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` | Open command palette |
| `R` | Reply to selected email |
| `E` | Archive selected email |
| `J` / `K` | Navigate emails up/down |
| `C` | Compose new email |
| `?` | Show all keyboard shortcuts |
| `G` then `I` | Go to inbox |
| `G` then `C` | Go to calendar |
| `G` then `H` | Go to history |
| `/` | Focus search |
| `Escape` | Close/dismiss |

---

## Security

- **No phantom executions** — agent presents full plan before any API call
- **Strict OAuth scopes** — only requests Gmail read/write and Calendar write
- **Webhook verification** — HMAC signature check on all incoming webhooks
- **Rate limiting** — 1000 commands/hour standard, unlimited for Pro users
- **Row-level security** — all Supabase tables protected by RLS policies
- **Zero hardcoded secrets** — all credentials via environment variables

---

## Roadmap

- [ ] Google Sheets integration — log emails and events to spreadsheets
- [ ] Google Drive integration — attach and share documents via agent
- [ ] Slack integration — notify team on agent actions
- [ ] Notion integration — save email summaries to workspace
- [ ] Linear integration — create tickets from GitHub/email context
- [ ] Razorpay billing — Pro subscription tier
- [ ] pgvector semantic search — search inbox by meaning locally
- [ ] Multi-account Gmail support

---

## Contributing

Pull requests are welcome. For major changes please open an issue first.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Author

Developed by **Pranav Gawai** — [X/Twitter](https://x.com/pranavgawaii_) • [Portfolio](https://pranavx.in)

---

*The execution layer between thinking and doing.*
