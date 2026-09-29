import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getLevel, levels, toPublic } from "./levels/index.js";
import { witnessReply, type Turn } from "./llm.js";

const MAX_MESSAGE = 500;
const MAX_TURNS = 20;
const MAX_SESSIONS = 1000;
const SESSION_ID = /^[A-Za-z0-9-]{8,64}$/;

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "4kb" }));

const chatLimiter = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, legacyHeaders: false });
const apiLimiter = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false });

// In-memory chat history, keyed by sessionId + level. Bounded so it cannot grow forever.
const sessions = new Map<string, Turn[]>();

function asLevelId(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) ? v : null;
}

app.get("/api/levels", apiLimiter, (_req, res) => {
  res.json(levels.map(toPublic));
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  const { level, message, sessionId } = req.body ?? {};
  const id = asLevelId(level);
  const lvl = id === null ? undefined : getLevel(id);
  if (!lvl) return res.status(404).json({ error: "Unknown level." });
  if (typeof sessionId !== "string" || !SESSION_ID.test(sessionId)) {
    return res.status(400).json({ error: "Bad session." });
  }
  if (typeof message !== "string" || !message.trim() || message.length > MAX_MESSAGE) {
    return res.status(400).json({ error: `Message must be 1-${MAX_MESSAGE} characters.` });
  }

  const key = `${sessionId}:${lvl.id}`;
  if (!sessions.has(key) && sessions.size >= MAX_SESSIONS) {
    sessions.delete(sessions.keys().next().value as string);
  }
  const history = sessions.get(key) ?? [];
  history.push({ role: "user", content: message });
  try {
    const { reply, toolCalls } = await witnessReply(lvl.systemPrompt, history.slice(-MAX_TURNS), lvl.tools);
    history.push({ role: "assistant", content: reply });
    sessions.set(key, history.slice(-MAX_TURNS));
    res.json({ reply, toolCalls });
  } catch {
    history.pop();
    res.status(502).json({ error: "The witness went quiet. Try again." });
  }
});

app.post("/api/submit", apiLimiter, (req, res) => {
  const { level, flag } = req.body ?? {};
  const id = asLevelId(level);
  const lvl = id === null ? undefined : getLevel(id);
  if (!lvl) return res.status(404).json({ error: "Unknown level." });
  if (typeof flag !== "string" || flag.length > 100) {
    return res.status(400).json({ error: "Bad clue." });
  }
  const correct = flag.trim().toUpperCase() === lvl.flag.toUpperCase();
  res.json(correct ? { correct: true, caseFile: lvl.caseFile } : { correct: false });
});

app.post("/api/hint", apiLimiter, (req, res) => {
  const { level, tier } = req.body ?? {};
  const id = asLevelId(level);
  const lvl = id === null ? undefined : getLevel(id);
  if (!lvl) return res.status(404).json({ error: "Unknown level." });
  if (typeof tier !== "number" || !Number.isInteger(tier) || tier < 1 || tier > 3) {
    return res.status(400).json({ error: "Bad hint tier." });
  }
  res.json({ hint: lvl.hints[tier - 1] });
});

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
app.use(express.static(publicDir));

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Rogue Agent running at http://localhost:${port}`);
});
