-- Dispatch Line — shared workspace SMS inbox
-- One conversation / message / read / status store for the whole desk.
-- Filters and assignments are views, never copies.
-- Presence is ephemeral (BroadcastChannel / realtime presence) and is NOT persisted.
-- Apply in the Supabase SQL editor (or supabase db push). Demo mode does not require this.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Staff (Users) — individual logins, shared data
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'dispatcher'
    check (role in ('dispatcher', 'admin', 'manager', 'readonly')),
  created_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('dispatcher', 'admin', 'manager', 'readonly'));

-- ---------------------------------------------------------------------------
-- Tags (optional lane labels, combinable with groups)
-- ---------------------------------------------------------------------------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#c45c26',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Contact groups (many-to-many; a driver may be in Montreal + Owner Operators)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#c9a227',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Contacts / Drivers
-- ---------------------------------------------------------------------------
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null unique,
  notes text,
  driver_code text,
  truck text,
  terminal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.drivers add column if not exists driver_code text;
alter table public.drivers add column if not exists truck text;
alter table public.drivers add column if not exists terminal text;

create table if not exists public.driver_tags (
  driver_id uuid not null references public.drivers (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (driver_id, tag_id)
);

create table if not exists public.driver_groups (
  driver_id uuid not null references public.drivers (id) on delete cascade,
  group_id uuid not null references public.contact_groups (id) on delete cascade,
  primary key (driver_id, group_id)
);

-- ---------------------------------------------------------------------------
-- 1:1 conversations — GLOBAL read + shared workflow + assignment
-- Assignment never hides a thread; it is a filter view only.
-- There is NO per-user inbox or per-user unread table.
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null unique references public.drivers (id) on delete cascade,
  last_message_at timestamptz,
  last_message_preview text,
  unread_count integer not null default 0 check (unread_count >= 0),
  read_at timestamptz,
  assigned_staff_id uuid references public.profiles (id) on delete set null,
  status text not null default 'open'
    check (status in ('new', 'open', 'in_progress', 'waiting_for_driver', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.conversations add column if not exists read_at timestamptz;
alter table public.conversations add column if not exists assigned_staff_id uuid references public.profiles (id) on delete set null;
alter table public.conversations add column if not exists status text;
update public.conversations set status = 'open' where status is null;
alter table public.conversations alter column status set default 'open';

-- ---------------------------------------------------------------------------
-- Broadcasts (fan-out SMS; replies always land in the driver's 1:1 thread)
-- ---------------------------------------------------------------------------
create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id),
  body text not null,
  tag_ids uuid[] not null default '{}',
  group_ids uuid[] not null default '{}',
  recipient_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.broadcasts add column if not exists group_ids uuid[] not null default '{}';

-- ---------------------------------------------------------------------------
-- Messages
-- kind: sms_in (driver) | sms_out (staff SMS) | internal_note (staff only)
-- staff_id lives on the action (sender_profile_id) for audit — never a private inbox.
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  driver_id uuid not null references public.drivers (id) on delete cascade,
  kind text not null check (kind in ('sms_in', 'sms_out', 'internal_note')),
  body text not null,
  sender_profile_id uuid references public.profiles (id),
  sender_name text,
  twilio_sid text unique,
  broadcast_id uuid references public.broadcasts (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint messages_inbound_has_no_staff
    check (kind <> 'sms_in' or sender_profile_id is null),
  constraint messages_staff_kinds_have_sender
    check (kind = 'sms_in' or sender_name is not null)
);

-- ---------------------------------------------------------------------------
-- Activity log (who assigned, who changed groups, who changed status)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations (id) on delete cascade,
  driver_id uuid references public.drivers (id) on delete cascade,
  staff_id uuid not null references public.profiles (id),
  staff_name text not null,
  kind text not null check (kind in (
    'assigned',
    'unassigned',
    'groups_changed',
    'status_changed',
    'contact_updated',
    'group_created',
    'group_updated'
  )),
  detail text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at);
create index if not exists messages_driver_created_idx
  on public.messages (driver_id, created_at desc);
create index if not exists conversations_last_message_idx
  on public.conversations (last_message_at desc nulls last);
create index if not exists conversations_assigned_idx
  on public.conversations (assigned_staff_id);
create index if not exists conversations_status_idx
  on public.conversations (status);
create index if not exists drivers_phone_idx
  on public.drivers (phone);
create index if not exists activity_conversation_idx
  on public.activity_events (conversation_id, created_at desc);
create index if not exists driver_groups_group_idx
  on public.driver_groups (group_id);

-- ---------------------------------------------------------------------------
-- New auth user → staff profile
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Dispatcher'),
    coalesce(new.raw_user_meta_data->>'role', 'dispatcher')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Keep conversation preview / GLOBAL unread in sync
-- Opening a thread sets unread_count = 0 and read_at = now() for everyone.
-- ---------------------------------------------------------------------------
create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set
    last_message_at = new.created_at,
    last_message_preview = left(new.body, 160),
    unread_count = case
      when new.kind = 'sms_in' then unread_count + 1
      else unread_count
    end,
    read_at = case
      when new.kind = 'sms_in' then null
      else read_at
    end
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_inserted on public.messages;
create trigger on_message_inserted
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists drivers_set_updated_at on public.drivers;
create trigger drivers_set_updated_at
  before update on public.drivers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: every logged-in staff member sees the SAME inbox
-- Twilio webhooks use the service role and bypass RLS.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.tags enable row level security;
alter table public.contact_groups enable row level security;
alter table public.drivers enable row level security;
alter table public.driver_tags enable row level security;
alter table public.driver_groups enable row level security;
alter table public.conversations enable row level security;
alter table public.broadcasts enable row level security;
alter table public.messages enable row level security;
alter table public.activity_events enable row level security;

drop policy if exists "staff_read_profiles" on public.profiles;
drop policy if exists "staff_update_own_profile" on public.profiles;
drop policy if exists "staff_all_tags" on public.tags;
drop policy if exists "staff_all_contact_groups" on public.contact_groups;
drop policy if exists "staff_all_drivers" on public.drivers;
drop policy if exists "staff_all_driver_tags" on public.driver_tags;
drop policy if exists "staff_all_driver_groups" on public.driver_groups;
drop policy if exists "staff_all_conversations" on public.conversations;
drop policy if exists "staff_all_broadcasts" on public.broadcasts;
drop policy if exists "staff_all_messages" on public.messages;
drop policy if exists "staff_all_activity" on public.activity_events;

create policy "staff_read_profiles" on public.profiles
  for select to authenticated using (true);
create policy "staff_update_own_profile" on public.profiles
  for update to authenticated using (id = auth.uid());

create policy "staff_all_tags" on public.tags
  for all to authenticated using (true) with check (true);
create policy "staff_all_contact_groups" on public.contact_groups
  for all to authenticated using (true) with check (true);
create policy "staff_all_drivers" on public.drivers
  for all to authenticated using (true) with check (true);
create policy "staff_all_driver_tags" on public.driver_tags
  for all to authenticated using (true) with check (true);
create policy "staff_all_driver_groups" on public.driver_groups
  for all to authenticated using (true) with check (true);
create policy "staff_all_conversations" on public.conversations
  for all to authenticated using (true) with check (true);
create policy "staff_all_broadcasts" on public.broadcasts
  for all to authenticated using (true) with check (true);
create policy "staff_all_messages" on public.messages
  for all to authenticated using (true) with check (true);
create policy "staff_all_activity" on public.activity_events
  for all to authenticated using (true) with check (true);

-- Realtime: shared inbox fan-out (presence stays ephemeral)
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.activity_events;
alter publication supabase_realtime add table public.driver_groups;
alter publication supabase_realtime add table public.contact_groups;
