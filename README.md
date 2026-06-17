# Auren — AI Execution Layer

> The execution layer between thinking and doing.

**Live:** https://tryauren.dev  
**Demo video:** [link]  
**X post:** [link]  
**LinkedIn post:** [link]

---

## What makes Auren different from a Gmail clone

1. **Human-in-the-Loop AI** — Agent shows full plan before any action executes
2. **Parallel multi-tool execution** — Gmail reply + Calendar event fire simultaneously  
3. **Real-time Corsair webhooks** — Emails and events arrive live, no polling
4. **Multi-model AI stack** — OpenRouter for reasoning, Claude Haiku for per-email classification
5. **Keyboard-first design** — ⌘K command palette, R/E shortcuts, voice input

---

## Corsair Features Used

- `gmail.api.messages.list` + `.get` — Read and display emails
- `gmail.api.messages.send` — Send emails via agent
- `gmail.api.drafts.create` — Save email drafts
- `gmail.db.messages.search` — Corsair search API for fast email search
- `googlecalendar.db.events.search` — List calendar events
- `googlecalendar.api.events.create` — Create events with Google Meet links
- `github.api.issues.create` — Create GitHub issues via agent
- `github.api.issues.listForRepo` — List repository issues
- `github.api.pulls.createReview` — Submit PR reviews
- Corsair MCP (JSON-RPC) — Full agent reasoning and execution
- Real-time Gmail webhooks — Live email classification
- Real-time Calendar webhooks — Live event sync

---

## Bonus Tasks Completed

- [x] Corsair MCP agent chat with human-in-the-loop confirmation
- [x] Real-time webhooks for Gmail AND Calendar
- [x] AI priority filtering via Claude Haiku (urgent/normal/fyi)
- [x] Keyboard shortcuts (R reply, E archive, ⌘K palette, C compose, ? help)
- [x] Corsair search API with fast local DB search
- [x] GitHub integration (issues, PRs, reviews) — beyond requirements
- [x] Voice input via Web Speech API
- [x] Dark/light theme with persistence
- [x] Agent action history with full audit trail
- [x] Google Meet auto-generation on event creation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Database | Supabase (Postgres + RLS) |
| Auth | Clerk |
| AI | OpenRouter (agent reasoning), Claude 3.5 Haiku (classification) |
| Integrations | Corsair MCP — Gmail, Calendar, GitHub |
| Deploy | Vercel |

---

## Setup

```bash
git clone https://github.com/pranavgawaii/Auren
cd Auren
npm install
cp .env.example .env.local
# Fill in env vars (see below)
npm run dev
```

---

## Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CORSAIR_INSTANCE_ID=
CORSAIR_TENANT_ID=
CORSAIR_DEV_KEY=
CORSAIR_MCP_TOKEN=
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=
WEBHOOK_SECRET=
DEMO_REPLY_EMAIL=
```

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
