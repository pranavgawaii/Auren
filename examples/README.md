# Auren — Example Commands

A library of realistic commands with their expected Auren output. Use these to understand what Auren can do and how to phrase commands effectively.

---

## Email + Calendar (Chained)

### Reply and schedule

**Command:**
```
Reply to Rahul confirming tomorrow 3 PM and send a calendar invite with a Meet link.
```

**What Auren plans:**
1. `calendar_create` — "Sync with Rahul" · tomorrow 3–3:30 PM IST · attendees: rahul@acmecorp.in · withMeetLink: true
2. `gmail_send` — to: rahul@acmecorp.in · subject: "Tomorrow 3 PM confirmed" · body includes real Meet URL injected from step 1

**Notes:**
- Auren executes `calendar_create` first to get the Meet link, then injects it into the email body before sending.
- The `[Auto-generated upon execution]` placeholder is never sent to the recipient.

---

### Follow-up after no reply

**Command:**
```
Send Priya a polite follow-up about the invoice and schedule a 15-minute call this week.
```

**What Auren plans:**
1. `calendar_create` — "Quick call with Priya" · next available slot within working hours · attendees: priya@bluewave.co
2. `gmail_send` — polite follow-up email referencing the pending invoice, with the calendar event details

---

## Email-Only

### Reply from selected email

> Select an email first, then type:

**Command:**
```
Reply to this email and let them know I'll have it done by Friday EOD.
```

**What Auren plans:**
1. `gmail_send` — to: original sender · subject: "Re: [original subject]" · body: professional reply with Friday deadline

---

### Batch reply

**Command:**
```
Send Ananya a reply confirming I'm available for the interview on Thursday 4 PM.
```

**What Auren plans:**
1. `gmail_send` — to: ananya.singh@krutrim.ai · subject: "Re: SDE-1 Interview — Thursday 4PM IST" · confirmation email

---

## GitHub

### Create issue from selected email

> Select an email about a bug or feature request, then type:

**Command:**
```
Create a GitHub issue from this email and label it as a bug.
```

**What Auren plans:**
1. `github_create_issue` — repoUrl: (configured default repo) · title: derived from email subject · body: structured from email content · labels: ["bug"]

---

### Create issue with explicit repo

**Command:**
```
Create a GitHub issue in github/Auren titled "Add Slack integration" with the description "Users should be able to send Slack messages as part of an agent command."
```

**What Auren plans:**
1. `github_create_issue` — repoUrl: https://github.com/8TEEH/Auren · title: "Add Slack integration" · body: "Users should be able to..."

---

### List open issues

**Command:**
```
What are the open issues in github/Auren?
```

**What Auren plans:**
1. `github_list_issues` — repoUrl: https://github.com/8TEEH/Auren · state: "open"

**Response type:** No external action. Auren returns the list in its explanation. `requiresConfirmation: false`.

---

### Submit a PR review

**Command:**
```
Approve PR #142 in github/Auren with a comment saying "LGTM, great refactor."
```

**What Auren plans:**
1. `github_review_pr` — repoUrl: https://github.com/8TEEH/Auren · pullNumber: 142 · event: "APPROVE" · body: "LGTM, great refactor."

---

## Calendar-Only

### Schedule a meeting

**Command:**
```
Schedule a 30-minute Google Meet with Hitesh tomorrow at 10 AM.
```

**What Auren plans:**
1. `calendar_create` — "Google Meet with Hitesh" · tomorrow 10:00–10:30 AM IST · attendees: [resolved from @Hitesh in team contacts] · withMeetLink: true

---

### Check availability and schedule

**Command:**
```
Schedule a meeting after checking my calendar for a free slot this afternoon.
```

**What Auren does:**
- Returns `requiresConfirmation: false` with a `followUpQuestion`:
  > "I don't have live access to your calendar in this turn. Please tell me which time slot works and I'll create the event."

**Note:** Auren does not query the calendar inline during planning. Use the Calendar panel to find a free slot first, then command Auren with a specific time.

---

## Compound / Multi-step

### Email + GitHub + Calendar in one command

**Command:**
```
Reply to Rahul saying we'll fix the bug by Monday, create a GitHub issue for it, and schedule a 30-minute review meeting with him on Monday at 11 AM.
```

**What Auren plans:**
1. `github_create_issue` — bug report derived from email context
2. `calendar_create` — "Bug review with Rahul" · Monday 11:00–11:30 AM IST · attendees: rahul@acmecorp.in · withMeetLink: true
3. `gmail_send` — reply with Monday commitment, GitHub issue link, and Meet link

---

## Daily Briefing

**Command:**
```
What does my day look like?
```

**What Auren does:**
- If your current inbox data is passed in context: summarises today's events and urgent emails.
- Otherwise: explains that the Home screen already shows a live view of your schedule, inbox, and recent commands.
- `requiresConfirmation: false` — no external actions.

---

## Mention Resolution

**Command:**
```
Send @Rahul the invoice and copy @Priya.
```

**What Auren does:**
- Looks up `@Rahul` and `@Priya` in your saved team contacts.
- If found: resolves to real email addresses and uses them in `to` and (if applicable) as CC or additional recipients.
- If not found: asks via `followUpQuestion` — never guesses an email address.

---

## Tips for Writing Commands

| ✅ Works well | ❌ Avoid |
|---|---|
| Include the person's name from your team contacts | Vague references like "send it to them" |
| Specify the time zone or say "IST" for clarity | Ambiguous times like "tomorrow" without a day |
| Mention "Meet link" explicitly for video calls | Assuming Meet will be added automatically |
| Reference the selected email explicitly | Expecting Auren to find a specific email without context |
| Use `@Name` for team contacts | Typing partial email addresses |
