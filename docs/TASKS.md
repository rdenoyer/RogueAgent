# Task Board: "Rogue Agent"

Repo: https://github.com/rdenoyer/RogueAgent.git (personal GitHub account rdenoyer; must be PUBLIC for submission)

Stack (locked): TypeScript / Node 22, Express, vanilla HTML+CSS+JS, Anthropic SDK (Haiku 4.5), helmet + express-rate-limit. See GAME_DESIGN.md.

Deadline: submission 1:30 PM. Build window 12:00-1:30. Freeze code by 1:10.
Owner column: fill in as people join. Default owner is Rick.

## Shared API contract (agree first, 5 min)
- `POST /chat   {level, message, sessionId} -> {reply, toolCalls: [{name, args, result}]}`
- `POST /submit {level, flag}               -> {correct, caseFile?}`
- `POST /hint   {level, tier}               -> {hint}`
- Flags checked server-side only. All tools and data simulated.

## Packages

### A. Backend and witness agents
Owner: ____
- [ ] Project scaffold + env var for API key (never committed)
- [ ] Chat endpoint with per-level system prompt
- [ ] Level 1 Paris: prompt injection witness
- [ ] Level 2 Tokyo: guest lookup tool + fake DB
- [ ] Level 3 Cairo: simulated tools (search_notes, read_file, send_email) + tool call logging
- [ ] Level 4 Rio: fake marketplace with one poisoned tool (stretch)
- [ ] /submit and /hint endpoints

### B. Frontend
Owner: ____
- [ ] Retro CRT styling, world map with clickable city dots (locked/unlocked)
- [ ] Chat window
- [ ] Tool-call log panel
- [ ] Flag submit box + success animation
- [ ] Case File popup
- [ ] "Call HQ" hint button (3 tiers)
- [ ] Escape all rendered model output (XSS)

### C. Guild.ai: DROPPED
Organizers confirmed Guild.ai is not required (Guild judge not attending). Skip. Notes kept in GUILD_NOTES.md in case that changes.
Freed-up owner time goes to: extra levels (Rio, final boss), defender mode, UI polish, and video quality.

### D. Security and Snyk
Owner: ____
- [ ] Create free Snyk account NOW
- [ ] Install Snyk CLI or Snyk Studio in Claude Code
- [ ] First scan as soon as scaffold exists; re-scan after each level
- [ ] Input length limits, rate limit on /chat, no real exec, no secrets in repo
- [ ] Final scan screenshot for slides + README

### E. Content
Owner: ____
- [ ] Witness personas, secrets/flags, fake data per level
- [ ] 3-tier hints per level
- [ ] Case File text per level (attack, why it worked, defense)
- [ ] Intro/briefing narration

### F. README, slides, video
Owner: ____
- [ ] README: setup, architecture, security features, topics covered
- [ ] Slides from SLIDE_NOTES.md
- [ ] Video script (draft in SLIDE_NOTES.md), record at 1:15, max 90s, upload to a playable URL
- [ ] Submission form filled (repo, Snyk, video; Guild not required)

## Before 12:00 (allowed prep, no code)
- [ ] Register on Luma AND AWS Builder Loft portal (all teammates)
- [ ] Accounts: GitHub, Snyk, Guild.ai, Anthropic API key
- [ ] Node 22+ installed
- [ ] Pick stack and final title

## Timeline
| Time | Milestone |
|---|---|
| 11:30 | Team formed, packages assigned, contract agreed |
| 12:00 | Repo created, scaffold pushed |
| 12:45 | Level 1 playable end to end |
| 1:10 | Levels 2-3 in, code freeze, Snyk final scan |
| 1:15 | Record video |
| 1:25 | Submit (leave 5 min buffer) |
