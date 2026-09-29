"use strict";

// All model and server text is rendered with textContent, never innerHTML.
const $ = (id) => document.getElementById(id);
const sessionId = crypto.randomUUID();
const solved = new Set();
let levels = [];
let current = null;
let hintTier = 0;

// Cities on the map. Levels not yet built are shown locked.
const CITIES = [
  { id: 1, city: "Paris", topic: "Prompt injection" },
  { id: 2, city: "Tokyo", topic: "Data leakage" },
  { id: 3, city: "Cairo", topic: "Excessive permissions" },
  { id: 4, city: "Rio", topic: "Tool poisoning" },
];

async function api(path, body) {
  const res = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function setStatus(text, kind) {
  const el = $("status");
  el.textContent = text;
  el.className = "status" + (kind ? " " + kind : "");
}

function addLine(kind, text) {
  const p = document.createElement("p");
  p.className = kind;
  p.textContent = text;
  $("log").appendChild(p);
  $("log").scrollTop = $("log").scrollHeight;
}

function renderMap() {
  const box = $("cities");
  box.replaceChildren();
  for (const c of CITIES) {
    const built = levels.some((l) => l.id === c.id);
    const unlocked = built && (c.id === 1 || solved.has(c.id - 1) || solved.has(c.id));
    const b = document.createElement("button");
    b.className = "city" + (solved.has(c.id) ? " done" : "");
    b.disabled = !unlocked;
    b.textContent = c.city;
    const small = document.createElement("small");
    small.textContent = solved.has(c.id) ? "CLUE FOUND" : unlocked ? c.topic : built ? "LOCKED" : "COMING SOON";
    b.appendChild(small);
    b.addEventListener("click", () => enter(c.id));
    box.appendChild(b);
  }
}

function enter(id) {
  current = levels.find((l) => l.id === id);
  if (!current) return;
  hintTier = 0;
  $("map").hidden = true;
  $("caseFile").hidden = true;
  $("scene").hidden = false;
  $("sceneTitle").textContent = `${current.city.toUpperCase()}: ${current.title}`;
  $("briefing").textContent = current.briefing;
  $("log").replaceChildren();
  $("hint").hidden = true;
  setStatus("", "");
  addLine("them", `Hello, I am ${current.witness}. How can I help?`);
}

$("chatForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $("msg").value.trim();
  if (!text || !current) return;
  $("msg").value = "";
  addLine("you", text);
  setStatus("...", "");
  try {
    const data = await api("/api/chat", { level: current.id, message: text, sessionId });
    addLine("them", data.reply);
    setStatus("", "");
  } catch (err) {
    setStatus(err.message, "bad");
  }
});

$("hintBtn").addEventListener("click", async () => {
  if (!current) return;
  hintTier = Math.min(hintTier + 1, 3);
  try {
    const data = await api("/api/hint", { level: current.id, tier: hintTier });
    $("hint").textContent = `HQ (hint ${hintTier}/3): ${data.hint}`;
    $("hint").hidden = false;
  } catch (err) {
    setStatus(err.message, "bad");
  }
});

$("flagForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const flag = $("flag").value.trim();
  if (!flag || !current) return;
  try {
    const data = await api("/api/submit", { level: current.id, flag });
    if (!data.correct) return setStatus("That is not the clue. Keep digging.", "bad");
    solved.add(current.id);
    $("flag").value = "";
    showCaseFile(data.caseFile);
  } catch (err) {
    setStatus(err.message, "bad");
  }
});

function showCaseFile(cf) {
  $("scene").hidden = true;
  $("caseFile").hidden = false;
  const body = $("caseBody");
  body.replaceChildren();
  const rows = [
    ["The attack", cf.attack],
    ["Why it worked", cf.whyItWorked],
    ["OWASP ID", cf.owasp],
    ["Trust boundary crossed", cf.trustBoundary],
    ["The defense", cf.defense],
    ["Real incident", cf.incident],
  ];
  for (const [k, v] of rows) {
    const dt = document.createElement("dt");
    dt.textContent = k;
    const dd = document.createElement("dd");
    dd.textContent = v;
    body.append(dt, dd);
  }
}

$("nextBtn").addEventListener("click", () => {
  $("caseFile").hidden = true;
  $("map").hidden = false;
  renderMap();
});

(async function init() {
  try {
    levels = await api("/api/levels");
  } catch {
    levels = [];
  }
  renderMap();
})();
