create extension if not exists vector with schema extensions;

create table emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  gmail_id text unique not null,
  thread_id text not null,
  from_email text not null,
  from_name text not null,
  subject text not null,
  snippet text not null,
  body text not null,
  priority text not null check (priority in ('urg', 'nrm', 'fyi')),
  is_read boolean default false not null,
  is_archived boolean default false not null,
  embedding vector(1536),
  received_at timestamptz not null,
  created_at timestamptz default now() not null
);

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  gcal_id text unique not null,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  attendees jsonb default '[]'::jsonb not null,
  location text,
  zoom_link text,
  description text,
  prep_card_sent boolean default false not null,
  created_at timestamptz default now() not null
);

create table agent_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  command text not null,
  status text not null check (status in ('pending', 'approved', 'rejected', 'completed', 'failed')),
  actions_taken jsonb default '[]'::jsonb not null,
  error_message text,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  email text not null,
  name text not null,
  relationship_summary text,
  last_email_date timestamptz,
  email_count integer default 0 not null,
  updated_at timestamptz default now() not null
);

create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users unique not null,
  reply_tone text default 'formal' not null,
  working_hours_start time default '09:00' not null,
  working_hours_end time default '18:00' not null,
  timezone text default 'Asia/Kolkata' not null,
  github_repo text,
  created_at timestamptz default now() not null
);

create table integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  provider text not null,
  status text default 'disconnected' not null,
  connected_at timestamptz,
  unique (user_id, provider)
);

alter table emails enable row level security;
alter table calendar_events enable row level security;
alter table agent_actions enable row level security;
alter table contacts enable row level security;
alter table user_preferences enable row level security;
alter table integrations enable row level security;

create policy "users can access own emails"
  on emails for all
  using (user_id = auth.uid());

create policy "users can access own calendar events"
  on calendar_events for all
  using (user_id = auth.uid());

create policy "users can access own agent actions"
  on agent_actions for all
  using (user_id = auth.uid());

create policy "users can access own contacts"
  on contacts for all
  using (user_id = auth.uid());

create policy "users can access own preferences"
  on user_preferences for all
  using (user_id = auth.uid());

create policy "users can access own integrations"
  on integrations for all
  using (user_id = auth.uid());

create index idx_emails_user_id on emails (user_id);
create index idx_emails_received_at on emails (received_at desc);
create index idx_emails_thread_id on emails (thread_id);
create index idx_emails_priority on emails (priority);
create index idx_calendar_events_user_id on calendar_events (user_id);
create index idx_calendar_events_start_at on calendar_events (start_at);
create index idx_agent_actions_user_id on agent_actions (user_id);
create index idx_agent_actions_status on agent_actions (status);
create index idx_contacts_user_id on contacts (user_id);
create index idx_contacts_email on contacts (email);
create index idx_integrations_user_id on integrations (user_id);

-- Waitlist table definition
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  use_case text,
  source text,
  created_at timestamptz default now() not null
);

alter table waitlist enable row level security;
-- Only the service role key can insert/read waitlist entries. No public policies are enabled.

