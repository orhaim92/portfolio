import { looksLikeInjection } from "./guard";
import { lookup, sections } from "./knowledge";
import { REPLY_NO_ANSWER, REPLY_OUT_OF_SCOPE } from "./pipeline";
import type { AgentSpec, StreamEvent } from "./types";

// Runs when no model is connected (no ANTHROPIC_API_KEY). It walks the same
// stages so the page can be developed and shown, but the "agents" here are
// plain keyword lookups and the answer is quoted text. The UI labels it.

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function nameFor(id: string): { name: string; role: string } {
  if (id.startsWith("job-")) return { name: "Career analyst", role: "Reads the role history" };
  if (id.startsWith("skill-")) return { name: "Skills analyst", role: "Reads the skill map" };
  if (id === "this-system") return { name: "Systems explainer", role: "Explains how this chat is built" };
  if (id === "contact") return { name: "Contact finder", role: "Finds how to reach Or" };
  return { name: "Profile reader", role: "Reads the summary and background" };
}

export async function runDemo(question: string, emit: (e: StreamEvent) => void): Promise<void> {
  emit({ t: "stage", id: "guard", status: "done", note: looksLikeInjection(question) ? "flagged" : undefined });
  emit({ t: "stage", id: "planner", status: "running" });
  await wait(500);

  if (looksLikeInjection(question)) {
    emit({ t: "stage", id: "planner", status: "blocked", note: "out of scope" });
    emit({ t: "delta", text: REPLY_OUT_OF_SCOPE });
    return;
  }

  const hits = lookup(question, 4);
  const groups = new Map<string, AgentSpec>();
  for (const id of hits) {
    const { name, role } = nameFor(id);
    const g = groups.get(name) ?? { id: `a${groups.size + 1}`, name, role, sections: [] };
    g.sections.push(id);
    groups.set(name, g);
  }
  const agents = [...groups.values()].slice(0, 3);
  emit({ t: "stage", id: "planner", status: "done" });
  emit({ t: "stage", id: "memory", status: "running" });
  await wait(250);
  emit({ t: "stage", id: "memory", status: "done" });

  if (agents.length === 0) {
    emit({ t: "stage", id: "synth", status: "blocked", note: "no findings" });
    emit({ t: "delta", text: REPLY_NO_ANSWER });
    return;
  }

  emit({ t: "agents", agents });
  emit({ t: "stage", id: "agents", status: "running" });
  await Promise.all(
    agents.map(async (a, i) => {
      emit({ t: "agent", id: a.id, status: "running" });
      await wait(700 + i * 350);
      emit({ t: "agent", id: a.id, status: "done" });
    }),
  );
  emit({ t: "stage", id: "agents", status: "done" });
  emit({ t: "stage", id: "synth", status: "running" });
  emit({ t: "stage", id: "filter", status: "running" });

  const top = sections.find((s) => s.id === hits[0]);
  const answer = top ? `${top.title}. ${top.text.slice(0, 330).trim()}…` : REPLY_NO_ANSWER;
  for (const word of answer.split(" ")) {
    emit({ t: "delta", text: word + " " });
    await wait(18);
  }
  emit({ t: "stage", id: "synth", status: "done" });
  emit({ t: "stage", id: "filter", status: "done" });
}
