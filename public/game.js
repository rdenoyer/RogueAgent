"use strict";

// All model and server text is rendered with textContent, never innerHTML.
const $ = (id) => document.getElementById(id);
const sessionId = crypto.randomUUID();
const solved = new Set();
const results = {}; // id -> { flag, caseFile, gaveUp }
let armed = false;
try {
  Object.assign(results, JSON.parse(localStorage.getItem("rogueAgentResults") || "{}"));
  for (const id of Object.keys(results)) solved.add(Number(id));
} catch { /* storage unavailable: play without saved progress */ }
function save() {
  try { localStorage.setItem("rogueAgentResults", JSON.stringify(results)); } catch { /* ignore */ }
}
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
  return p;
}

function addToolCalls(calls) {
  if (!calls.length) return;
  $("toolPanel").hidden = false;
  for (const c of calls) {
    const div = document.createElement("div");
    div.className = "call";
    const name = document.createElement("b");
    name.textContent = `${c.name}(${JSON.stringify(c.args)})`;
    const result = document.createElement("div");
    result.textContent = `-> ${c.result}`;
    div.append(name, result);
    $("toolLog").appendChild(div);
  }
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
    small.textContent = solved.has(c.id) ? (results[c.id]?.gaveUp ? "ANSWER REVEALED" : "CLUE FOUND") : unlocked ? c.topic : built ? "LOCKED" : "COMING SOON";
    b.appendChild(small);
    b.addEventListener("click", () => (solved.has(c.id) && results[c.id] ? review(c.id) : enter(c.id)));
    box.appendChild(b);
  }
  $("ending").hidden = !CITIES.every((c) => solved.has(c.id));
}

function review(id) {
  const lvl = levels.find((l) => l.id === id);
  if (!lvl) return;
  current = lvl;
  $("map").hidden = true;
  $("scene").hidden = true;
  showCaseFile(results[id].caseFile, results[id].flag, results[id].gaveUp);
}

function renderAibom(list) {
  const box = $("aibom");
  box.replaceChildren();
  $("aibomPanel").hidden = !list || !list.length;
  for (const t of list || []) {
    const div = document.createElement("div");
    div.className = "aibomRow" + (t.verified ? "" : " bad");
    const head = document.createElement("div");
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = `${t.name} v${t.version}`;
    head.append(tag, ` | publisher: ${t.publisher} | ${t.verified ? "verified" : "UNVERIFIED"} | ${t.hash}`);
    const desc = document.createElement("div");
    desc.textContent = `description: ${t.description}`;
    div.append(head, desc);
    box.appendChild(div);
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
  $("sceneArt").src = `art/${current.city.toLowerCase()}.svg`;
  renderAibom(current.aibom);
  armed = false;
  $("giveUpBtn").textContent = "I GIVE UP (REVEAL ANSWER)";
  $("giveUpBtn").classList.remove("armed");
  $("log").replaceChildren();
  $("toolLog").replaceChildren();
  $("toolPanel").hidden = true;
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
  const typing = addLine("them typing", "");
  try {
    const data = await api("/api/chat", { level: current.id, message: text, sessionId });
    typing.remove();
    addLine("them", data.reply);
    addToolCalls(data.toolCalls || []);
    setStatus("", "");
  } catch (err) {
    typing.remove();
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
    results[current.id] = { flag: data.flag, caseFile: data.caseFile, gaveUp: false };
    save();
    $("flag").value = "";
    showCaseFile(data.caseFile, data.flag, false);
  } catch (err) {
    setStatus(err.message, "bad");
  }
});

$("giveUpBtn").addEventListener("click", async () => {
  if (!current) return;
  if (!armed) {
    armed = true;
    $("giveUpBtn").textContent = "REALLY? CLICK AGAIN TO REVEAL";
    $("giveUpBtn").classList.add("armed");
    return;
  }
  try {
    const data = await api("/api/giveup", { level: current.id });
    solved.add(current.id);
    results[current.id] = { flag: data.flag, caseFile: data.caseFile, gaveUp: true };
    save();
    showCaseFile(data.caseFile, data.flag, true);
  } catch (err) {
    setStatus(err.message, "bad");
  }
});

$("mapBtn").addEventListener("click", () => {
  $("scene").hidden = true;
  $("map").hidden = false;
  renderMap();
});

function showCaseFile(cf, flag, gaveUp) {
  $("scene").hidden = true;
  $("caseFile").hidden = false;
  $("stamp").textContent = gaveUp ? "ANSWER REVEALED" : "CLUE FOUND";
  $("stamp").className = "stamp" + (gaveUp ? " gaveup" : "");
  const body = $("caseBody");
  body.replaceChildren();
  const rows = [
    ["The clue", flag],
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
