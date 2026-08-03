# Execution Flow: The Story of a Command

This document tells the story of exactly what happens when you type a command into Auren. Let's follow a single command from the moment you hit "Enter" to the moment the job is done.

---

## The Request
Imagine you are looking at an email from your coworker, Rahul. You open Auren's terminal and type:

> *"Reply to Rahul confirming Thursday 3 PM and send a calendar invite with a Meet link."*

Here is exactly what happens next.

---

## Step 1: The AI Gathers Context
Before Auren does anything, it needs to know what's going on. It quickly grabs a few pieces of information:
- **Who is Rahul?** It looks in your Team Contacts to find Rahul's exact email address.
- **What time is it right now?** It checks the current date and time so it knows what "Thursday" means.
- **What email are we looking at?** It grabs the text of Rahul's email so the AI knows what to reply to.

## Step 2: The AI Thinks (The Planning Stage)
Auren packages all this context up and sends it to our AI brain (a powerful model called Llama 3). 

It tells the AI: *"Here is what the user asked for. Please give me a step-by-step plan on how to do it using the tools you have."*

The AI thinks for a second, and sends back a plan that looks like this:
1. **Action 1:** Create a 30-minute Google Calendar event with Rahul for Thursday at 3 PM, and make sure to generate a Google Meet link.
2. **Action 2:** Send an email to Rahul that says, "Thursday at 3 PM confirmed. Here is the meeting link."

## Step 3: You Double-Check the Plan
Auren doesn't just blindly send the email. Instead, a card pops up on your screen that says:

*"Here is my plan: I'm going to create this calendar event, and then I'm going to send this exact email. Do you want me to do it?"*

You can read the email draft, change the time of the meeting, or tweak the wording. Once it looks perfect, you click **"Confirm & Execute"**.

## Step 4: Auren Gets to Work
Now the real work begins. Auren does things in a very specific order.

First, it creates the calendar event. Why? Because it needs Google to generate the Meet link.
Once Google says, *"Done! Here is your link: meet.google.com/abc-defg-hij"*, Auren grabs that link.

Next, Auren prepares the email. It takes the draft the AI wrote, magically pastes that newly generated Meet link into the body of the email, and hits Send.

## Step 5: Recording the History
Finally, Auren writes a quick note in the database's History Book (the `agent_actions` collection). It records what you asked for, what the AI planned, and the exact time the email was sent. 

Your screen updates to show that the job was completed successfully, and Auren goes back to sleep, waiting for your next command.
