// Client no longer holds the Anthropic key. All AI calls go through the
// Supabase Edge Function `ember-chat`, which keeps the key server-side.
import { fetch as expoFetch } from "expo/fetch";
import { supabase } from "./supabase";
import { config } from "./config";

const FN_URL = `${config.supabaseUrl}/functions/v1/ember-chat`;

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

type ChatMessage = { role: "user" | "assistant"; content: string };

// Streaming chat: calls onDelta with each text chunk as it arrives, and
// resolves with the full text. Falls back gracefully if the function still
// returns a one-shot JSON body (e.g. before redeploy).
export async function chatWithEmberStream(
  messages: ChatMessage[],
  onDelta: (chunk: string) => void
): Promise<string> {
  const res = await expoFetch(FN_URL, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ type: "chat", messages }),
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data?.error ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  if (!res.body) {
    // No stream available — read whole body.
    const text = await res.text();
    return extractText(text, onDelta);
  }

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

  // Safety net: if the whole body turned out to be JSON {"text":"..."}
  // (old non-streaming function), surface the parsed text instead.
  const trimmed = full.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const obj = JSON.parse(trimmed);
      if (typeof obj.text === "string") return obj.text;
    } catch {
      // not JSON — fall through
    }
  }
  return full;
}

function extractText(raw: string, onDelta: (c: string) => void): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const obj = JSON.parse(trimmed);
      if (typeof obj.text === "string") {
        onDelta(obj.text);
        return obj.text;
      }
    } catch {
      // fall through
    }
  }
  onDelta(raw);
  return raw;
}

// Non-streaming fallback (used if streaming throws).
export async function chatWithEmber(messages: ChatMessage[]): Promise<string> {
  let acc = "";
  return chatWithEmberStream(messages, (c) => {
    acc += c;
  }).then((full) => full || acc);
}

export async function generateInsight(
  answers: { question_id: number; choice: string }[]
): Promise<{ title: string; body: string; strengths: string[]; growth: string }> {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ type: "insight", answers }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data;
}
