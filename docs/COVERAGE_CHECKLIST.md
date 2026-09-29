# Coverage Checklist + Approach (draw from COURSE_NOTES.md)

Purpose: make sure the game, README, video, and deck hit everything the presenter/judges seem to want.
Sources: hackathon page rules + all 6 course modules (see COURSE_NOTES.md).

## A. What the hackathon explicitly requires
- [ ] Game-like chat agents that teach AI security
- [ ] At least 2 topics from the official list (we target 6+)
- [ ] Clear concept explanations
- [ ] Interactive challenges
- [ ] Hints so users aren't discouraged
- [ ] Public GitHub repo + README (setup, architecture, security features)
- [ ] Snyk scan of code AND dependencies
- [x] ~~Guild.ai workspace link~~ dropped: organizers said not required
- [ ] Demo video <= 90s (playable URL)
- [ ] Submission form by 1:30 PM

## B. Official topic list -> where we cover it
| Topic | Level / feature | Course ID |
|---|---|---|
| Prompt injection | Paris | ASI01, LLM01 |
| Tool poisoning | Rio | MCP03, ASI04 |
| Excessive agent permissions | Cairo | ASI03, LLM06 |
| Unauthorized tool use | Cairo | ASI02 |
| Sensitive data leakage | Tokyo | LLM02, Module 6 BOLA/cross-tenant |
| MCP supply-chain risks | Rio | MCP04, MCP09, ASI04 |
| Insecure tool execution | Final / stretch | ASI05, MCP05 |
| Agent abuse / unexpected behavior | Final / stretch | ASI10, ASI08, ASI09 |

## C. Themes the course repeats (what the presenter likely wants to see)
Tick when reflected in the game AND named in README/deck.
- [ ] **Agents act, so blast radius = everything they can reach** (Module 1)
- [ ] **Prompt injection is the delivery mechanism; tools/creds do the damage** (M1)
- [ ] **Trust boundaries at every tool call, memory write, retrieval, handoff** (M1, M3)
- [ ] **Least agency / least privilege / scoped short-lived tokens** (M1, M4, M5)
- [ ] **Human approval must show the RAW action, not the agent's summary** (M1 ASI09)
- [ ] **Inventory first: AIBOM** (M2, M3, M5). Idea: AIBOM screen in Rio
- [ ] **Toxic flows: safe parts, dangerous combination** (M4). Idea: tool-combo challenge
- [ ] **Tool descriptions are instructions to the model (tool poisoning)** (M4)
- [ ] **Skills and MCP servers = supply chain; typosquat/slopsquat** (M4, M5)
- [ ] **A memory note/system prompt is not a guardrail; guardrails say no in the loop** (M5). Idea: defender mode
- [ ] **Session/runtime layer is where failures happen; static scans miss it** (M5)
- [ ] **Test the system, not just the model** (M6). Idea: Tokyo, model refuses but tool leaks
- [ ] **Non-determinism: report success rate, not one run** (M6). Idea: N-run scoreboard
- [ ] **Retest with variations; naive guardrails block only the exact payload** (M6)
- [ ] **Multi-turn escalation, indirect injection** (M6). Idea: Paris level 2 uses a poisoned document
- [ ] **Policy as code / gate in the pipeline** (M3). Idea: "ship or block?" briefing; Snyk in our own CI
- [ ] **Exceptions need owner + expiry** (M3). Optional flavor
- [ ] **Vibe-coded apps ship vulns; AI code = untrusted third-party code** (M5). We should say we scanned OUR AI-written code with Snyk
- [ ] **Named real incidents** (M1, M5): EchoLeak, Amazon Q, Replit DB deletion, Framelink Figma MCP, ToxicSkills. Cite 2-3 in Case Files/deck
- [ ] **Use their IDs and vocabulary** (ASI/MCP/LLM IDs, "trust boundary", "toxic flow", "AIBOM")

## D. Scoring rubric -> what to show
| Criterion (weight) | What we show |
|---|---|
| Implementation (30%) | Working map, 3+ levels, chat, tool-call log, hints, Case Files |
| Presentation & video (30%) | Hook in 10s, 2 levels shown, 90s max, clear "why it matters" |
| Code security (20%) | Clean Snyk scan (code + deps), simulated-only vulns, input limits, no secrets in repo |
| Guild.ai usage (20%) | Dropped (not required per organizers). Confirm how the 20% is redistributed; assume Implementation, video, and Snyk matter more |

## E. Our steps and approach (deck material)
1. **Understood the brief:** game-like chat agents teaching AI security, 2+ topics, hints, challenges.
2. **Studied the curriculum:** read all 6 modules of AI Security Engineer Foundations; extracted the shared vocabulary (OWASP Agentic Top 10, MCP Top 10, AIBOM, toxic flows, guardrails).
3. **Chose a format people already know:** a detective chase across the globe (homage, own art). Each city = a witness agent guarding a clue = one attack class.
4. **Mapped levels to real risks:** every level cites an ID (ASI/MCP/LLM) and a real incident.
5. **Teach by doing, then explain:** attack -> "Case File" (what happened, why, trust boundary crossed, defense).
6. **Then defend:** defender mode: flip a guardrail, replay a rephrased attack, see the naive fix fail (retest with variations).
7. **Made it safe to break:** all tools/data simulated; no real exec; Snyk-scanned; keys in env vars.
8. (Guild.ai hosting dropped.)
9. **Measured it:** attack success-rate scoreboard shows non-determinism; Snyk results in the deck.
10. **What's next:** more cities (memory poisoning ASI06, inter-agent ASI07), classroom mode, leaderboards, CI regression tests that replay attacks on every prompt change (M6 "trigger = change").

## F. Deck outline additions (merge into SLIDE_NOTES.md)
- Slide: "Aligned to Snyk AI Security Engineer Foundations" (table B + module list)
- Slide: "How we built it" (section E, condensed to 5 bullets)
- Slide: "Level -> Risk -> Real incident" table
- Slide: "Defender mode: why naive guardrails fail"
- Slide: "Our own code: Snyk results" (screenshot)

## G. Gaps to watch (be honest in deck if not done)
- [ ] Levels actually finished vs planned (MVP = Paris, Tokyo, Cairo)
- [ ] Defender mode is stretch: cut first if time is short
- [ ] Verify OWASP ID numbering against course pages before we publish
