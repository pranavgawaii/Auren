# How Auren Works: The Blueprint

If Auren were a house, this document explains how the rooms are connected. Let's break down how the different pieces of the app talk to each other in plain English.

---

## The Big Picture

At a high level, Auren is split into three main layers:

1. **The Dashboard (What you see):** This is the web interface where you read emails, view your calendar, and type commands into the terminal.
2. **The Brain (The AI Planner):** When you type a command, it goes here. The AI thinks about what you asked, looks at your emails, and comes up with a step-by-step plan.
3. **The Hands (The Execution Layer):** Once you approve the AI's plan, this layer actually does the work—sending the email, creating the calendar event, etc.

---

## 1. The Dashboard (The Rooms)
*Where it lives: `src/components/auren/app/`*

This is the front-end of the application. It handles:
- Showing you your inbox and calendar.
- Providing a terminal where you can type commands to the AI.
- Asking for your permission before the AI actually does anything (we call this the "Human-in-the-Loop" gate).

---

## 2. The Brain (The AI Planner)
*Where it lives: `src/agents/executor.ts`*

When you tell Auren to "Reply to Rahul and set up a meeting for Thursday", the AI doesn't just blindly send an email. It goes to the **Planning Layer**.

Here's how the AI thinks:
1. It gathers context. It looks at the email you're currently reading and checks what date and time it currently is in the real world.
2. It talks to a powerful AI model (Llama 3) to figure out the exact steps needed to fulfill your request.
3. It creates a "Plan" (e.g., Step 1: Create Calendar Event, Step 2: Send Email).
4. **Crucially, it stops here.** It sends the plan back to your screen so you can approve it before it actually happens.

---

## 3. The Hands (The Execution Layer)
*Where it lives: `src/app/actions/execute.ts`*

Once you click "Confirm & Execute" on the dashboard, the Execution Layer takes over. It runs the steps in the plan one by one.

**Why one by one?**
Because sometimes actions depend on each other. For example, if you want to send a Google Meet link in an email, the app first needs to create the calendar event, grab the newly generated Meet link, and *then* paste it into the email body before hitting send.

Once all the steps are done, it records everything in a history log so you can always see what the AI did.

---

## 4. Talking to the Outside World

Auren needs to talk to Google (for Gmail and Calendar) and GitHub. Instead of managing all those messy connections ourselves, we use two helpers:

- **Corsair (The Middleman):** Corsair handles logging in and reading/writing emails and GitHub issues.
- **Direct Google Connection:** For one very specific thing—creating real Google Meet links—Auren has to bypass Corsair and talk directly to Google.

---

## 5. Staying Up to Date

When you receive a new email, Google knocks on Auren's door (via a "webhook") and says, "Hey, new email!"
Auren quickly grabs it, uses a smaller, faster AI to decide if it's "Urgent", "Normal", or "FYI", and saves it to your database so it appears on your dashboard instantly.
