import { describeVisitor, isBot, notify } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One notification per visitor per half hour, so a reload does not buzz twice.
const seen = new Map<string, number>();
const WINDOW_MS = 30 * 60 * 1000;

function sourceOf(ref: unknown): string {
  if (typeof ref !== "string" || !ref) return "direct link";
  try {
    return new URL(ref).hostname.replace(/^www\./, "").slice(0, 60);
  } catch {
    return "direct link";
  }
}

export async function POST(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return new Response(null, { status: 403 });
  if (isBot(req.headers.get("user-agent"))) return new Response(null, { status: 204 });

  let ref: unknown;
  try {
    ref = (JSON.parse((await req.text()).slice(0, 600)) as { ref?: unknown }).ref;
  } catch {
    ref = undefined;
  }

  const visitor = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const now = Date.now();
  const last = seen.get(visitor);
  if (last && now - last < WINDOW_MS) return new Response(null, { status: 204 });
  seen.set(visitor, now);
  if (seen.size > 2000) for (const [k, t] of seen) if (now - t > WINDOW_MS) seen.delete(k);

  await notify("Portfolio visit", `${describeVisitor(req.headers)} · from ${sourceOf(ref)}`, ["eyes"]);
  return new Response(null, { status: 204 });
}
