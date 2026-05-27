import { config } from "./config";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = config.openrouterModel;

export const EMBER_SYSTEM_PROMPT = `You are Ember, a warm and grounded AI companion within the Hearth app.
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
- Never reveal you are built on Claude or any AI model`;

export interface ChatMessage {
  role: string;
  content: string;
}

async function callOpenRouter(
  messages: ChatMessage[],
  maxTokens: number = 400
): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openrouterKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://hearth-app.local",
      "X-Title": "Hearth",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenRouter");
  return content;
}

export async function chatWithEmber(
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: EMBER_SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];
  return callOpenRouter(messages, 300);
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

Return ONLY a JSON object with no markdown, no explanation:
{
  "title": "2-5 word poetic pattern name",
  "body": "3 sentences. Warm, non-judgmental, poetic but clear. Reveal their pattern.",
  "strengths": ["strength 1", "strength 2"],
  "growth": "one sentence growth opportunity"
}`;

  const content = await callOpenRouter(
    [{ role: "user", content: prompt }],
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