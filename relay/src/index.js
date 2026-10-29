// Red Pen English relay: keeps the Anthropic API key on Cloudflare, never in the app.
// The app sends {tier, messages, max_tokens}; the relay streams back server-sent events:
//   data: {"t":"<text delta>"}     while Claude writes
//   data: {"done":true,"stop":"end_turn"}   at the end
//   data: {"error":"<code>"}       on failure (codes match errMsg() in index.html)
import Anthropic from "@anthropic-ai/sdk";

// "quick" = short chat turns and suggestions, "default" = generation and grading.
const TIERS = {
  quick: { model: "claude-haiku-5-5", effort: "low", fallback: false },
  default: { model: "claude-opus-5-5", effort: "medium", fallback: true },
};
const ALLOWED_ORIGINS = ["https://mrbalais.github.io", "http://localhost:8080"];
const MAX_TOKENS = 16000;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Headers": "content-type, x-access-code",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return reply({ error: "bad_request" }, 405, cors);
    if (!ALLOWED_ORIGINS.includes(origin)) return reply({ error: "not_granted" }, 403, cors);
    if (!env.ACCESS_CODE || request.headers.get("x-access-code") !== env.ACCESS_CODE) {
      return reply({ error: "bad_code" }, 401, cors);
    }

    let body;
    try { body = await request.json(); } catch { return reply({ error: "bad_request" }, 400, cors); }
    if (!Array.isArray(body.messages) || !body.messages.length) return reply({ error: "bad_request" }, 400, cors);

    const tier = TIERS[body.tier] || TIERS.default;
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const params = {
      model: tier.model,
      max_tokens: Math.min(Number(body.max_tokens) || MAX_TOKENS, MAX_TOKENS),
      messages: body.messages,
      output_config: { effort: tier.effort },
    };
    // Opus: if a safety classifier declines, let Anthropic re-run it on its recommended fallback model
    if (tier.fallback) { params.betas = ["server-side-fallback-2026-07-01"]; params.fallbacks = "default"; }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const enc = new TextEncoder();
    const send = obj => writer.write(enc.encode("data: " + JSON.stringify(obj) + "\n\n"));

    (async () => {
      try {
        const stream = client.beta.messages.stream(params);
        stream.on("text", t => { send({ t }); });
        const message = await stream.finalMessage();
        if (message.stop_reason === "refusal") await send({ error: "refused" });
        else await send({ done: true, stop: message.stop_reason });
      } catch (err) {
        await send({ error: errorCode(err) });
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, { headers: { ...cors, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  },
};

function errorCode(err) {
  if (err instanceof Anthropic.RateLimitError) return "rate_limited";
  if (err instanceof Anthropic.AuthenticationError) return "relay_key";
  if (err instanceof Anthropic.BadRequestError) return "bad_request";
  if (err instanceof Anthropic.APIError && err.status === 529) return "rate_limited";
  return "network";
}

function reply(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
