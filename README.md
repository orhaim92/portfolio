# Portfolio

Personal site for Or Haim Sabag: a page about his work, plus a small multi-agent
system that answers questions about him and shows itself working.

## Run

    npm install
    npm run dev

Without `ANTHROPIC_API_KEY` the chat runs in demo mode (keyword lookup, no model).
Copy `.env.example` to `.env.local` and add a key for the live system.

## Where things are

- `src/content/profile.ts` holds all page content. It is also the only knowledge the agents have.
- `src/lib/agents/knowledge.ts` builds the knowledge map from that content at startup (self-mapping).
- `src/lib/agents/pipeline.ts` is the agent system: planner, dynamic agents, writer.
- `src/lib/agents/guard.ts` cleans input and filters output (prompt-injection defences).
- `src/lib/agents/memory.ts` holds rate limits, learned routes and knowledge gaps (self-learning).
- `src/app/api/chat/route.ts` is the streaming endpoint.
- `src/components/` holds the animated diagram and the live chat UI.

## Deploy

Push to GitHub, import the repository in Vercel, and set `ANTHROPIC_API_KEY` under
Project > Settings > Environment Variables. For memory that survives restarts,
connect Upstash Redis under Storage.
