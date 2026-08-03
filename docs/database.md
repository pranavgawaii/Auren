# Database: Where Your Data Lives

Auren uses a database called MongoDB to store your information. Think of the database as a giant filing cabinet with different drawers for different types of information. 

Below is a plain-English guide to what is stored in each drawer (we call them "collections").

---

## The Collections (The Drawers)

### 1. `emails`
**What this is:** Your Inbox.
**Why we need it:** When Corsair fetches your emails from Gmail, we save a copy here. This allows Auren's dashboard to load instantly when you open it, rather than making you wait for Google to respond every single time. It also stores the priority ("Urgent", "Normal", "FYI") that the AI assigned to each email.

### 2. `calendar_events`
**What this is:** Your Schedule.
**Why we need it:** Similar to emails, we keep a synced copy of your upcoming Google Calendar events here so the dashboard calendar is always snappy. This is also where the AI saves the "Meeting Prep" notes it generates before your calls.

### 3. `agent_actions`
**What this is:** The Audit Log (or the History Book).
**Why we need it:** Every time you tell Auren to do something, we write it down here. If the AI sends an email, creates a calendar event, or runs into an error, it gets recorded. This is how the terminal can show you a history of everything you've ever asked the AI to do.

### 4. `contacts`
**What this is:** Your Address Book.
**Why we need it:** When you receive emails, Auren automatically saves the sender's info here. If you email someone 3 or more times, the AI automatically generates a tiny 1-sentence summary of your relationship with them, which helps it write better, more personalized emails in the future.

### 5. `team_contacts`
**What this is:** Your VIPs.
**Why we need it:** These are contacts you manually add to your "Team". When you tell the AI to "Reply to Rahul", the AI looks in this drawer to figure out *which* Rahul you mean and grabs his exact email address.

### 6. `user_preferences`
**What this is:** Your Settings.
**Why we need it:** This drawer remembers if you prefer the AI to sound "Formal" or "Casual", what time you start working, your time zone, and what GitHub repository you normally work in.

### 7. `user_rate_limits`
**What this is:** The Speed Limit.
**Why we need it:** AI costs money to run. This drawer just keeps a tally of how many commands you've run this hour to make sure no one abuses the system. (Note: Pro users have unlimited speed!).

### 8. `google_direct_tokens`
**What this is:** The Google Keys.
**Why we need it:** As mentioned in the Corsair integration, Auren needs a special connection to Google to create real Google Meet links. The digital keys for that connection are kept securely in this drawer.

---

## How Information Flows

1. **New email arrives:** Google tells Corsair. Corsair tells Auren. Auren puts the email in the `emails` drawer.
2. **You ask for a meeting:** The AI makes a plan. If you approve, Auren creates the event, then writes down what it did in the `agent_actions` drawer.
3. **A meeting is 35 minutes away:** Auren notices an upcoming event in the `calendar_events` drawer, tells the AI to generate some prep notes, and saves those notes back to the drawer so you can read them before your call.
