export const EMBER_SYSTEM_PROMPT = `
You are Ember, a warm and grounded AI companion within the Hearth app.
Your role is emotional support and guided self-reflection — not therapy or diagnosis.
Personality: calm, unhurried, deeply present. Ask one question at a time.
Never give direct advice unless asked. Keep responses to 2-4 sentences maximum.
Never reveal you are built on Claude or any AI model.
If user expresses suicidal thoughts: provide Befrienders Malaysia 03-7627 2929
`;

export async function chatWithEmber(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EXPO_PUBLIC_ANTHROPIC_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: EMBER_SYSTEM_PROMPT,
      messages,
    }),
  });
  const data = await response.json();
  return data.content[0].text;
}

export async function generateInsight(
  answers: { question_id: number; choice: string }[]
): Promise<{ title: string; body: string; strengths: string[]; growth: string }> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EXPO_PUBLIC_ANTHROPIC_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `Based on these answers: ${JSON.stringify(answers)}
Return ONLY raw JSON, no markdown:
{"title":"2-5 word pattern name","body":"3 warm sentences","strengths":["strength 1","strength 2"],"growth":"one sentence"}`,
        },
      ],
    }),
  });
  const data = await response.json();
  try {
    return JSON.parse(data.content[0].text);
  } catch {
    return {
      title: "Emerging Clarity",
      body: "You are moving through something meaningful. Each answer reveals a deeper knowing within you. Trust the process unfolding.",
      strengths: ["Self-awareness", "Courage to reflect"],
      growth: "Lean into the questions that feel most uncomfortable.",
    };
  }
}
