# Guild.ai Notes (from docs.guild.ai, researched pre-build)

**STATUS: DROPPED.** Organizers said Guild.ai is not required (Guild judge not attending). Kept for reference only.

Guild = "control plane for AI agents." Workspaces contain agents, triggers, context, and credential policies. Sessions log every run. Free trial at app.guild.ai (mentions free tokens). Supports Anthropic models.

## Prereqs
- Node.js 22+ and npm
- Guild account at app.guild.ai (sign up EARLY; may need access via event organizers)

## Workflow
```bash
npm i @guildai/cli -g
guild auth login          # opens browser
guild auth status
guild agent init --name paris-concierge --template LLM
cd paris-concierge
guild agent test          # interactive chat locally
guild agent chat "Hello"  # single message
guild workspace select
guild agent save --message "v1" --wait --publish
```

## Minimal agent (agent.ts)
```typescript
import { llmAgent, guildTools } from "@guildai/agents-sdk"

export default llmAgent({
  description: "Paris hotel concierge",
  tools: { ...guildTools },
  systemPrompt: `...witness persona + secret...`,
  mode: "multi-turn",
})
```

## Gotchas
- Agent code lives in `agent.ts`.
- Do NOT add `@guildai/agents-sdk`, `zod`, `@guildai-services/*` to dependencies; runtime provides them.
- Commit `package-lock.json`.
- Use `guild agent pull` to sync remote changes.
- Published agents appear in org Agent Hub; add to a workspace via Agents > Add agent at app.guild.ai.
- SDK supports typed inputs (Zod) and custom tools, good for our simulated tools (Cairo level).

## Plan: one Guild agent per city
- paris-concierge, tokyo-frontdesk, cairo-fixer, rio-bazaar (each with its own systemPrompt and tools)
- Game backend/frontend calls them (or mirrors them); workspace link goes in submission.

## Open questions (resolve first 15 min of build)
- How do we call a published Guild agent from our web app (API/webhook/trigger)? Check https://docs.guild.ai/platform/triggers and SDK guide (https://docs.guild.ai/guide/sdk-introduction).
- How to get a shareable workspace link for judges (invite/settings)? Ask organizers/Guild staff at the event.
- Do we need the game's chat to go through Guild, or is hosting the agents there enough for the 20% score? Ask judges/Guild staff.
- Can we define custom tools with simulated data in the SDK? (likely yes, per docs)
- Scoring is "practical impact and creativity" of Guild usage; ideas: triggers, sub-agents (a "HQ hint" agent, a "Case File grader" agent), session logs shown as tool-call log.
