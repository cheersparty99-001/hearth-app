import { config } from "./config";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export const EMBER_SYSTEM_PROMPT = `You are Ember, a warm and grounded AI companion within the Hearth app. Your role is emotional support and guided self-reflection — not therapy or diagnosis.

Personality: calm, unhurried, deeply present. Ask one question at a time. Never give direct advice unless asked. Keep responses to 2-4 sentences maximum. Never reveal you are built on Claude or any AI model.

If user expresses suicidal thoughts or self-harm, respond with care and provide: Befrienders Malaysia 03-7627 2929`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function callAnthropic(
  messages: ChatMessage[],
  systemPrompt: string,
  maxTokens: number = 400
): Promise<string> {
  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error("Empty response from Anthropic");
  return content;
}

export async function chatWithEmber(
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const messages = history.map((m) => ({ role: m.role, content: m.content }));
  return callAnthropic(messages, EMBER_SYSTEM_PROMPT, 300);
}

export async function generateInsight(
  answers: { question_id: number; choice: string }[]
): Promise<{
  title: string;
  body: string;
  strengths: string[];
  growth: string;
}> {
  const prompt = `Based on these Life Crossroads answers: ${JSON.stringify(
    answers
  )}

Return ONLY raw JSON, no markdown, no backticks:
{"title":"2-5 word poetic pattern name","body":"3 warm non-judgmental sentences revealing their pattern","strengths":["strength 1","strength 2"],"growth":"one sentence growth opportunity"}`;

  const content = await callAnthropic(
    [{ role: "user", content: prompt }],
    "You are a thoughtful pattern analyzer who generates insightful reflections about peoples life choices.",
    500
  );

  try {
    return JSON.parse(content);
  } catch {
    return {
      title: "The Seeker",
      body: "You navigate the space between your desires and your duties with grace. Each choice reveals a quiet wisdom — the willingness to look inward before deciding. Your journey is unfolding exactly as it should.",
      strengths: ["Self-awareness", "Thoughtfulness"],
      growth: "Trust your instincts more. The answers you seek are already within you.",
    };
  }
}