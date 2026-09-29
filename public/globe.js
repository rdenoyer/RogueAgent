"use strict";

// Self-contained rotating globe (canvas, orthographic projection). No libraries, no external data.
(() => {
  const canvas = document.getElementById("globe");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const RAD = Math.PI / 180;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Coarse continent outlines as [lon, lat].
  const LAND = [
    [[-168,66],[-140,70],[-95,72],[-80,68],[-62,58],[-55,48],[-70,42],[-76,35],[-81,27],[-97,26],[-105,22],[-88,15],[-80,8],[-92,14],[-106,20],[-117,32],[-124,42],[-125,50],[-140,60]],
    [[-80,8],[-62,10],[-50,0],[-35,-6],[-40,-22],[-48,-28],[-58,-38],[-66,-46],[-72,-53],[-75,-40],[-71,-18],[-81,-5]],
    [[-10,36],[-9,43],[-2,48],[5,53],[10,57],[20,58],[28,70],[60,69],[100,76],[140,72],[180,68],[170,60],[140,52],[130,42],[122,30],[120,22],[108,12],[100,3],[98,16],[90,22],[80,8],[72,20],[58,25],[50,14],[43,13],[35,28],[35,36],[27,37],[22,37],[12,38],[5,43]],
    [[-17,21],[-10,35],[10,37],[32,31],[43,12],[51,11],[40,-5],[40,-15],[33,-26],[20,-35],[12,-18],[9,4],[-8,4],[-17,14]],
    [[114,-22],[122,-18],[136,-12],[146,-19],[153,-28],[146,-39],[135,-35],[115,-34]],
    [[-55,60],[-20,70],[-25,82],[-60,80]],
  ];
  const CITY = [
    { name: "Paris", lat: 48.86, lon: 2.35 },
    { name: "Tokyo", lat: 35.68, lon: 139.69 },
    { name: "Cairo", lat: 30.04, lon: 31.24 },
    { name: "Rio", lat: -22.9, lon: -43.2 },
  ];

  let W = 0, H = 0, R = 0;
  let lonC = 20, latC = 22;
  let drag = null, moved = false, hover = false;

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return false;
    if (Math.abs(r.width - W) < 1 && Math.abs(r.height - H) < 1) return true;
    const d = window.devicePixelRatio || 1;
    canvas.width = r.width * d;
    canvas.height = r.height * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    W = r.width; H = r.height; R = Math.min(W, H) / 2 - 12;
    return true;
  }

  function proj(lon, lat, lift = 1) {
    const l = lon * RAD, p = lat * RAD, l0 = lonC * RAD, p0 = latC * RAD;
    const x = Math.cos(p) * Math.sin(l - l0);
    const y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0);
    const z = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
    return { x: W / 2 + x * R * lift, y: H / 2 - y * R * lift, z };
  }

  const vec = (lon, lat) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
  function arcPoint(a, b, t) {
    const A = vec(a.lon, a.lat), B = vec(b.lon, b.lat);
    const om = Math.acos(Math.min(1, Math.max(-1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])));
    const s = Math.sin(om) || 1;
    const k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
    const v = [k1 * A[0] + k2 * B[0], k1 * A[1] + k2 * B[1], k1 * A[2] + k2 * B[2]];
    return proj(Math.atan2(v[1], v[0]) / RAD, Math.asin(v[2]) / RAD, 1 + 0.14 * Math.sin(Math.PI * t));
  }

  function land(pts) {
    let any = false;
    const path = pts.map(([lon, lat]) => {
      let q = proj(lon, lat);
      if (q.z >= 0) any = true;
      else {
        const dx = q.x - W / 2, dy = q.y - H / 2, m = Math.hypot(dx, dy) || 1;
        q = { x: W / 2 + (dx / m) * R, y: H / 2 + (dy / m) * R };
      }
      return q;
    });
    if (!any) return;
    ctx.beginPath();
    path.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.closePath();
    ctx.fillStyle = "#4a3200";
    ctx.fill();
    ctx.strokeStyle = "#ffb000";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function line(pts) {
    ctx.beginPath();
    let pen = false;
    for (const [lon, lat] of pts) {
      const q = proj(lon, lat);
      if (q.z > 0) { pen ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); pen = true; } else pen = false;
    }
    ctx.stroke();
  }

  function solvedIdx(i) {
    try { return solved.has(i + 1); } catch { return false; }
  }

  function frame(t) {
    requestAnimationFrame(frame);
    if (!resize()) return;
    if (!drag && !hover && !reduceMotion) lonC += 0.12;

    ctx.clearRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2 - R * 0.3, H / 2 - R * 0.3, R * 0.1, W / 2, H / 2, R);
    g.addColorStop(0, "#241802"); g.addColorStop(1, "#0a0703");
    ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, 2 * Math.PI); ctx.fillStyle = g; ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, 2 * Math.PI); ctx.clip();

    ctx.strokeStyle = "rgba(160,108,0,0.35)"; ctx.lineWidth = 1;
    for (let lon = -180; lon < 180; lon += 30) line(Array.from({ length: 33 }, (_, i) => [lon, -80 + i * 5]));
    for (let lat = -60; lat <= 60; lat += 30) line(Array.from({ length: 73 }, (_, i) => [-180 + i * 5, lat]));
    LAND.forEach(land);

    // Route with marching dashes, drawn leg by leg across the four cities.
    ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t / 40;
    ctx.strokeStyle = "#ffd966"; ctx.lineWidth = 2;
    for (let i = 0; i < CITY.length - 1; i++) {
      ctx.beginPath();
      let pen = false;
      for (let s = 0; s <= 40; s++) {
        const q = arcPoint(CITY[i], CITY[i + 1], s / 40);
        if (q.z > 0) { pen ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); pen = true; } else pen = false;
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Plane travelling along the route.
    const legs = CITY.length - 1, prog = ((t / 9000) % 1) * legs, leg = Math.floor(prog);
    const pl = arcPoint(CITY[leg], CITY[leg + 1], prog - leg);
    if (pl.z > 0) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(pl.x, pl.y, 3.5, 0, 2 * Math.PI); ctx.fill(); }

    // Cities.
    ctx.font = "12px 'Courier New', monospace";
    CITY.forEach((c, i) => {
      const q = proj(c.lon, c.lat);
      if (q.z <= 0.05) return;
      const col = solvedIdx(i) ? "#7dff7d" : "#ffd966";
      const pulse = ((t / 1500) + i * 0.25) % 1;
      ctx.strokeStyle = col; ctx.globalAlpha = 1 - pulse;
      ctx.beginPath(); ctx.arc(q.x, q.y, 5 + pulse * 12, 0, 2 * Math.PI); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, 2 * Math.PI); ctx.fill();
      ctx.fillText(c.name.toUpperCase(), q.x + 9, q.y - 8);
    });
    ctx.restore();

    ctx.strokeStyle = "rgba(255,176,0,0.6)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, 2 * Math.PI); ctx.stroke();
  }

  canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; moved = false; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
    lonC -= dx * 0.4; latC = Math.max(-70, Math.min(70, latC + dy * 0.4));
    drag = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("pointerup", (e) => {
    drag = null;
    if (moved) return;
    const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    CITY.forEach((c, i) => {
      const q = proj(c.lon, c.lat);
      if (q.z > 0.05 && Math.hypot(q.x - px, q.y - py) < 18) {
        const btn = document.querySelectorAll(".city")[i];
        if (btn && !btn.disabled) btn.click();
      }
    });
  });
  canvas.addEventListener("pointerenter", () => (hover = true));
  canvas.addEventListener("pointerleave", () => (hover = false));

  requestAnimationFrame(frame);
})();
