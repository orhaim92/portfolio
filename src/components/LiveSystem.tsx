"use client";

import { useCallback, useRef, useState } from "react";
import type { AgentSpec, StageId, StreamEvent } from "@/lib/agents/types";

type Status = "idle" | "running" | "done" | "blocked";
type Msg = { role: "user" | "assistant"; text: string; error?: boolean };

const STAGES: { id: StageId; title: string; sub: string }[] = [
  { id: "guard", title: "Input guard", sub: "cleans and limits the text" },
  { id: "planner", title: "Planner", sub: "builds a team for this question" },
  { id: "memory", title: "Memory", sub: "recalls routes that worked" },
  { id: "agents", title: "Dynamic agents", sub: "created per question" },
  { id: "synth", title: "Writer", sub: "answers from findings only" },
  { id: "filter", title: "Output filter", sub: "checks the answer as it streams" },
];

const SUGGESTIONS = [
  "What AI systems has Or built?",
  "How does he lead teams?",
  "What is his cloud and DevOps experience?",
  "How does this chat work?",
];

const idle = () => Object.fromEntries(STAGES.map((s) => [s.id, "idle"])) as Record<StageId, Status>;

function Dot({ status }: { status: Status }) {
  if (status === "running")
    return <span className="spin inline-block h-3 w-3 rounded-full border-2 border-accent border-t-transparent" aria-hidden />;
  const color = status === "done" ? "bg-accent" : status === "blocked" ? "bg-bad" : "bg-line";
  return <span className={`inline-block h-3 w-3 rounded-full ${color}`} aria-hidden />;
}

export function LiveSystem() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [stages, setStages] = useState<Record<StageId, Status>>(idle);
  const [notes, setNotes] = useState<Partial<Record<StageId, string>>>({});
  const [agents, setAgents] = useState<(AgentSpec & { status: Status })[]>([]);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => requestAnimationFrame(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight }));

  const handle = useCallback((e: StreamEvent) => {
    switch (e.t) {
      case "stage":
        setStages((s) => ({ ...s, [e.id]: e.status }));
        if (e.note) setNotes((n) => ({ ...n, [e.id]: e.note }));
        break;
      case "agents":
        setAgents(e.agents.map((a) => ({ ...a, status: "idle" as Status })));
        break;
      case "agent":
        setAgents((list) => list.map((a) => (a.id === e.id ? { ...a, status: e.status } : a)));
        break;
      case "delta":
        setMessages((m) => {
          const last = m[m.length - 1];
          return [...m.slice(0, -1), { ...last, text: last.text + e.text }];
        });
        scrollDown();
        break;
      case "error":
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: e.message, error: true }]);
        break;
      case "done":
        setMode(e.mode);
        setMs(e.ms);
        break;
    }
  }, []);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const earlier = messages.filter((m) => m.role === "user").map((m) => m.text).slice(-3);
    setBusy(true);
    setInput("");
    setStages(idle());
    setNotes({});
    setAgents([]);
    setMs(null);
    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: "" }]);
    scrollDown();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, earlier }),
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const l of lines) {
          if (!l.trim()) continue;
          try {
            handle(JSON.parse(l) as StreamEvent);
          } catch {
            /* skip a broken line */
          }
        }
      }
    } catch {
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: "The connection was lost. Please try again.", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  const stageBox = (id: StageId) => {
    const s = STAGES.find((x) => x.id === id)!;
    return (
      <div key={id} data-status={stages[id]} className="stage card flex-1 min-w-[150px] px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Dot status={stages[id]} />
          {s.title}
          {notes[id] && <span className="ml-auto rounded-full bg-panel px-2 py-0.5 text-[11px] font-normal text-muted">{notes[id]}</span>}
        </div>
        <div className="mt-0.5 text-xs text-muted">{s.sub}</div>
      </div>
    );
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
      {/* ---- Live graph ---- */}
      <div className="card p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between text-xs text-muted">
          <span className="font-mono uppercase tracking-widest">Live run</span>
          <span>
            {mode === "demo" && "demo mode: no model connected"}
            {mode === "live" && ms !== null && `${(ms / 1000).toFixed(1)}s`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">{(["guard", "planner", "memory"] as StageId[]).map(stageBox)}</div>

        <div className="my-2 flex justify-center text-muted" aria-hidden>
          ↓
        </div>
        <div data-status={stages.agents} className="stage rounded-2xl border border-dashed border-line p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Dot status={stages.agents} />
            Dynamic agents
            <span className="text-xs font-normal text-muted">created per question, run in parallel</span>
          </div>
          {agents.length === 0 ? (
            <p className="px-1 py-4 text-sm text-muted">Ask a question and the planner will create the agents here.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {agents.map((a, i) => (
                <div key={a.id} data-status={a.status} style={{ animationDelay: `${i * 90}ms` }} className="stage spawn rounded-xl border border-line bg-panel p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-accent-2">
                    <Dot status={a.status} />
                    {a.name}
                  </div>
                  <p className="mt-1 text-xs text-muted">{a.role}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.sections.map((s) => (
                      <span key={s} className="rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[10.5px] text-muted">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="my-2 flex justify-center text-muted" aria-hidden>
          ↓
        </div>
        <div className="flex flex-wrap gap-2">{(["synth", "filter"] as StageId[]).map(stageBox)}</div>
      </div>

      {/* ---- Chat ---- */}
      <div className="card flex min-h-[460px] flex-col p-4 sm:p-5">
        <div ref={logRef} className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 420 }} aria-live="polite">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Ask about Or&apos;s experience. Watch the agents work on the left.</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-line px-3 py-1.5 text-left text-sm text-text hover:border-accent hover:text-accent">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => {
            const streaming = busy && i === messages.length - 1 && m.role === "assistant";
            return (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${
                    m.role === "user" ? "bg-accent/15 text-text" : m.error ? "border border-bad/50 text-bad" : "bg-panel-2 text-text"
                  } ${streaming ? "caret" : ""}`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Your question
          </label>
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={400}
            autoComplete="off"
            placeholder="Ask about Or's work…"
            className="min-w-0 flex-1 rounded-xl border border-line bg-panel px-3.5 py-2.5 text-[15px] outline-none placeholder:text-muted focus:border-accent"
          />
          <button type="submit" disabled={busy || !input.trim()} className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-bg disabled:opacity-40">
            {busy ? "Working…" : "Ask"}
          </button>
        </form>
      </div>
    </div>
  );
}
