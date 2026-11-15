export type StageId = "guard" | "planner" | "memory" | "agents" | "synth" | "filter";

export type AgentSpec = { id: string; name: string; role: string; sections: string[] };

export type StreamEvent =
  | { t: "stage"; id: StageId; status: "running" | "done" | "blocked"; note?: string }
  | { t: "agents"; agents: AgentSpec[] }
  | { t: "agent"; id: string; status: "running" | "done" }
  | { t: "delta"; text: string }
  | { t: "done"; mode: "live" | "demo"; ms: number }
  | { t: "error"; message: string };

export type ChatTurn = { role: "user" | "assistant"; text: string };
