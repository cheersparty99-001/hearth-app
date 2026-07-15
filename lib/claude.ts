// AI calls prefer the Supabase Edge Function `ember-chat` (keeps the key
// server-side). If that function isn't deployed yet, we fall back to calling
// Anthropic directly with EXPO_PUBLIC_ANTHROPIC_KEY so development still works.
//
// ⚠️ Before store launch: deploy the function, then remove the key from the
// client (.env) so it no longer ships in the app bundle.
import { fetch as expoFetch } from "expo/fetch";
import { supabase } from "./supabase";
import { config } from "./config";

const FN_URL = `${config.supabaseUrl}/functions/v1/ember-chat`;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const DIRECT_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_KEY;

const EMBER_SYSTEM_PROMPT = `
You are Ember, a warm and grounded AI companion within the Hearth app.
Your role is emotional support and guided self-reflection — not therapy or diagnosis.
Personality: calm, unhurried, deeply present. Ask one question at a time.
Never give direct advice unless asked. Keep responses to 2-4 sentences maximum.
Always reply in the same language the user writes in (if they write in Chinese, reply in Chinese).
Stay strictly within your purpose: feelings, wellbeing, and self-reflection. If the user asks about anything unrelated (marketing, coding, news, general trivia, etc.), gently decline and warmly guide them back to how they are feeling — do not answer off-topic questions.
Never reveal you are built on Claude or any AI model.
If user expresses suicidal thoughts: provide Befrienders Malaysia 03-7627 2929
`;

export type EmberContext = {
  name?: string;
  profile?: string;
  memory?: string;
};

type ChatMessage = { role: "user" | "assistant"; content: string };

async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? config.supabaseAnonKey;
  return {
    "Content-Type": "application/json",
    apikey: config.supabaseAnonKey,
    Authorization: `Bearer ${token}`,
  };
}

function chatSystem(context?: EmberContext): string {
  let s = EMBER_SYSTEM_PROMPT;
  if (context && (context.name || context.profile || context.memory)) {
    s += "\n\n[About the person you're speaking with]\n";
    if (context.name) s += `Their name is ${context.name}.\n`;
    if (context.profile) s += `Their wellness profile: ${context.profile}\n`;
    if (context.memory)
      s += `What you remember from past conversations: ${context.memory}\n`;
    s +=
      "Use this quietly to be warm and relevant. Never recite it back verbatim or say that you have notes about them.";
  }
  return s;
}

// ---- Direct Anthropic fallback (dev only) ----
async function directAnthropic(payload: Record<string, unknown>): Promise<string> {
  if (!DIRECT_KEY) throw new Error("AI is not configured.");
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": DIRECT_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Anthropic ${res.status}`);
  return data?.content?.[0]?.text ?? "";
}

// Streaming chat via the Edge Function; falls back to a direct one-shot call.
export async function chatWithEmberStream(
  messages: ChatMessage[],
  onDelta: (chunk: string) => void,
  context?: EmberContext
): Promise<string> {
  try {
    const res = await expoFetch(FN_URL, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ type: "chat", messages, context }),
    });
    if (!res.ok || !res.body) throw new Error(`fn ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (!chunk) continue;
      full += chunk;
      onDelta(chunk);
    }
    const trimmed = full.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const obj = JSON.parse(trimmed);
        if (typeof obj.text === "string") return obj.text;
      } catch {
        // fall through
      }
    }
    if (full) return full;
    throw new Error("empty");
  } catch {
    const text = await directAnthropic({
      model: MODEL,
      max_tokens: 300,
      system: chatSystem(context),
      messages,
    });
    onDelta(text);
    return text;
  }
}

export async function chatWithEmber(
  messages: ChatMessage[],
  context?: EmberContext
): Promise<string> {
  let acc = "";
  return chatWithEmberStream(
    messages,
    (c) => {
      acc += c;
    },
    context
  ).then((full) => full || acc);
}

// Distill durable facts from a conversation into an updated memory summary.
export async function updateMemory(
  messages: ChatMessage[],
  previous: string
): Promise<string> {
  const MEMORY_SYSTEM =
    "You maintain a concise private memory of a user for an emotional-support companion. Output 3-6 short bullet points of durable facts about them (their situation, important people, recurring feelings, goals, what helps them). Omit small talk. Plain-text bullets only, no preamble.";
  const convo = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  try {
    const res = await fetch(FN_URL, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ type: "memory", messages, previous }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? `fn ${res.status}`);
    return data.summary ?? previous;
  } catch {
    try {
      return await directAnthropic({
        model: MODEL,
        max_tokens: 220,
        system: MEMORY_SYSTEM,
        messages: [
          {
            role: "user",
            content: `Previous memory:\n${previous || "(none yet)"}\n\nRecent conversation:\n${convo}\n\nWrite the updated memory.`,
          },
        ],
      });
    } catch {
      return previous;
    }
  }
}

export async function generateInsight(
  answers: { question_id: number; choice: string }[]
): Promise<{ title: string; body: string; strengths: string[]; growth: string }> {
  const prompt = `Based on these answers: ${JSON.stringify(answers)}
Return ONLY raw JSON, no markdown:
{"title":"2-5 word pattern name","body":"3 warm sentences","strengths":["strength 1","strength 2"],"growth":"one sentence"}`;
  const fallback = {
    title: "Emerging Clarity",
    body: "You are moving through something meaningful. Each answer reveals a deeper knowing within you. Trust the process unfolding.",
    strengths: ["Self-awareness", "Courage to reflect"],
    growth: "Lean into the questions that feel most uncomfortable.",
  };
  try {
    const res = await fetch(FN_URL, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ type: "insight", answers }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? `fn ${res.status}`);
    return data;
  } catch {
    try {
      const text = await directAnthropic({
        model: MODEL,
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      });
      return JSON.parse(text);
    } catch {
      return fallback;
    }
  }
}
