// Memory for the agent system: rate limits, learned routes and knowledge gaps.
//
// With Upstash Redis connected (Vercel > Storage > Upstash), memory is shared
// and survives restarts. Without it, the same code uses in-process maps, which
// is enough for local work but resets on every cold start.
//
// Security rule: raw visitor text that is stored here is NEVER put back into a
// prompt. Only counters keyed by fixed ids are read back. That closes the
// "stored prompt injection" path, where an attacker plants text today that a
// later request would read as instructions.

const URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
export const hasDurableMemory = Boolean(URL && TOKEN);

type Cmd = (string | number)[];

async function redis(cmds: Cmd[]): Promise<unknown[] | null> {
  if (!hasDurableMemory) return null;
  try {
    const res = await fetch(`${URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmds),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: unknown }[];
    return json.map((r) => r.result);
  } catch {
    return null; // Memory is best-effort: never fail a chat because of it.
  }
}

// ---- In-process fallback ---------------------------------------------------
const counters = new Map<string, { n: number; exp: number }>();
const routes = new Map<string, Map<string, number>>();
const gaps: string[] = [];

function localIncr(key: string, ttlSec: number): number {
  const now = Date.now();
  const cur = counters.get(key);
  if (!cur || cur.exp < now) {
    counters.set(key, { n: 1, exp: now + ttlSec * 1000 });
    if (counters.size > 5000) for (const [k, v] of counters) if (v.exp < now) counters.delete(k);
    return 1;
  }
  cur.n += 1;
  return cur.n;
}

async function incr(key: string, ttlSec: number): Promise<number> {
  const res = await redis([
    ["INCR", key],
    ["EXPIRE", key, ttlSec, "NX"],
  ]);
  if (res && typeof res[0] === "number") return res[0];
  return localIncr(key, ttlSec);
}

// ---- Rate limits -----------------------------------------------------------
const PER_VISITOR = Number(process.env.CHAT_VISITOR_LIMIT ?? 8); // per 10 minutes
const PER_DAY = Number(process.env.CHAT_DAILY_LIMIT ?? 200); // whole site

export async function checkLimits(visitor: string): Promise<"ok" | "visitor" | "daily"> {
  const day = new Date().toISOString().slice(0, 10);
  const [mine, all] = await Promise.all([incr(`rl:${visitor}`, 600), incr(`day:${day}`, 90000)]);
  if (all > PER_DAY) return "daily";
  if (mine > PER_VISITOR) return "visitor";
  return "ok";
}

// ---- Self-learning: which sections answered which topic --------------------
export const TOPICS = ["ai", "leadership", "cloud", "fullstack", "regulated", "dentai", "career", "contact", "system", "other"] as const;
export type Topic = (typeof TOPICS)[number];

/** Called after an answer that the agents could ground in the knowledge base. */
export async function learnRoute(topic: Topic, sectionIds: string[]): Promise<void> {
  const ok = await redis(sectionIds.map((id) => ["HINCRBY", `route:${topic}`, id, 1]));
  if (ok) return;
  const m = routes.get(topic) ?? new Map<string, number>();
  for (const id of sectionIds) m.set(id, (m.get(id) ?? 0) + 1);
  routes.set(topic, m);
}

/** Section ids that worked before for this topic, best first. Ids only. */
export async function recallRoute(topic: Topic, known: string[]): Promise<{ id: string; wins: number }[]> {
  let entries: [string, number][] = [];
  const res = await redis([["HGETALL", `route:${topic}`]]);
  if (res && Array.isArray(res[0])) {
    const flat = res[0] as string[];
    for (let i = 0; i + 1 < flat.length; i += 2) entries.push([flat[i], Number(flat[i + 1])]);
  } else {
    entries = [...(routes.get(topic) ?? new Map<string, number>())];
  }
  return entries
    .filter(([id, n]) => known.includes(id) && Number.isFinite(n)) // ids are checked against the live map
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, wins]) => ({ id, wins }));
}

/** A question nobody could answer. Stored for the site owner, never re-read by a model. */
export async function logGap(question: string, topic: Topic): Promise<void> {
  const row = JSON.stringify({ at: new Date().toISOString(), topic, question });
  const ok = await redis([
    ["LPUSH", "gaps", row],
    ["LTRIM", "gaps", 0, 199],
  ]);
  if (!ok) {
    gaps.unshift(row);
    gaps.length = Math.min(gaps.length, 50);
  }
}
