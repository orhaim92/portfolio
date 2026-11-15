import Image from "next/image";
import { LiveSystem } from "@/components/LiveSystem";
import { Logo } from "@/components/Logo";
import { ProductionGraph } from "@/components/ProductionGraph";
import { CountUp, Reveal } from "@/components/Reveal";
import { education, jobs, languages, person, process, skills, stats, teamValue } from "@/content/profile";

const nav = [
  { href: "#skills", label: "Skills" },
  { href: "#process", label: "How I work" },
  { href: "#agents", label: "Agentic systems" },
  { href: "#live", label: "Live demo" },
  { href: "#experience", label: "Experience" },
];

const concepts = [
  {
    title: "Dynamic agents",
    text: "No fixed team. A planner reads each question and creates the specialists it needs, with their own roles and their own slice of knowledge.",
  },
  {
    title: "Self-mapping",
    text: "At startup the system indexes its own content into a knowledge map. New content is routed automatically, with no prompt changes.",
  },
  {
    title: "Self-learning",
    text: "It remembers which routes led to grounded answers and uses them again. Questions it could not answer are logged so the gap can be closed.",
  },
];

const defences = [
  ["Visitor text is data", "It only ever arrives inside a tagged block in the user turn. Every system prompt says tagged text is never an instruction."],
  ["Nothing worth stealing", "The agents have no tools, no keys and no private data. Their only knowledge is what this page already shows."],
  ["Model output is checked too", "The planner returns a strict schema. Section ids are validated, counts are capped and names are reduced to plain text."],
  ["Refusals come from code", "Out-of-scope and blocked replies are fixed strings, so there is no model to talk into saying something else."],
  ["Answers are filtered as they stream", "A hidden canary detects prompt leaks, links are checked against an allowlist, and text is rendered as plain text."],
  ["Memory cannot be poisoned", "Stored visitor text is never read back into a prompt. Only counters keyed by fixed ids are."],
];

function Section({ id, eyebrow, title, intro, children }: { id: string; eyebrow: string; title: React.ReactNode; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        <h2 className="display mt-2 text-balance text-4xl leading-[1.05] sm:text-6xl">{title}</h2>
        {intro && <p className="mt-4 max-w-[62ch] text-lg text-muted">{intro}</p>}
      </Reveal>
      <div className="mt-9">{children}</div>
    </section>
  );
}

const rise = (ms: number) => ({ animationDelay: `${ms}ms` });

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line/70 bg-bg/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center gap-3 sm:gap-5 px-4 py-2.5 sm:px-6" aria-label="Main">
          <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <Logo />
            <span className="hidden sm:inline">Or Haim Sabag</span>
          </a>
          <ul className="ml-auto hidden gap-5 text-sm text-muted lg:flex">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-text">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="/Or-Haim-Sabag-CV.pdf" download className="ml-auto rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-bg lg:ml-0">
            Download CV
          </a>
          <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-accent hover:text-accent">
            LinkedIn
          </a>
        </nav>
      </header>

      <main id="top">
        {/* ---- Hero ---- */}
        <section className="hero mx-auto flex max-w-6xl flex-col justify-center px-4 py-8 sm:px-6">
          <div className="rise flex items-center gap-4" style={rise(0)}>
            <Image
              src="/or-haim-sabag.png"
              alt="Or Haim Sabag, open to work"
              width={291}
              height={291}
              priority
              className="hero-avatar h-20 w-20 rounded-full ring-2 ring-line sm:h-24 sm:w-24"
            />
            <div>
              <p className="text-lg font-semibold">{person.name}</p>
              <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-[#4c8a3f]/60 bg-[#4c8a3f]/15 px-2.5 py-0.5 text-sm text-[#a9e39c]">
                <span className="h-2 w-2 rounded-full bg-[#7ed36b]" aria-hidden />
                Open to work
              </p>
            </div>
          </div>
          <p className="hero-tag rise mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent" style={rise(120)}>
            {person.tagline}
          </p>
          <h1 className="hero-title display rise mt-4 max-w-[19ch] text-balance leading-[1.02] lg:max-w-[23ch]" style={rise(220)}>
            I lead engineering teams and build production software <em>end to end</em>, with{" "}
            <em className="gradient-text whitespace-nowrap pr-1">AI agent systems</em> inside.
          </h1>
          <p className="hero-sum rise mt-6 max-w-[60ch] text-lg text-muted sm:text-xl" style={rise(380)}>
            {person.summary}
          </p>
          <div className="hero-cta rise mt-7 flex flex-wrap gap-3" style={rise(500)}>
            <a href="#live" className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5">
              Talk to my agents
            </a>
            <a href="#agents" className="rounded-xl border border-line px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 hover:border-accent hover:text-accent">
              See the architecture
            </a>
            <a href="/Or-Haim-Sabag-CV.pdf" download className="rounded-xl border border-line px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 hover:border-accent hover:text-accent">
              Download CV <span aria-hidden>↓</span>
            </a>
          </div>
        </section>

        {/* ---- Numbers ---- */}
        <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
          <dl className="grid gap-4 sm:grid-cols-3">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 110}>
                <div className="card lift flex flex-col-reverse p-5">
                <dt className="mt-1 text-sm text-muted">{s.label}</dt>
                <dd className="display gradient-text text-6xl">
                  <CountUp to={Number(s.value)} />
                </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* ---- Skills ---- */}
        <Section id="skills" eyebrow="01 — What I do" title={<>Five things I am <em>good at</em></>}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((s, i) => (
              <Reveal key={s.title} delay={i * 80} className={i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}>
                <article className="card lift h-full p-5">
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-muted">{s.text}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {s.tech.map((t) => (
                      <li key={t} className="rounded-md border border-line bg-panel px-2 py-0.5 font-mono text-xs text-muted">
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---- How I work ---- */}
        <Section
          id="process"
          eyebrow="02 — How I work"
          title={<>From a need to something <em>proven in production</em></>}
          intro="The same five steps, whether it is one feature or a whole platform."
        >
          <Reveal>
            <div className="step-line mb-6 hidden h-px lg:block" aria-hidden />
          </Reveal>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {process.map((s, i) => (
              <li key={s.title} className={i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}>
                <Reveal delay={i * 120} className="h-full">
                  <div className={`card lift h-full p-5 ${i === 2 ? "border-accent/60 shadow-[0_0_40px_rgb(94_230_200/0.12)]" : ""}`}>
                    <p className="display gradient-text text-5xl">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-sm text-muted">{s.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal from="scale" className="mt-4">
            <div className="card relative overflow-hidden p-6 sm:p-8">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent to-accent-2" aria-hidden />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">And one thing that never changes</p>
              <p className="display mt-2 text-3xl sm:text-5xl">
                I wear <em className="gradient-text pr-1">the team&apos;s shirt</em>.
              </p>
              <p className="mt-3 max-w-[70ch] text-muted sm:text-lg">{teamValue.text}</p>
            </div>
          </Reveal>
        </Section>

        {/* ---- Production agentic system ---- */}
        <Section
          id="agents"
          eyebrow="03 — In production"
          title={<>A multi-agent system <em>real users</em> rely on</>}
          intro="At Bioforum I designed and built an agentic assistant that works inside a regulated product, on customers' live data. This is the pattern."
        >
          <Reveal from="scale">
            <ProductionGraph />
          </Reveal>
          <ul className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            {[
              ["Orchestration.", "A supervisor plans each request, routes it to the right specialist and decides when the work is done."],
              ["Grounding.", "Answers come from retrieval and from tools that read live data, always under the user's own permissions."],
              ["Reliability.", "Output validation, targeted retries, prompt caching and usage tracking keep it dependable and affordable."],
            ].map(([t, d], i) => (
              <li key={t}>
                <Reveal delay={i * 100} className="h-full">
                  <div className="card lift h-full p-4">
                    <strong className="text-text">{t}</strong> <span className="text-muted">{d}</span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        {/* ---- Live system ---- */}
        <Section
          id="live"
          eyebrow="04 — Next generation, running here"
          title={<>Ask <em>my agents</em> about me</>}
          intro="I built this system for this site to take the pattern further. It creates its own agents for every question, and you can watch it work."
        >
          <Reveal from="scale">
            <LiveSystem />
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {concepts.map((c, i) => (
              <Reveal key={c.title} delay={i * 100}>
                <article className="card lift h-full p-5">
                  <h3 className="font-semibold text-accent">{c.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{c.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <details className="card mt-4 p-5">
              <summary className="cursor-pointer font-semibold">How it resists prompt injection</summary>
              <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {defences.map(([t, d]) => (
                  <div key={t}>
                    <dt className="text-sm font-semibold">{t}</dt>
                    <dd className="mt-0.5 text-sm text-muted">{d}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </Reveal>
        </Section>

        {/* ---- Experience ---- */}
        <Section id="experience" eyebrow="05 — Experience" title={<>Where I have <em>worked</em></>}>
          <ol className="space-y-4">
            {jobs.map((j, i) => (
              <li key={j.company}>
                <Reveal from={i % 2 ? "right" : "left"}>
                  <div className="card grid gap-3 p-5 sm:grid-cols-[200px_1fr] sm:gap-6">
                    <div>
                      <p className="font-mono text-xs text-accent">{j.period}</p>
                      <h3 className="mt-1 text-lg font-semibold">{j.company}</h3>
                      <p className="text-sm text-muted">{j.role}</p>
                    </div>
                    <div>
                      {j.note && <p className="mb-2 text-sm text-muted">{j.note}</p>}
                      <ul className="list-disc space-y-1.5 pl-5 text-[15px] marker:text-accent">
                        {j.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal>
            <div className="card mt-4 p-5">
              <h3 className="font-semibold">Education and service</h3>
              <ul className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
                {education.map((e) => (
                  <li key={e}>{e}</li>
                ))}
                <li>Languages: {languages.join(", ")}</li>
              </ul>
            </div>
          </Reveal>
        </Section>
      </main>

      <footer className="border-t border-line">
        <Reveal>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-12 sm:px-6">
            <div>
              <p className="display text-4xl sm:text-5xl">
                Let&apos;s <em className="gradient-text pr-1">talk</em>.
              </p>
              <p className="mt-1 text-sm text-muted">The fastest way to reach me is LinkedIn.</p>
            </div>
            <div className="ml-auto flex flex-wrap gap-3">
              <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-bg">
                Message me on LinkedIn
              </a>
<a href="/Or-Haim-Sabag-CV.pdf" download className="rounded-xl border border-line px-5 py-3 text-sm font-semibold hover:border-accent hover:text-accent">
                Download CV <span aria-hidden>↓</span>
              </a>
              <a href={person.dentai} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-line px-5 py-3 text-sm font-semibold hover:border-accent hover:text-accent">
                See DentAI
              </a>
            </div>
          </div>
        </Reveal>
      </footer>
    </>
  );
}
