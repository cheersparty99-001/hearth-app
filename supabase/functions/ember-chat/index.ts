// Supabase Edge Function: ember-chat
// Proxies Anthropic so the API key NEVER ships in the mobile app bundle.
// Set the key + deploy:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy ember-chat
//
// Request body:
//   { "type": "chat",    "messages": [...] }   -> streams plain-text deltas
//   { "type": "insight", "answers":  [...] }   -> returns JSON

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

const MODEL = "claude-sonnet-4-6";
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

function anthropicRequest(payload: Record<string, unknown>): Promise<Response> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
  return fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();

    // ---- Insight: one-shot JSON ----
    if (body.type === "insight") {
      const res = await anthropicRequest({
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
      const data = await res.json();
      const text = data?.content?.[0]?.text ?? "";
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

    // ---- Chat: stream plain-text deltas ----
    const upstream = await anthropicRequest({
      model: MODEL,
      max_tokens: 300,
      system: EMBER_SYSTEM_PROMPT,
      messages: body.messages ?? [],
      stream: true,
    });

    if (!upstream.ok || !upstream.body) {
      const err = await upstream.text();
      return json({ error: `Anthropic error ${upstream.status}: ${err}` }, 502);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const t = line.trim();
              if (!t.startsWith("data:")) continue;
              const payload = t.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const evt = JSON.parse(payload);
                if (evt.type === "content_block_delta" && evt.delta?.text) {
                  controller.enqueue(encoder.encode(evt.delta.text));
                }
              } catch {
                // ignore non-JSON keepalive lines
              }
            }
          }
        } catch (e) {
          controller.error(e);
          return;
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
