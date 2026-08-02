# Contributing to Auren

Thank you for your interest in contributing. Auren is an open-source AI productivity agent and we welcome pull requests, bug reports, and feature ideas.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Development Setup

### 1. Fork and clone

```bash
git clone https://github.com/<your-username>/auren.git
cd auren
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` — see [README.md](README.md#environment-variables) for all required variables.

Minimum required to run locally:
- `MONGODB_URI` — a free [MongoDB Atlas](https://mongodb.com/atlas) cluster
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — [Clerk](https://clerk.com) (free)
- `GROQ_API_KEY` — [Groq](https://groq.com) (free tier, 14,400 req/day)

The Corsair integration is optional for local development — the app gracefully falls back when integrations are not connected.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Seed demo data (optional)

```bash
npx ts-node -e "import('@/db/seed-demo.ts')"
```

Or run the seed script directly:

```bash
npx tsx src/db/seed-demo.ts
```

---

## Project Structure

See [README.md § Project Structure](README.md#project-structure) for the full annotated tree.

Key areas for contributors:

| Path | What it does |
|---|---|
| `src/agents/executor.ts` | LLM reasoning engine — analyzes natural language commands |
| `src/app/actions/execute.ts` | Dispatches the approved action plan to external APIs |
| `src/app/actions/` | All Server Actions (one file per domain) |
| `src/app/api/webhooks/` | Real-time event handlers (Gmail, Calendar) |
| `src/components/auren/app/` | Dashboard UI components |
| `src/lib/corsair.ts` | Corsair SDK integration layer |
| `src/lib/google-direct.ts` | Direct Google OAuth (Meet link generation) |
| `docs/` | Extended technical documentation |

---

## Coding Standards

### TypeScript

- All new code must be fully typed — no `any` unless unavoidable and explicitly justified with a comment.
- Use `unknown` instead of `any` for error catch blocks.
- Prefer explicit return types on exported functions.

### Server Actions

- All database queries must be scoped to `const userId = await getUserId()` — never accept a `userId` from the client.
- Follow the existing pattern: validate input → resolve userId → query DB → return `{ success, data?, error? }`.

### React / Next.js

- Use the App Router. No Pages Router additions.
- Server Components by default. Add `"use client"` only when you need browser APIs or interactivity.
- Do not fetch data in Client Components — pass it as props from the Server Component parent.

### Styling

- Vanilla Tailwind CSS only. No additional CSS-in-JS libraries.
- Match the existing design tokens (`#E8593C` brand red, `#241B14` dark text, `#FBF3EC` warm background).

### Error handling

- Server Actions must always return a typed `{ success: boolean }` union — never `throw` to the client.
- Log errors to `console.error` before returning the failure object.
- Never expose raw error messages from third-party APIs to the client response.

---

## Commit Convention

Auren follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `security` | Security fix or hardening |
| `docs` | Documentation only |
| `refactor` | Code change with no behaviour change |
| `test` | Adding or updating tests |
| `chore` | Build, CI, dependency updates |
| `perf` | Performance improvement |

### Examples

```
feat(calendar): add meeting prep briefing card generation

fix(search): escape regex special chars to prevent ReDoS

security(webhooks): replace string equality with timingSafeEqual

docs(architecture): add execution flow diagram

chore(deps): upgrade next to 15.1.0
```

### Scope

Use the area of the codebase the change touches: `auth`, `calendar`, `email`, `github`, `agent`, `ui`, `webhooks`, `db`, `docs`, `ci`.

---

## Pull Request Process

1. **Branch from `main`**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Keep scope focused** — one PR per feature or fix. Large PRs are harder to review and slower to merge.

3. **Check TypeScript**

   ```bash
   npx tsc --noEmit
   ```

   PRs must not introduce new TypeScript errors.

4. **Self-review your diff** before opening the PR. Check for:
   - No hardcoded secrets or user IDs
   - No `DEMO_USER_ID` in database writes
   - No client-supplied `userId` trusted in Server Actions
   - Error paths handled

5. **Write a clear PR description**
   - What does this change do?
   - Why is it needed?
   - How did you test it?
   - Any screenshots for UI changes

6. **Link the related issue** using `Closes #123` in the PR body if applicable.

7. **One approving review** is required from a maintainer before merge.

8. **Squash merge** is preferred for feature PRs. Fix commits can be merged directly.

---

## Reporting Bugs

Open a GitHub Issue using the **Bug Report** template. Include:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser / Node.js version
- Any relevant console output

For **security vulnerabilities**, do not open a public issue — see [SECURITY.md](SECURITY.md).

---

## Suggesting Features

Open a GitHub Issue using the **Feature Request** template. Describe:
- The problem you are trying to solve
- Your proposed solution
- Alternatives you considered
- Any relevant examples from similar products

---

## Code of Conduct

Be respectful. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
