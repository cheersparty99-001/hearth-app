# Hearth App v2 — React Native MVP

## Tech Stack
- React Native + Expo (TypeScript)
- Expo Router (file-based routing with tabs)
- Supabase (Auth + PostgreSQL)
- OpenRouter API (anthropic/claude-sonnet-4 for Ember + Insight generation)

## Design System

### Colors
```typescript
export const Colors = {
  bg: {
    primary: '#0D1A0D',
    secondary: '#142014',
    card: '#1E3A1E',
    elevated: '#243824',
  },
  accent: {
    primary: '#C8813A',
    light: '#E8A855',
    glow: 'rgba(200, 129, 58, 0.15)',
  },
  text: {
    primary: '#E8F0E8',
    secondary: '#D4E8D4',
    muted: '#6A946A',
  },
  border: '#2A4A2A',
}
```

### Styling Rules
- All cards: borderRadius 16, borderWidth 1, borderColor #2A4A4A
- All buttons: borderRadius 50, padding 16
- No harsh white, no pure black anywhere
- Horizontal padding: 24px consistent
- Subtle shadows on cards
- Dark overlay rgba(0,0,0,0.45) on background images

### Fonts
- Load "Lora" (serif) for headings from expo-google-fonts
- Load "Inter" (sans-serif) for body from expo-google-fonts

## Navigation Structure
```
Splash Screen (/app/index.tsx)
  → Onboarding (/app/onboarding.tsx) — 3 pages
    → (tabs) layout
      - Home (/app/(tabs)/home.tsx)
      - Crossroads (/app/(tabs)/crossroads.tsx) — 15-question Wellness Profiler
      - Profiler Result (/app/(tabs)/profiler-result.tsx)
      - Insight (/app/(tabs)/insight.tsx)
      - Chat (/app/(tabs)/chat.tsx)
      - Profile (/app/(tabs)/profile.tsx)
```

## Supabase Setup

### Database URL & Anon Key
- URL: https://kckynijiimoztaotkybk.supabase.co
- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja3luaWppaW1venRhb3RreWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjcxNDgsImV4cCI6MjA5NTIwMzE0OH0.4kIZ8lxRS-mJX7SffENroPEhM7pOuRjqeOsjB_mGr1A

### Database Tables (already exist, run this SQL if not):
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS profiler_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  question_id INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('stress', 'anxiety', 'depression', 'sleep')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  pattern_title TEXT NOT NULL,
  pattern_body TEXT NOT NULL,
  strengths JSONB,
  growth TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiler_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "answers_own" ON profiler_answers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "insights_own" ON insights FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_own" ON chat_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### Auth
- Use SecureStore for session persistence (not AsyncStorage)
- Sign up: supabase.auth.signUp
- Sign in: supabase.auth.signInWithPassword

## OpenRouter — Ember Chat API

### API Config
- Endpoint: https://openrouter.ai/api/v1/chat/completions
- Model: anthropic/claude-sonnet-4
- Key: sk-or-v1-your-openrouter-key

### Ember System Prompt
```
You are Ember, a warm and grounded AI companion within the Hearth app.
Your role is emotional support and guided self-reflection — not therapy.

Personality:
- Calm, unhurried, deeply present
- Ask one question at a time
- Never give direct advice unless explicitly asked
- Reflect back what you hear before responding
- Use gentle nature-inspired language when appropriate

Boundaries:
- If user expresses suicidal thoughts or self-harm, respond with care
  and provide: Befrienders Malaysia 03-7627 2929
- Do not diagnose or replace professional mental health care
- Keep responses to 2-4 sentences maximum
- Never reveal you are built on Claude or any AI model
```

### Profiler Insight Generation
The profiler is self-contained (no API call). Scoring is direct category counting built into the app.
See `constants/profiler.ts` for `calculateScores()` and `determineProfiles()`.

## Wellness Profiler Questions (15 questions, 4 categories)

15 questions from Camillia Siaw's Mental Wellness Profiler v2.0.
Each question has 4 options mapped to categories: stress / anxiety / depression / sleep.
Scoring is direct counting — the category with the most selections becomes the primary profile.
Full data in `constants/profiler.ts`.

## Build Instructions

### Step 1: Create Project
```bash
cd /root && npx create-expo-app hearth-app --template blank-typescript
```

### Step 2: Install Dependencies
```bash
cd /root/hearth-app
npx expo install expo-router @supabase/supabase-js expo-secure-store expo-av expo-linear-gradient react-native-reanimated @react-native-async-storage/async-storage
npm install @expo/vector-icons
```

### Step 3: Configure Expo Router
- Update app.json: scheme, userInterfaceStyle dark, backgroundColor #0D1A0D
- Update package.json main entry to "expo-router/entry"
- Create app/ directory structure

### Step 4: Create All Files

1. constants/colors.ts — Color constants as above
2. constants/questions.ts — 5 questions with 4 choices each
3. lib/supabase.ts — Supabase client with SecureStore
4. lib/openrouter.ts — OpenRouter API for Ember chat + insight generation
5. context/AuthContext.tsx — Auth provider
6. app/_layout.tsx — Root layout with AuthGate
7. app/index.tsx — Splash with splash-bg.png overlay (use ImageBackground with a gradient fallback since we don't have the actual images)
8. app/onboarding.tsx — 3-page onboarding with auth form on page 3
9. app/(tabs)/_layout.tsx — Tab navigator (5 tabs)
10. app/(tabs)/home.tsx — Home dashboard
11. app/(tabs)/crossroads.tsx — Life Crossroads with 4 choices
12. app/(tabs)/insight.tsx — Insight display
13. app/(tabs)/chat.tsx — Ember chat
14. app/(tabs)/profile.tsx — Profile/settings

### Important Notes
- For background images (splash-bg.png etc.), since they don't exist as actual files, use ImageBackground with a dark gradient fallback or just use the solid dark background color
- Use emoji icons (🔥, 🌲, etc.) as icon fallbacks
- Use @expo/vector-icons (Feather or Ionicons) for tab bar icons
- expo-av is for meditation player placeholder
- Use `import { LinearGradient } from 'expo-linear-gradient'` for gradient overlays
- react-native-reanimated for animations

### Success Criteria
- Sign up / log in works
- Home shows daily reflection
- Complete 5 crossroads questions
- AI-generated insight displays
- Chat with Ember works
- Meditation screen renders