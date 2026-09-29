# AGENTS.md: instructions for any AI agent working in this repo

Project: **Rogue Agent**, an AI-security teaching game for the AI Security Engineering Hackathon (AWS Builder Loft, SF, Sept 29 2026). Repo: https://github.com/rdenoyer/RogueAgent (public, owner `rdenoyer`).

## What we're building
A Carmen-Sandiego-style detective game (homage, our own art and name; no copyrighted assets). Each city is a level: a witness chat agent guards a clue (the flag). The player uses a real AI-security attack to extract it, then reads a "Case File" explaining the attack, the OWASP ID, the trust boundary crossed, and the defense. Hints via "Call HQ" (3 tiers).

Read these before making changes:
- `docs/GAME_DESIGN.md`: levels, mechanics, locked stack, architecture
- `docs/TASKS.md`: work packages, API contract, timeline, owners
- `docs/COURSE_NOTES.md`, `docs/COVERAGE_CHECKLIST.md`: the Snyk "AI Security Engineer Foundations" vocabulary we must reflect (OWASP ASI/MCP/LLM IDs, toxic flows, AIBOM, guardrails)
- `docs/SLIDE_NOTES.md`: deck and 90-second video material
- `docs/GUILD_NOTES.md`: reference only. Guild.ai is DROPPED (not required).

## Hard deadlines
Build window 12:00-1:30 PM PDT. Code freeze 1:10. Submission deadline **1:30 PM**. Video max 90 seconds.

## Locked stack
TypeScript on Node 22+, Express, vanilla HTML/CSS/JS (no framework, no build step), Anthropic SDK (Haiku 4.5 for witnesses), `helmet`, `express-rate-limit`. Keep dependencies minimal; commit `package-lock.json`.

## API contract (server-side only logic)
- `POST /chat   {level, message, sessionId} -> {reply, toolCalls: [{name, args, result}]}`
- `POST /submit {level, flag} -> {correct, caseFile?}`
- `POST /hint   {level, tier} -> {hint}`
Flags are checked server-side only and never sent to the client.

## Security rules (we are scored on Snyk results and on modeling good practice)
- **Never commit secrets.** The Anthropic key lives only in `.env` (gitignored). Only `.env.example` (empty values) is committed. Run `git status` and check the diff for keys before every commit. Never print or echo a key.
- **All vulnerabilities are simulated.** Tools and data are plain TS functions over fake JSON. No real shell, no real file access outside `public/`, no arbitrary network calls, no `eval`/`child_process` on model or user input.
- Cap input lengths, rate-limit `/chat`, use `helmet`, and escape all rendered model output (no `innerHTML` with model text).
- Treat AI-written code as untrusted: run `snyk code test` and `snyk test` after each level and fix findings. Snyk CLI is installed and authenticated.
- Do not add dependencies without a reason; prefer stdlib.

## Working rules
- Match the existing code style; keep it small and readable. Prefer editing over creating files.
- Do not start code before the 12:00 build window opens (hackathon rule: work must originate during the event). Planning docs are fine.
- Don't push directly to break `main`: keep it runnable. Small commits with clear messages.
- Commit messages end with: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (when Claude authors the commit).
- Don't take actions outside this project (no account creation, no sending messages, no posting) without the user's explicit yes.
- Ownership: check `docs/TASKS.md` for who owns which package to avoid stepping on each other's files. `/server` = backend (A), `/public` = frontend (B), content in `server/levels/` (E).

## Out of scope / dropped
Guild.ai (organizers confirmed not required). Defender mode, the success-rate scoreboard, and the final boss are stretch goals: cut them first.
