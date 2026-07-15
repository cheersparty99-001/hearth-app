-- Ember long-term memory: one distilled summary per user, updated as they chat.
-- Run in the Supabase SQL Editor. Idempotent + RLS (own rows only).

create table if not exists user_memory (
  user_id uuid primary key references auth.users (id) on delete cascade,
  summary text,
  updated_at timestamptz not null default now()
);

alter table user_memory enable row level security;

drop policy if exists "user_memory_select_own" on user_memory;
create policy "user_memory_select_own" on user_memory
  for select using (auth.uid() = user_id);
drop policy if exists "user_memory_insert_own" on user_memory;
create policy "user_memory_insert_own" on user_memory
  for insert with check (auth.uid() = user_id);
drop policy if exists "user_memory_update_own" on user_memory;
create policy "user_memory_update_own" on user_memory
  for update using (auth.uid() = user_id);
