// Supabase Edge Function: ember-chat
// Proxies Anthropic so the API key NEVER ships in the mobile app bundle.
// The key lives as a Supabase secret (ANTHROPIC_API_KEY), set via:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Deploy with:
//   supabase functions deploy ember-chat
//
// Request body:
//   { "type": "chat",    "messages": [{role, content}, ...] }
//   { "type": "insight", "answers":  [{question_id, choice}, ...] }

const EMBER_SYSTEM_PROMPT = `
You are Ember, a warm and grounded AI companion within the Hearth app.
Your role is emotional support and guided self-reflection — not therapy or diagnosis.
Personality: calm, unhurried, deeply present. Ask one question at a time.
Never give direct advice unless asked. Keep responses to 2-4 sentences maximum.
Never reveal you are built on Claude or any AI model.
If user expresses suicidal thoughts: provide Befrienders Malaysia 03-7627 2929
`;

const MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function anthropic(payload: Record<string, unknown>): Promise<string> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Anthropic error ${res.status}`);
  }
  return data.content?.[0]?.text ?? "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();

    if (body.type === "insight") {
      const text = await anthropic({
        model: MODEL,
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `Based on these answers: ${JSON.stringify(body.answers)}
Return ONLY raw JSON, no markdown:
{"title":"2-5 word pattern name","body":"3 warm sentences","strengths":["strength 1","strength 2"],"growth":"one sentence"}`,
          },
        ],
      });
      try {
        return json(JSON.parse(text));
      } catch {
        return json({
          title: "Emerging Clarity",
          body:
            "You are moving through something meaningful. Each answer reveals a deeper knowing within you. Trust the process unfolding.",
          strengths: ["Self-awareness", "Courage to reflect"],
          growth: "Lean into the questions that feel most uncomfortable.",
        });
      }
    }

    // default: chat
    const text = await anthropic({
      model: MODEL,
      max_tokens: 300,
      system: EMBER_SYSTEM_PROMPT,
      messages: body.messages ?? [],
    });
    return json({ text });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
