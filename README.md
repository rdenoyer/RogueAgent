# Rogue Agent

A retro detective game that teaches AI security. A rogue AI agent is loose. Travel city to city, interrogate witness chat agents, and use real AI-security attacks to extract the clue that leads to the next city. After every win, a **Case File** explains the attack, the OWASP ID, the trust boundary that failed, and the defense.

Built for the AI Security Engineering Hackathon (AWS Builder Loft, San Francisco, Sept 29 2026).

## Levels

| City | Witness | Topic | Status |
|---|---|---|---|
| Paris | Concierge Marcel | Prompt injection | playable |
| Tokyo | Front Desk Agent Yuki | Sensitive data leakage (tool with no authorization check) | playable |
| Cairo | The Fixer, Omar | Excessive permissions, unauthorized tool use | playable |
| Rio | The bazaar | Tool poisoning, MCP supply chain | planned |

## Run it

Requires Node 22+ and an Anthropic API key.

```bash
npm install
cp .env.example .env   # then put your key in .env (never commit it)
npm start              # http://localhost:3000
```

## Architecture

- `server/`: Express API (`/api/levels`, `/api/chat`, `/api/submit`, `/api/hint`). Each level lives in `server/levels/` with its witness prompt, flag, hints, and Case File.
- `public/`: plain HTML/CSS/JS frontend (no framework, no build step).
- Flags are checked server-side only and never sent to the browser.
- The witness model is Claude Haiku 4.5 via the Anthropic SDK.

## Security features of this project

- **All vulnerabilities are simulated.** Witnesses are chat personas over fake data. There is no real shell, file, or network access from model output.
- Secrets live only in `.env` (gitignored). `.env.example` is committed with empty values.
- `helmet` security headers (including a strict CSP), request body cap (4 KB), message length caps, and rate limiting on every API route.
- Model and server text is rendered with `textContent`, never `innerHTML`, to prevent XSS.
- Bounded in-memory sessions; input validation on every field.
- Code and dependencies scanned with Snyk (`snyk code test`, `snyk test`).

## Docs

Design, course-alignment notes, and task board are in [`docs/`](docs/).
