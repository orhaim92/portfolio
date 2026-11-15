import Anthropic from "@anthropic-ai/sdk";
import { runDemo } from "@/lib/agents/demo";
import { MAX_QUESTION_CHARS, sanitize } from "@/lib/agents/guard";
import { checkLimits } from "@/lib/agents/memory";
import { runPipeline } from "@/lib/agents/pipeline";
import type { StreamEvent } from "@/lib/agents/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4000;
const MAX_EARLIER = 3;

function line(e: StreamEvent): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(e) + "\n");
}

function oneShot(events: StreamEvent[], status = 200): Response {
  return new Response(events.map((e) => JSON.stringify(e)).join("\n") + "\n", {
    status,
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request): Promise<Response> {
  // Only this site's own page may call the endpoint from a browser.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return oneShot([{ t: "error", message: "Not allowed." }], 403);
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return oneShot([{ t: "error", message: "Message is too long." }], 413);

  let body: { question?: unknown; earlier?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return oneShot([{ t: "error", message: "Bad request." }], 400);
  }

  const question = sanitize(body.question);
  if (question.length < 2) return oneShot([{ t: "error", message: "Please type a question." }], 400);

  // Only the visitor's own earlier questions are accepted as context. Earlier
  // answers are not: the browser could send anything and call it an answer.
  const earlier = (Array.isArray(body.earlier) ? body.earlier : [])
    .slice(-MAX_EARLIER)
    .map((q) => sanitize(q, MAX_QUESTION_CHARS))
    .filter(Boolean);

  const visitor = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const limit = await checkLimits(visitor);
  if (limit !== "ok") {
    return oneShot(
      [
        {
          t: "error",
          message:
            limit === "visitor"
              ? "You have asked a lot of questions. Please try again in a few minutes."
              : "The chat has reached its daily limit. Please come back tomorrow.",
        },
      ],
      429,
    );
  }

  const live = Boolean(process.env.ANTHROPIC_API_KEY);
  const started = Date.now();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: StreamEvent) => {
        try {
          controller.enqueue(line(e));
        } catch {
          /* the visitor closed the page */
        }
      };
      try {
        if (live) await runPipeline(question, earlier, emit);
        else await runDemo(question, emit);
        emit({ t: "done", mode: live ? "live" : "demo", ms: Date.now() - started });
      } catch (err) {
        // Details go to the server log. The visitor gets a plain message, so an
        // error can never carry prompt text or keys to the browser.
        console.error("chat pipeline failed", err instanceof Anthropic.APIError ? `${err.status} ${err.name}` : err);
        const busy = err instanceof Anthropic.RateLimitError || (err instanceof Anthropic.APIError && (err.status ?? 0) >= 500);
        emit({ t: "error", message: busy ? "The model is busy right now. Please try again in a moment." : "Something went wrong. Please try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
