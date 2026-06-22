-- Hearth Wellness Profiler - Answers Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS profiler_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  question_id INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('stress', 'anxiety', 'depression', 'sleep')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiler_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "answers_own" ON profiler_answers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for quick lookups by user
CREATE INDEX IF NOT EXISTS idx_profiler_answers_user_id ON profiler_answers (user_id);