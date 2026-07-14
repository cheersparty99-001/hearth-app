-- Hearth — full database schema (single source of truth).
-- Safe to run repeatedly (IF NOT EXISTS / idempotent). Run this in the
-- Supabase SQL Editor. It creates every table the app reads/writes,
-- enables Row Level Security so each user only sees their OWN data, and
-- auto-creates a profiles row on sign-up.

-- =========================================================
-- Tables
-- =========================================================

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists crossroads_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id integer not null,
  choice text not null,
  created_at timestamptz not null default now()
);
create index if not exists crossroads_answers_user_idx
  on crossroads_answers (user_id);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_user_idx
  on chat_messages (user_id, created_at);

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pattern_title text,
  pattern_body text,
  strengths jsonb,
  growth text,
  stress_score integer default 0,
  anxiety_score integer default 0,
  depression_score integer default 0,
  sleep_score integer default 0,
  created_at timestamptz not null default now()
);
create index if not exists insights_user_idx
  on insights (user_id, created_at desc);

-- =========================================================
-- Row Level Security — each user only touches their own rows
-- =========================================================

alter table profiles enable row level security;
alter table crossroads_answers enable row level security;
alter table chat_messages enable row level security;
alter table insights enable row level security;

-- profiles (keyed by id = auth.uid())
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_upsert_own" on profiles;
create policy "profiles_upsert_own" on profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Helper macro pattern applied per table (select/insert/update/delete own)
do $$
declare t text;
begin
  foreach t in array array['crossroads_answers', 'chat_messages', 'insights']
  loop
    execute format('drop policy if exists "%s_select_own" on %I;', t, t);
    execute format('create policy "%s_select_own" on %I for select using (auth.uid() = user_id);', t, t);
    execute format('drop policy if exists "%s_insert_own" on %I;', t, t);
    execute format('create policy "%s_insert_own" on %I for insert with check (auth.uid() = user_id);', t, t);
    execute format('drop policy if exists "%s_update_own" on %I;', t, t);
    execute format('create policy "%s_update_own" on %I for update using (auth.uid() = user_id);', t, t);
    execute format('drop policy if exists "%s_delete_own" on %I;', t, t);
    execute format('create policy "%s_delete_own" on %I for delete using (auth.uid() = user_id);', t, t);
  end loop;
end $$;

-- =========================================================
-- Auto-create a profiles row when a user signs up
-- =========================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
