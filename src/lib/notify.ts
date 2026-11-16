// Push notifications to the site owner's phone through ntfy.sh.
//
// ntfy needs no account and no API key: the phone app subscribes to a topic
// name, and anything posted to that name arrives as a notification. The topic
// name is the only secret, so it lives in the NTFY_TOPIC environment variable
// and never in the repository. Without it, notifications are simply off.

const TOPIC = process.env.NTFY_TOPIC;
const SERVER = process.env.NTFY_SERVER ?? "https://ntfy.sh";

export const notificationsOn = Boolean(TOPIC);

export async function notify(title: string, message: string, tags: string[] = []): Promise<void> {
  if (!TOPIC) return;
  try {
    await fetch(SERVER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: TOPIC, title, message, tags }),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // A missed notification must never break the page or the chat.
  }
}

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http/i;

export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT.test(userAgent);
}

/** Where the visitor is, from the headers Vercel adds. No IP address is kept or sent. */
export function describeVisitor(headers: Headers): string {
  const city = headers.get("x-vercel-ip-city");
  const country = headers.get("x-vercel-ip-country");
  const place = [city ? decodeURIComponent(city) : null, country].filter(Boolean).join(", ") || "unknown place";
  const ua = headers.get("user-agent") ?? "";
  const device = /mobile|android|iphone/i.test(ua) ? "phone" : "computer";
  return `${place} · ${device}`;
}
