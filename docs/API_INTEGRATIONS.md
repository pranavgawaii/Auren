# Multi-App Integrations & Safety Gate — Auren

This document outlines how Auren integrates with Google Workspace (Gmail, Google Calendar) and GitHub via the Corsair App SDK while maintaining execution safety.

---

## 🔌 Unified Tool Invocation Engine

Auren avoids writing ad-hoc API wrappers for every service by integrating the **Corsair App SDK**, which acts as a unified integration gateway.

### Supported Tools & Actions

| Provider | Tool Key | Parameters Executed |
| :--- | :--- | :--- |
| **Gmail** | `gmail_send` | `toEmail`, `subject`, `bodyText` |
| **Google Calendar** | `calendar_create` | `summary`, `startTime`, `endTime`, `attendees` (Generates Google Meet link) |
| **GitHub** | `github_issue` | `repo`, `title`, `body` |

---

## 🔒 Human-in-the-Loop 2-Stage State Machine

To eliminate dangerous AI side-effects (e.g. sending unverified emails or creating duplicate issues), Auren implements a strict 2-stage state machine:

```
[ Natural Language Command ]
            │
            ▼
[ OpenRouter Parsing (Zod Validation) ]
            │
            ▼
[ Stage 1: Action Logged as 'PENDING' in MongoDB ]
            │
            ▼
[ Interactive UI Review Modal Displayed ]
            │
    (User Clicks "Approve")
            │
            ▼
[ Stage 2: Parallel Corsair SDK Dispatch ] ──► Status: 'COMPLETED'
```

---

## 📩 Real-Time Gmail Webhook Classification

1. Gmail Push Notifications trigger `/api/webhooks/gmail`.
2. Header HMAC signatures are validated to prevent unauthorized request spoofing.
3. Claude Haiku evaluates the snippet and assigns a priority label:
   - `URGENT`: Requires immediate attention.
   - `NORMAL`: Standard email message.
   - `FYI`: Automated newsletter or update.
4. Message and contact details are stored in MongoDB collections (`emails`, `contacts`).
