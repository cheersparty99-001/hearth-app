// Client no longer holds the Anthropic key. All AI calls go through the
// Supabase Edge Function `ember-chat`, which keeps the key server-side.
import { supabase } from "./supabase";
import { config } from "./config";

const FN_URL = `${config.supabaseUrl}/functions/v1/ember-chat`;

async function callFn<T>(body: unknown): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? config.supabaseAnonKey;

  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export async function chatWithEmber(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const data = await callFn<{ text: string }>({ type: "chat", messages });
  return data.text;
}

export async function generateInsight(
  answers: { question_id: number; choice: string }[]
): Promise<{ title: string; body: string; strengths: string[]; growth: string }> {
  return callFn({ type: "insight", answers });
}
