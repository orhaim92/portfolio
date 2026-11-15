// The agentic system pattern Or ran in production, drawn with general AI
// concepts. Pure SVG with CSS/SMIL animation, so it needs no client JavaScript.
// Two layouts of the same graph: left-to-right for wide screens, top-to-bottom
// for phones, where a wide drawing would shrink until the labels are unreadable.

type Node = { id: string; x: number; y: number; w: number; h: number; title: string; sub: string; tone?: "accent" | "violet" };
type Flow = { id: string; d: string; delay: number };

const rails = ["Shared state", "Per-user permissions", "Prompt caching", "Usage tracking", "Audit trail"];

const DESC =
  "A request passes guardrails to a supervisor, which routes it to a knowledge agent that uses retrieval or a data agent that calls tools on live data. The agents report back to the supervisor. Results are validated and streamed back as an answer. Shared state, per-user permissions, prompt caching, usage tracking and an audit trail run under every step.";

// ---- Wide layout ---------------------------------------------------------
const wideNodes: Node[] = [
  { id: "req", x: 20, y: 178, w: 130, h: 64, title: "Request", sub: "user question" },
  { id: "guard", x: 190, y: 178, w: 150, h: 64, title: "Guardrails", sub: "input checks" },
  { id: "sup", x: 384, y: 170, w: 190, h: 80, title: "Supervisor", sub: "plans and routes", tone: "accent" },
  { id: "docs", x: 640, y: 60, w: 230, h: 64, title: "Knowledge agent", sub: "RAG · hybrid search", tone: "violet" },
  { id: "data", x: 640, y: 296, w: 230, h: 64, title: "Data agent", sub: "tool calling on live data", tone: "violet" },
  { id: "val", x: 930, y: 178, w: 170, h: 64, title: "Validation", sub: "checks · retries" },
  { id: "ans", x: 1140, y: 178, w: 120, h: 64, title: "Answer", sub: "streamed" },
];
const wideFlows: Flow[] = [
  { id: "w1", d: "M150 210 H190", delay: 0 },
  { id: "w2", d: "M340 210 H384", delay: 0.3 },
  { id: "w3", d: "M574 196 C610 196 600 92 640 92", delay: 0.6 },
  { id: "w4", d: "M574 224 C610 224 600 328 640 328", delay: 0.9 },
  { id: "w5", d: "M870 92 C910 92 900 196 930 196", delay: 1.4 },
  { id: "w6", d: "M870 328 C910 328 900 224 930 224", delay: 1.7 },
  { id: "w7", d: "M1100 210 H1140", delay: 2.2 },
];
const wideLoops = ["M755 60 C755 14 479 14 479 170", "M755 360 C755 410 479 410 479 250"];

// ---- Tall layout (phones) ------------------------------------------------
const tallNodes: Node[] = [
  { id: "req", x: 100, y: 8, w: 160, h: 56, title: "Request", sub: "user question" },
  { id: "guard", x: 100, y: 98, w: 160, h: 56, title: "Guardrails", sub: "input checks" },
  { id: "sup", x: 75, y: 190, w: 210, h: 68, title: "Supervisor", sub: "plans and routes", tone: "accent" },
  { id: "docs", x: 6, y: 336, w: 166, h: 68, title: "Knowledge agent", sub: "RAG · hybrid search", tone: "violet" },
  { id: "data", x: 188, y: 336, w: 166, h: 68, title: "Data agent", sub: "tools on live data", tone: "violet" },
  { id: "val", x: 100, y: 482, w: 160, h: 56, title: "Validation", sub: "checks · retries" },
  { id: "ans", x: 100, y: 572, w: 160, h: 56, title: "Answer", sub: "streamed" },
];
const tallFlows: Flow[] = [
  { id: "t1", d: "M180 64 V98", delay: 0 },
  { id: "t2", d: "M180 154 V190", delay: 0.3 },
  { id: "t3", d: "M150 258 C150 300 89 294 89 336", delay: 0.6 },
  { id: "t4", d: "M210 258 C210 300 271 294 271 336", delay: 0.9 },
  { id: "t5", d: "M89 404 C89 446 150 440 150 482", delay: 1.4 },
  { id: "t6", d: "M271 404 C271 446 210 440 210 482", delay: 1.7 },
  { id: "t7", d: "M180 538 V572", delay: 2.2 },
];
const tallLoops = ["M24 336 C24 262 44 224 75 224", "M336 336 C336 262 316 224 285 224"];

function Graph({
  k,
  viewBox,
  nodes,
  flows,
  loops,
  className,
  children,
}: {
  k: string;
  viewBox: string;
  nodes: Node[];
  flows: Flow[];
  loops: string[];
  className: string;
  children?: React.ReactNode;
}) {
  const grad = `flowGrad-${k}`;
  const glow = `glow-${k}`;
  const [, , vw, vh] = viewBox.split(" ");
  return (
    <svg viewBox={viewBox} role="img" aria-labelledby={`pg-title-${k} pg-desc-${k}`} className={className}>
      <title id={`pg-title-${k}`}>Multi-agent system in production</title>
      <desc id={`pg-desc-${k}`}>{DESC}</desc>
      <defs>
        {/* In user space, because a bounding-box gradient does not paint on a perfectly straight line. */}
        <linearGradient id={grad} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={vw} y2={vh}>
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Loop: agents report back to the supervisor */}
      {loops.map((d) => (
        <path key={d} d={d} className="flow-line" strokeDasharray="3 7" />
      ))}

      {flows.map((p) => (
        <g key={p.id}>
          <path id={p.id} d={p.d} className="flow-line" />
          <path d={p.d} className="flow-live" style={{ stroke: `url(#${grad})` }} opacity="0.7" />
          <circle r="5" fill="var(--accent)" filter={`url(#${glow})`}>
            <animateMotion dur="2.8s" begin={`${p.delay}s`} repeatCount="indefinite">
              <mpath href={`#${p.id}`} />
            </animateMotion>
          </circle>
        </g>
      ))}

      {nodes.map((n) => {
        const stroke = n.tone === "accent" ? "var(--accent)" : n.tone === "violet" ? "var(--accent-2)" : "var(--line)";
        return (
          <g key={n.id}>
            {n.tone && <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="14" fill="none" stroke={stroke} strokeWidth="2" className="node-pulse" />}
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="14" fill="var(--panel-2)" stroke={stroke} strokeWidth="1.5" />
            <text x={n.x + n.w / 2} y={n.y + n.h / 2 - 4} textAnchor="middle" fontSize="17" fontWeight="600" fill="var(--text)">
              {n.title}
            </text>
            <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 17} textAnchor="middle" fontSize="13" fill="var(--muted)">
              {n.sub}
            </text>
          </g>
        );
      })}
      {children}
    </svg>
  );
}

export function ProductionGraph() {
  return (
    <div className="card p-4 sm:p-6">
      {/* Wide screens */}
      <Graph k="w" viewBox="0 0 1280 470" nodes={wideNodes} flows={wideFlows} loops={wideLoops} className="hidden w-full md:block">
        <text x="617" y="12" textAnchor="middle" fontSize="13" fill="var(--muted)">
          report back, decide the next step
        </text>
        <line x1="20" y1="424" x2="1260" y2="424" stroke="var(--line)" strokeDasharray="2 6" />
        {rails.map((r, i) => {
          const x = 60 + i * 238;
          return (
            <g key={r}>
              <rect x={x} y={434} width="210" height="30" rx="15" fill="var(--panel)" stroke="var(--line)" />
              <circle cx={x + 18} cy={449} r="4" fill={i % 2 ? "var(--accent-2)" : "var(--accent)"} />
              <text x={x + 32} y={454} fontSize="13.5" fill="var(--text)">
                {r}
              </text>
            </g>
          );
        })}
      </Graph>

      {/* Phones */}
      <div className="md:hidden">
        <Graph k="t" viewBox="0 0 360 636" nodes={tallNodes} flows={tallFlows} loops={tallLoops} className="mx-auto w-full max-w-[400px]">
          <text x="180" y="306" textAnchor="middle" fontSize="12.5" fill="var(--muted)">
            agents report back
          </text>
        </Graph>
        <ul className="mt-5 flex flex-wrap justify-center gap-2 border-t border-dashed border-line pt-4">
          {rails.map((r, i) => (
            <li key={r} className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-[13px]">
              <span className={`h-2 w-2 rounded-full ${i % 2 ? "bg-accent-2" : "bg-accent"}`} aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
