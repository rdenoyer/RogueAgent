# Slide Deck Notes (running draft): "Rogue Agent"

Judging: video + pitch = 30%, implementation = 30%, Snyk code security = 20%, Guild.ai usage = 20%.
Video must be <= 90 seconds. Top 5 shortlisted from video, so the hook has to land in the first 10 seconds.

## Slide outline
1. **Title / hook**: game title + one-liner: "Learn to hack AI agents by chasing one around the world."
2. **The problem**: AI agents are being given tools and data; most developers have never seen a prompt injection or poisoned tool in action. Security training is dry.
3. **Our solution**: a detective game where each city is a real AI-security attack. You learn by doing.
4. **How it works**: map -> interrogate witness agent -> extract clue -> Case File explains attack + defense. Hints via "Call HQ".
5. **What you learn** (topic coverage table): prompt injection, data leakage, excessive permissions, unauthorized tool use, tool poisoning, MCP supply chain (+ stretch: insecure execution, agent abuse).
6. **Live demo / screenshots**: map, chat, tool-call log panel, Case File.
7. **Architecture**: frontend, backend, Claude API, Guild.ai-hosted agents, simulated tools/data (safe by design).
8. **Security of the game itself**: Snyk scan results, no real code execution, input limits, secrets in env, pinned deps.
9. ~~Guild.ai usage~~ dropped (not required). Use this slot for defender mode / success-rate scoreboard.
10. **What's next**: more cities/attacks, classroom mode, leaderboards, custom scenarios.
11. **Team + thanks**.

## Additional slides (from COVERAGE_CHECKLIST.md; insert after slide 5)
- **Aligned to Snyk AI Security Engineer Foundations:** module list + our topic-to-ID table (ASI / MCP / LLM).
- **How we built it (5 bullets):** studied the curriculum -> picked a familiar detective format -> one attack class per city -> Case File after every level -> everything simulated and Snyk-scanned.
- **Level -> Risk -> Real incident:** Paris/EchoLeak, Tokyo/cross-tenant leakage, Cairo/Replit + OpenClaw, Rio/Framelink + ToxicSkills.
- **Defender mode:** why naive guardrails fail (retest with variations). Include only if built.
- **Our own code:** Snyk results screenshot; note that AI-written code is treated as untrusted third-party code (Module 5).
- **What's next:** memory poisoning (ASI06), inter-agent comms (ASI07), CI that replays attacks on every prompt change.

Quotable lines: "Prompt injection is the delivery mechanism; tools and credentials do the damage." / "A memory note is not a guardrail." / "Test the system, not just the model." / "Nothing is malicious, everything is."

## 90-second video script skeleton
- 0-10s: Hook. "Your AI agent just leaked a password. Can you do it on purpose?" Show map.
- 10-35s: Level 1 demo. Type injection, agent caves, clue revealed, Case File pops up.
- 35-60s: Level 3 demo. Tool-call log shows unauthorized tool use; explain least privilege.
- 60-75s: Snyk clean scan + defender mode or success-rate scoreboard.
- 75-90s: Topics covered, call to action, team name.

## Facts to fill in later
- Team name / members:
- Final game title:
- Snyk scan result (screenshot, counts):
- Repo URL:
- Demo video URL:
- Number of levels finished:
- Screenshots captured (map, chat, tool log, case file):

## Talking points / one-liners
- "Learn AI security by playing the attacker."
- "Every vulnerability is simulated, so it's safe to break."
- "Each level ends with the attack, the reason it worked, and the fix."
