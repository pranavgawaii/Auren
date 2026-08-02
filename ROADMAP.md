# Roadmap

This document outlines what has been shipped, what is currently being worked on, and what is planned for future releases of Auren.

---

## ✅ Completed

### Core Agent Loop
- [x] Natural language command intake via terminal drawer and `⌘K` palette
- [x] AI planning via Groq (Llama 3.3-70B) — structured JSON action plan
- [x] Human-in-the-Loop confirmation UI — review and edit every action before execution
- [x] Parallel tool execution via Corsair SDK
- [x] Full audit log — every command, tool, input, output, timestamp

### Gmail
- [x] Read inbox with real-time priority classification (Urgent / Normal / FYI via Claude Haiku)
- [x] Send emails via agent command
- [x] Create drafts
- [x] Archive emails
- [x] Real-time webhook pipeline (Corsair → classification → MongoDB)
- [x] Mark emails as read (local + Gmail label sync)

### Google Calendar
- [x] List and display calendar events
- [x] Create calendar events via agent command
- [x] Auto-generate real Google Meet links via direct OAuth (`conferenceDataVersion=1`)
- [x] Meet-link chaining — inject live Meet URL into a paired gmail_send body
- [x] Meeting prep briefing cards (auto-generated 35 min before meetings from email history)
- [x] Calendar → MongoDB sync

### GitHub
- [x] Create GitHub issues from natural language
- [x] List repository issues
- [x] Submit PR reviews

### Platform
- [x] Clerk authentication with middleware-level route protection
- [x] MongoDB Atlas document store (migrated from Supabase)
- [x] Team contacts management with @mention resolution
- [x] Rate limiting (1,000 commands/hour free, unlimited Pro)
- [x] Dark mode
- [x] Keyboard-first design (`⌘K`, `R`, `E`, `J`/`K`, `C`, `?`)
- [x] Admin analytics panel
- [x] Guided onboarding flow

### Security (v0.3.0)
- [x] Tenant isolation — all DB writes scoped to authenticated `userId` (not hardcoded)
- [x] IDOR fix on email search — removed client-supplied `userId` parameter
- [x] Timing-safe webhook secret comparison (`crypto.timingSafeEqual`)
- [x] Fail-closed webhooks (reject if `WEBHOOK_SECRET` unset)
- [x] Email iframe sandbox hardening (removed `allow-same-origin`)
- [x] Prompt injection guard (XML-tagged untrusted content)
- [x] ReDoS prevention (regex escaping on search queries)
- [x] Content Security Policy header

---

## 🔄 In Progress

### Security
- [ ] **OAuth token encryption at rest** — AES-256-GCM encryption of `access_token` and `refresh_token` in `google_direct_tokens` collection
- [ ] **Webhook rate limiting** — per-tenant request rate limiting on `/api/webhooks/*` to prevent flooding

### Developer Experience
- [ ] **GitHub Actions CI** — TypeScript check + lint on every PR
- [ ] **Admin RBAC via env var** — replace hardcoded admin email with `process.env.ADMIN_EMAIL`

---

## 📋 Planned (v0.4.x)

### Integrations
- [ ] **Google Sheets** — log email summaries and events to spreadsheets via agent command
- [ ] **Slack** — notify a channel when agent actions complete
- [ ] **Notion** — save email summaries and meeting notes to a workspace
- [ ] **Linear** — create tickets from GitHub or email context

### Gmail
- [ ] **Multi-account Gmail support** — connect and switch between multiple Google accounts
- [ ] **Thread view** — display full email threads, not just single messages
- [ ] **Batch archive** — archive all FYI emails in one command

### Calendar
- [ ] **Availability-aware scheduling** — check calendar before proposing meeting times
- [ ] **Recurring event support** — create weekly/daily recurring events

### Platform
- [ ] **Razorpay / Stripe Pro subscription** — billing integration for Pro tier
- [ ] **MongoDB text indexes** — full-text index on `subject`, `snippet`, `body` for bounded search query time
- [ ] **PostgreSQL adapter** — alternative to MongoDB for self-hosters
- [ ] **`security.txt`** at `/.well-known/security.txt`

---

## 🔭 Future Vision (v1.0+)

### Self-Hosting
- [ ] **Docker Compose** — single-command local deployment with MongoDB + app container
- [ ] **Ollama integration** — run the planning model locally (Llama 3.3 via Ollama) for fully offline self-hosted mode
- [ ] **Helm chart** — Kubernetes deployment for teams

### Agent Intelligence
- [ ] **Agent memory** — long-term context store, remembering user preferences across sessions
- [ ] **Multi-step reasoning** — agentic loops that can query results and re-plan (e.g., "check if Rahul replied, if not send a follow-up")
- [ ] **Proactive suggestions** — agent surfaces actions before the user asks (e.g., "you have 3 unread urgent emails")
- [ ] **Voice command input** — Web Speech API integration for hands-free commands

### Collaboration
- [ ] **Shared agent history** — team members can view each other's agent actions (with permission)
- [ ] **Delegated execution** — manager approves actions on behalf of a report

---

## Milestone Mapping

| Milestone | Target | Key Deliverables |
|---|---|---|
| `v0.3.x` — Security Hardening | Done | Token isolation, webhook hardening, CSP, ReDoS fix |
| `v0.4.0` — Integrations Expansion | Q3 2026 | Slack, Notion, Google Sheets, Linear |
| `v0.5.0` — Platform Maturity | Q4 2026 | Billing, multi-account, text search indexes, CI |
| `v1.0.0` — Self-hostable Release | Q1 2027 | Docker, Ollama, Helm, agent memory |
