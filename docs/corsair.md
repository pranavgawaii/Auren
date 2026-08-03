# Corsair Integration: The Middleman

Auren needs to read your emails, manage your calendar, and create GitHub issues. But asking you to hand over your actual Google password is a massive security risk.

Instead, we use a service called **Corsair**. Think of Corsair as a highly secure "middleman" or "broker". 

When you click "Connect Gmail", you actually log into Google and grant permission to Corsair. Corsair then acts as a secure bridge between Auren and your Google account. Auren never sees or stores your raw passwords.

---

## What does Corsair actually do for us?

Whenever the AI needs to perform an action, Auren taps Corsair on the shoulder and asks it to do the heavy lifting.

### 1. Reading and Searching Emails
When Auren needs to find an email or load your inbox, it asks Corsair to fetch the data from Google.

```typescript
// Example: Asking Corsair to search for emails from Rahul
await tenant.run("gmail.db.messages.search", {
  query: "from:rahul@acmecorp.in",
  limit: 10,
})
```

### 2. Sending Emails
When the AI writes an email, it hands the final draft to Corsair, who then securely passes it to Gmail to actually send it.

```typescript
// Example: Asking Corsair to send an email on your behalf
await tenant.run("gmail.api.messages.send", {
  userId: "me",
  raw: yourEmailDraft,
})
```

### 3. Creating GitHub Issues
If you ask the AI to track a bug, it uses Corsair to talk to GitHub and open an issue in your repository.

```typescript
// Example: Asking Corsair to open a GitHub issue
await tenant.run("github.api.issues.create", {
  owner: "pranavgawaii",
  repo: "Auren",
  title: "Fix the login bug",
  body: "Users can't log in.",
})
```

---

## Real-Time Notifications (Webhooks)

Corsair isn't just a messenger; it's also a lookout. 

When someone sends you a new email, Google alerts Corsair. Corsair immediately rings Auren's doorbell (this is called a "webhook") and says, "Hey! A new email just arrived!" 

This allows Auren to instantly update your dashboard without having to constantly refresh the page.

---

## The One Exception: Google Meet Links

There is one small thing Corsair can't do right now: generate real Google Meet links for calendar events. 

To solve this, Auren has a special, direct connection to Google just for creating Calendar events with Meet links. If you ask for a meeting with a link, Auren skips Corsair and talks directly to Google. For everything else, Corsair handles it!
