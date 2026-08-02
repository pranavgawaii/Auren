# Changelog

All notable changes to Auren are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Auren uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### In Progress
- Encrypted OAuth token storage at rest (AES-256-GCM)
- Webhook rate limiting per tenant
- Admin RBAC via environment variable instead of hardcoded email

---

## [0.3.0] — 2026-08-02

### Security — Critical Fixes
- **[SECURITY]** Fixed multi-tenant IDOR: `create-event.ts`, `archive-email.ts`, `send-email.ts`, and `create-github-issue.ts` were all using a hardcoded `DEMO_USER_ID` instead of resolving the authenticated caller from the server session. All four now call `await getUserId()`.
- **[SECURITY]** Fixed cross-tenant email search: `searchEmails()` accepted a `userId` parameter from the client. Removed the parameter — user identity is now resolved exclusively server-side via `getUserId()`.
- **[SECURITY]** Fixed webhook timing attack: replaced `===` string comparison with `crypto.timingSafeEqual()` in both `/api/webhooks/gmail` and `/api/webhooks/calendar`.
- **[SECURITY]** Webhooks now fail-closed: if `WEBHOOK_SECRET` is not configured, all webhook requests are rejected with `503` instead of being accepted silently.
- **[SECURITY]** Fixed email iframe DOM escape: removed `allow-same-origin` and `allow-popups-to-escape-sandbox` from the email viewer iframe sandbox attribute. Email HTML now runs with `origin: null`.
- **[SECURITY]** Fixed ReDoS: user-supplied search queries are now regex-escaped before constructing the `RegExp` pattern.
- **[SECURITY]** Added Content Security Policy header to `next.config.mjs`.

### Features
- Added prompt injection guard in `executor.ts`: external email content is wrapped in `<untrusted_email_context>` XML tags with an explicit system-level guard instruction.
- Webhook routes now explicitly cast all payload string fields to `String()` before database writes.

---

## [0.2.0] — 2026-07-15

### Features
- **Meet-link chaining**: when a command includes both `calendar_create` (with `withMeetLink: true`) and `gmail_send`, the real Meet URL from the calendar creation is automatically injected into the email body before sending — no placeholder reaches the recipient.
- **Meeting prep briefing cards**: 35 minutes before a calendar event, Auren auto-generates a briefing card from the user's email history with attendees using Claude Haiku.
- **Direct Google Calendar OAuth** (`src/lib/google-direct.ts`): separate OAuth grant to call `events.insert` with `conferenceDataVersion=1`, which is the only way to provision a real Google Meet room (Corsair's calendar endpoint does not support this parameter).
- **Team contacts + @mention resolution**: users can save team contacts; the agent resolves `@Name` mentions to email addresses in the planning prompt. Includes duplicate prevention, email validation, and auto-seed from Gmail history.
- **Dark mode**: full dark/light theme toggle with `prefers-color-scheme` support.
- **`disconnectGoogleMeet` action**: users can revoke the direct Google OAuth grant from settings without disconnecting their main Corsair integration.

### Improvements
- `trimEmailBody()` in `executor.ts`: strips quoted reply chains and HTML tags before sending email body to the LLM, preventing 413 token-cap errors on threaded conversations.
- Prompt budget constants (`MAX_BODY_CHARS`, `MAX_SNIPPET_CHARS`, `MAX_HISTORY_TURNS`, `MAX_HISTORY_CHARS`) added to `executor.ts` to cap unbounded prompt growth.
- Parameter alias normalization: the executor now handles LLM outputs that use `params`, `args`, or `input` instead of `parameters`, and aliases like `summary` → `title`, `hasMeetLink` → `withMeetLink`.
- `markEmailAsRead()`: marks emails as read both locally in MongoDB and in Gmail (label removal is best-effort; local state succeeds even if Gmail label API fails).

### Bug Fixes
- Calendar events created via Corsair now also write `zoom_link` from the `hangoutLink` field in the Google API response.
- Fixed `getCalendarEvents()` to trigger a background sync when the DB is empty on first load, rather than returning an empty list.
- Fixed duplicate contact creation in `updateContacts()` by using `upsert: true` keyed on `{ user_id, email }`.

---

## [0.1.0] — 2026-06-20

### Initial Release

- **Core agent loop**: natural language command → Groq/Llama 3.3-70B planning → structured JSON action plan → Human-in-the-Loop confirmation UI → parallel Corsair API execution → MongoDB audit log.
- **Gmail integration**: read inbox, send email, create draft, archive email, real-time priority classification via Corsair webhook + Claude Haiku.
- **Google Calendar integration**: list events, create events (via Corsair), sync to MongoDB.
- **GitHub integration**: create issues, list issues, submit PR reviews.
- **Auth**: Clerk authentication with middleware protecting all dashboard routes. Admin panel with hardcoded email RBAC.
- **Rate limiting**: command rate limit (1,000/hour), sync cooldown (3 minutes). Pro users bypass via Clerk public metadata.
- **Email search**: regex-based search across subject, snippet, body, and sender.
- **Agent history**: full audit log of every command, planned actions, and execution results.
- **Keyboard shortcuts**: `⌘K` palette, `R` reply, `E` archive, `J`/`K` navigate, `C` compose, `?` help.
- **Onboarding**: guided workspace setup connecting Google Workspace and GitHub in < 1 minute.
- **Security headers**: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **MongoDB**: replaced Supabase with MongoDB Atlas for flexible document storage (no schema migrations for evolving AI data shapes).

---

[Unreleased]: https://github.com/pranavgawaii/auren/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/pranavgawaii/auren/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/pranavgawaii/auren/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/pranavgawaii/auren/releases/tag/v0.1.0
