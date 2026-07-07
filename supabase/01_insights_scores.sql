-- Wellness Profiler: add dimension score columns + growth to the insights table.
-- Run this in the Supabase SQL Editor (or via the Supabase CLI) before using the
-- Wellness Profiler flow, which writes stress/anxiety/depression/sleep scores.

alter table insights add column if not exists stress_score integer default 0;
alter table insights add column if not exists anxiety_score integer default 0;
alter table insights add column if not exists depression_score integer default 0;
alter table insights add column if not exists sleep_score integer default 0;
alter table insights add column if not exists growth text;
