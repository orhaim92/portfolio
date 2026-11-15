import { person, skills, jobs, education, languages, stats, process as workSteps, teamValue } from "@/content/profile";

// The knowledge base is built from the page content, so the agents can only
// ever say what the page itself says.
export type Section = { id: string; title: string; text: string };

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const sections: Section[] = [
  {
    id: "summary",
    title: "Summary",
    text: `${person.name}. ${person.headline}. ${person.summary} ${stats.map((s) => `${s.value} ${s.label}`).join("; ")}. Based in ${person.location}.`,
  },
  ...skills.map((s) => ({
    id: `skill-${slug(s.title)}`,
    title: `Skill: ${s.title}`,
    text: `${s.title}. ${s.text} Technologies: ${s.tech.join(", ")}.`,
  })),
  ...jobs.map((j) => ({
    id: `job-${slug(j.company)}`,
    title: `${j.company}, ${j.role} (${j.period})`,
    text: `${j.company}. ${j.role}. ${j.period}. ${j.note ?? ""} ${j.points.join(" ")}`,
  })),
  {
    id: "how-i-work",
    title: "How Or works: from a need to production",
    text: workSteps.map((s, i) => `Step ${i + 1}, ${s.title}: ${s.text}`).join(" ") + ` As a colleague: ${teamValue.title} ${teamValue.text}`,
  },
  {
    id: "education",
    title: "Education and military service",
    text: education.join(". ") + ". Languages: " + languages.join(", ") + ".",
  },
  {
    id: "contact",
    title: "Contact",
    text: `The best way to reach Or is LinkedIn: ${person.linkedin}. DentAI product: ${person.dentai}.`,
  },
  {
    id: "this-system",
    title: "How this chat works",
    text: "This chat is a small multi-agent system Or built for this site. A planner reads the question and creates specialist agents on the fly. Each agent reads only the parts of the knowledge map it was given. A synthesizer writes the answer from their findings. The system maps its own knowledge at startup, learns which routes work, and logs questions it could not answer. It has no tools and no private data, and visitor text is always treated as data, not instructions.",
  },
];

export const sectionIds = sections.map((s) => s.id);

// ---- Self-mapping -------------------------------------------------------
// At startup the system indexes its own content: which terms live in which
// sections, and which sections are related. Add a section to profile.ts and
// it is routed automatically, with no prompt changes.
const STOP = new Set(
  "the a an and or of in on for to with by at as is are was were be been it its this that from into than then them their his her he she my our we you your not no can do did does has have had will who what which when where how much many more most also all any each per out up about tell".split(
    " ",
  ),
);

function terms(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9+#.]{1,}/g) ?? []).filter((w) => !STOP.has(w));
}

export type KnowledgeMap = {
  index: Record<string, string[]>; // term -> section ids
  related: Record<string, string[]>; // section id -> related section ids
};

export function buildKnowledgeMap(): KnowledgeMap {
  const index: Record<string, Set<string>> = {};
  const bySection: Record<string, Set<string>> = {};
  for (const s of sections) {
    const set = new Set(terms(`${s.title} ${s.text}`));
    bySection[s.id] = set;
    for (const t of set) (index[t] ??= new Set()).add(s.id);
  }
  const related: Record<string, string[]> = {};
  for (const a of sections) {
    const scored = sections
      .filter((b) => b.id !== a.id)
      .map((b) => {
        let shared = 0;
        // Rare terms count more than common ones.
        for (const t of bySection[a.id]) if (bySection[b.id].has(t)) shared += 1 / index[t].size;
        return { id: b.id, shared };
      })
      .sort((x, y) => y.shared - x.shared);
    related[a.id] = scored
      .slice(0, 3)
      .filter((x) => x.shared > 0.5)
      .map((x) => x.id);
  }
  return {
    index: Object.fromEntries(Object.entries(index).map(([k, v]) => [k, [...v]])),
    related,
  };
}

export const knowledgeMap = buildKnowledgeMap();

/** Sections that share the most (rare) terms with the question. */
export function lookup(question: string, limit = 4): string[] {
  const score: Record<string, number> = {};
  for (const t of new Set(terms(question))) {
    const hits = knowledgeMap.index[t];
    if (!hits) continue;
    for (const id of hits) score[id] = (score[id] ?? 0) + 1 / hits.length;
  }
  return Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

export function sectionText(ids: string[]): string {
  return sections
    .filter((s) => ids.includes(s.id))
    .map((s) => `<section id="${s.id}" title="${s.title}">\n${s.text}\n</section>`)
    .join("\n");
}

export function mapOverview(): string {
  return sections
    .map((s) => `- ${s.id}: ${s.title} (related: ${knowledgeMap.related[s.id].join(", ") || "none"})`)
    .join("\n");
}
