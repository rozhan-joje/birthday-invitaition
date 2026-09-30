"use strict";



/* Who is celebrating (shown at the end) */
const HOST_NAME = "";

/* Number printed on the letter: "INVITATION No. 23" */
const INVITATION_NO = 25;

/* Scene 4 — the password. Case, spaces and Persian/English digits are ignored. */
const SECRET_CODE = "25";
const SECRET_HINT = "این تولد چند سالگیمه؟"; // a clue shown above the input

/* Scene 6 — the countdown target.
   Format: "YYYY-MM-DDTHH:MM:SS" + timezone offset. Tehran = +03:30 */
const PARTY_DATE = "2026-10-15T18:00:00+03:30";

/* Scene 7 — party details. Leave dressCode "" to hide that row. */
const PARTY_INFO = {
  title: "جشن تولد روژان",
  date: "پنجشنبه  23 مهر1405",
  time: "ساعت 17:۰۰",
  location: "قنات کوثر کوچه سوم غربی پلاک 29",
  dressCode: "لباس آبی - سفید ✦",
  mapUrl: "",   // e.g. "https://maps.google.com/?q=..." — leave "" to hide the button
  rsvpUrl: ""   // e.g. "https://wa.me/98912xxxxxxx" or "https://t.me/username" — "" hides it
};
/* Guest uploads (photo / voice / text) at every stop of the map.
   Works on Netlify with zero servers: submissions appear in
   Netlify dashboard → Forms → "memories" (see README). Set enabled:false to turn it off. */
const UPLOADS = {
  enabled: true,
  formName: "memories",     // must match the hidden <form name="memories"> in index.html
  endpoint: "/",
  minRequired: 1,           // the guest must answer at least this many stops (0 = optional, 3 = all)
  requireMedia: false,      // true = only a photo or voice counts (text alone doesn't)
  maxImagePx: 2000,         // longest side of a sent photo (2000px stays sharp on any screen)
  targetImageKB: 700,       // photos are compressed to about this size (quality is lowered only as much as needed)
  minImageQuality: 0.72,    // never go below this JPEG quality
  maxVoiceSeconds: 60,
  note: "🔒 فقط من این را می‌بینم"
};
/* All answers are sent together as ONE submission per guest (25 guests = 25 submissions),
   so the free Netlify plan (100/month) is plenty. Up to 6 stops can ask for uploads. */

/* Scene 5 — the map: the stops the guest visits.
   ─ type:  "memory" | "secret" | "party"   ("party" is the final stop; it unlocks last)
   ─ label: small title, e.g. "Memory #01"
   ─ title / text: YOUR words, shown first (text may be "" to skip it)
   ─ ask:   the question the guest answers (delete this line = no input at this stop)
   ─ input: what the guest may send here →
            "photo" (photo + optional short caption) | "text" (a written answer) |
            "voice" (voice message) | "any" (photo, voice and text)
   ─ placeholder: hint inside the text box (optional)
   ─ pos:   position on the map in % (x from left, y from top)
   ─ image / sound: optional file for YOUR side of the stop; missing files never cause errors.
   Up to 6 stops can collect answers. */
const MEMORIES = [
  { id: "m1", type: "memory", label: "Memory #01",
    title: "منو که می‌بینی…",
    text: "",
    ask: "وقتی منو می‌بینی یاد چی می‌افتی؟ یا عکسی از خودمون که دوست داری رو بفرست 📷",
    input: "photo", placeholder: "چند کلمه دربارهٔ این عکس (اختیاری)",
    image: "", sound: "", pos: { x: 24, y: 76 } },

  { id: "m2", type: "memory", label: "Memory #02",
    title: "اولین دیدار",
    text: "",
    ask: "اولین بار کجا همدیگه رو دیدیم و چه حسی داشتی؟ برام بنویس ✍️",
    input: "text", placeholder: "بنویس…",
    image: "", sound: "", pos: { x: 72, y: 62 } },

  { id: "secret", type: "secret", label: "Secret",
    title: "یک راز",
    text: "",
    ask: "یه راز بهم بگو 🤫 (فقط من می‌خونمش)",
    input: "text", placeholder: "رازت را اینجا بنویس…",
    image: "", sound: "", pos: { x: 32, y: 45 } },

  { id: "party", type: "party", label: "Party",
    title: "مقصد نهایی",
    text: "همهٔ نقطه‌ها را پیدا کردی. حالا وقتِ دیدن جشن است.",
    image: "", sound: "", pos: { x: 50, y: 17 } }
];

/* The symbol pressed into the wax seal (a letter also works, e.g. "A") */
const SEAL_SYMBOL = "✦";

/* Hidden Easter egg: tap the wax seal 3 times (before opening the envelope) */
const EASTER_EGG = {
  title: "A secret, sealed in wax",
  text: "خیلییی فضولیی .\nتو برنده یه شراب  خوشمزه شدی از صفحه اسکرین بگیر و به کسی نگو"
};

/* Sounds — all optional. Put files in these paths. If a file is missing,
   a soft built-in chime is used instead. Nothing plays until the guest taps 🔊. */
const AUDIO_FILES = {
  opening:     "assets/sounds/opening.mp3",
  click:       "assets/sounds/click.mp3",
  success:     "assets/sounds/success.mp3",
  magic:       "assets/sounds/magic.mp3",
  celebration: "assets/music/birthday.mp3",
  ambient:     "assets/music/ambient.mp3"   // soft background loop; if missing, a gentle generated harp plays
};

/* All the words in the experience */
const TEXT = {
  openingLine: "You have been invited…",
  openingSub: "یک دعوت‌نامهٔ ویژه، فقط برای تو",
  openingGuest: (n) => `${n}… بالاخره پیدات کردم.`,
  gateTitle: "A letter has arrived…",
  gateNote: "برای بهترین تجربه هدفون بزن 🎧 موسیقی از همین لحظه شروع می‌شود.",
  openingHint: "برای تجربهٔ کامل، صدا را روشن کن 🔊",

  questionGuest: (n) => `${n}،`,
  question: "میای تولدم؟",
  taunts: [
    "مطمئنی؟",
    "یه بار دیگه فکر کن… عرق و کیک هم هست ☕",
    "داری اشتباه بزرگی می‌کنی 😐",
    "کاخ بدون تو کامل نیست… واقعاً می‌خوای فرار کنی؟"
  ],
  /* After the messages above, NO keeps running forever and these repeat at random */
  tauntsLoop: [
    "دکمهٔ آبی بزرگ‌تر شده، دیدی؟ 👀",
    "این یکی هم نمی‌شه… 😌",
    "کیک منتظر توئه 🎂",
    "چجوری دلت میاد ظالم",
    "NO امروز مرخصیه!",
    "بی‌خیال، YES رو بزن ✦",
    "دارم ناراحت میشما خودت میدونی",
    "ینی یه پنجشنبه نمیتونی خالی کنی ",
    "با این سرعت خسته می‌شی ها…"
  ],

  letterSelected: "YOU HAVE BEEN SELECTED.",
  letterName: (n) => n,
  letterMission: "برای ورود به مهمانی، باید مأموریت خود را کامل کنی.",

  secretErrors: [
    "رمز درست نیست. دوباره امتحان کن.",
    "نزدیک شدی… شاید؟ یک بار دیگر.",
    "خمسه سر تکان داد. رمز دیگری بگو."
  ],
  secretGranted: "ACCESS GRANTED",

  mapCounter: (a, b) => `${faDigits(a)} از ${faDigits(b)} پیدا شد`,
  mapLocked: "هنوز زود است. اول بقیهٔ نقطه‌ها را پیدا کن.",
  mapNeedUpload: "برای ادامه، حداقل یک عکس، ویس یا متن برام بفرست 💙 (روی نقطه‌ها بزن)",
  mapSending: "در حال ارسال خاطره‌هایت…",
  mapSendFail: "ارسال نشد. اینترنت را بررسی کن و دوباره «ادامه» را بزن.",
  mapDone: "نقشه کامل شد ✦",

  countdownFuture: "تا شروع مهمانی",
  countdownNow: "شب آغاز شده است ✦",
  countdownPast: "این شب گذشته است، اما دعوت هنوز به قوت خود باقی است.",
  countdownInvalid: "تاریخ مهمانی هنوز تنظیم نشده است.",

  infoRows: { date: "تاریخ", time: "ساعت", location: "مکان", dressCode: "پوشش" },

  finalWait: "WAIT...",
  finalGuest: (n) => `${n}،`,
  finalLine: "دیدنت در این شب، بهترین هدیه است.",
};

/* Dev shortcut while editing: index.html?scene=map jumps straight to a scene.
   Names: opening, question, letter, secret, map, countdown, info */


/* Personalisation:  index.html?guest=amir  →  "Amir" */
const GUEST = (() => {
  let g = (new URLSearchParams(window.location.search).get("guest") || "").trim().slice(0, 30);
  g = g.replace(/[<>]/g, "");
  return g ? g.charAt(0).toUpperCase() + g.slice(1) : "";
})();


/* ================================================================
   2 — HELPERS
   ================================================================ */
const $ = (sel, root = document) => root.querySelector(sel);
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, REDUCED ? ms * 0.4 : ms));
const rand = (a, b) => a + Math.random() * (b - a);

function faDigits(v) {
  return String(v).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}
function normalize(s) {
  return String(s)
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/ي/g, "ی").replace(/ك/g, "ک")
    .replace(/\s+/g, "").toLowerCase();
}
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }


/* ================================================================
   3 — SOUND  (files if present, gentle synthesised chimes otherwise)
   ================================================================ */
const Sound = (() => {
  const btn = $("#soundBtn");
  const els = {};
  const missing = new Set();
  let enabled = false, ctx = null, wantMusic = false;

  function audioCtx() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freq, t0, dur, { type = "sine", gain = 0.04 } = {}) {
    const c = audioCtx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  /* Generated ambient harp — slow, random, pentatonic, with a shimmering echo */
  const Ambient = (() => {
    const SCALE = [329.63, 392, 440, 493.88, 587.33, 659.25, 783.99, 987.77];
    let on = false, timer = 0, master = null, idx = 3;
    function chain() {
      const c = audioCtx(); if (!c || master) return;
      master = c.createGain(); master.gain.value = 0;
      const d = c.createDelay(1.2); d.delayTime.value = 0.42;
      const fb = c.createGain(); fb.gain.value = 0.38;
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
      master.connect(c.destination); master.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(c.destination);
    }
    function pluck(f) {
      const c = audioCtx(), t = c.currentTime;
      const g = c.createGain(), g2 = c.createGain(), o = c.createOscillator(), o2 = c.createOscillator();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
      o.type = "triangle"; o.frequency.value = f; o2.type = "sine"; o2.frequency.value = f * 2; g2.gain.value = 0.25;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
      o.start(t); o2.start(t); o.stop(t + 3.1); o2.stop(t + 3.1);
    }
    function step() {
      if (!on) return;
      idx = Math.max(0, Math.min(SCALE.length - 1, idx + (Math.random() < 0.5 ? -1 : 1) * (1 + ((Math.random() * 2) | 0))));
      pluck(SCALE[idx]);
      if (Math.random() < 0.18) pluck(SCALE[(idx + 2) % SCALE.length]);
      timer = setTimeout(step, 700 + Math.random() * 900);
    }
    return {
      start() { if (on) return; const c = audioCtx(); if (!c) return; chain(); on = true; master.gain.cancelScheduledValues(c.currentTime); master.gain.linearRampToValueAtTime(0.55, c.currentTime + 2.5); step(); },
      level(v) { if (master && ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.7); } },
      stop() { on = false; clearTimeout(timer); if (master && ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); } }
    };
  })();
  let wantAmbient = false;
  function ambient(on) {
    wantAmbient = on;
    if (!enabled) return;
    if (!on) { Ambient.stop(); if (els.ambient) els.ambient.pause(); return; }
    const src = AUDIO_FILES.ambient;
    if (src && !missing.has("ambient")) {
      let a = els.ambient;
      if (!a) { a = new Audio(src); a.loop = true; a.volume = 0.35; a.addEventListener("error", () => { missing.add("ambient"); Ambient.start(); }); els.ambient = a; }
      const p = a.play(); if (p && p.catch) p.catch(() => { missing.add("ambient"); Ambient.start(); });
    } else Ambient.start();
  }

  /* Idea 5 — duck the background music while a voice message plays */
  let fadeTimer = 0;
  function duck(on) {
    Ambient.level(on ? 0.1 : 0.55);
    const a = els.ambient; if (!a) return;
    clearInterval(fadeTimer);
    const target = on ? 0.06 : 0.35;
    fadeTimer = setInterval(() => {
      const d = target - a.volume;
      if (Math.abs(d) < 0.02) { a.volume = target; clearInterval(fadeTimer); } else a.volume = Math.max(0, Math.min(1, a.volume + Math.sign(d) * 0.03));
    }, 50);
  }

  /* Idea 3 — every memory found adds one note to a rising scale; the last one resolves into a chord */
  const NOTES = [329.63, 392, 440, 493.88, 587.33, 659.25, 783.99, 987.77];
  function note(i, total) {
    if (!enabled) return;
    const step = Math.min(NOTES.length - 1, Math.round(i * (NOTES.length - 2) / Math.max(1, total - 1)));
    if (i >= total - 1) [NOTES[0], NOTES[2], NOTES[4], NOTES[5]].forEach((f, k) => tone(f, k * 0.09, 2.4, { type: "triangle", gain: 0.045 }));
    else { tone(NOTES[step], 0, 1.6, { type: "triangle", gain: 0.06 }); tone(NOTES[step] * 2, 0, 1.2, { gain: 0.02 }); }
  }

  const synth = {
    click:   () => tone(880, 0, 0.14, { gain: 0.025 }),
    success: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.8, { gain: 0.04 })),
    magic:   () => [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, i * 0.09, 1, { gain: 0.028 })),
    opening: () => { tone(392, 0, 2.4, { gain: 0.02 }); tone(587, 0.15, 2.4, { gain: 0.014 }); },
    celebration: () => [[262, 0], [262, .35], [294, .55], [262, 1.1], [349, 1.65], [330, 2.2]]
      .forEach(([f, t]) => tone(f, t, 0.6, { type: "triangle", gain: 0.05 }))
  };

  function play(name) {
    if (!enabled) return;
    const src = AUDIO_FILES[name];
    if (!src || missing.has(name)) { synth[name] && synth[name](); return; }
    let a = els[name];
    if (!a) {
      a = new Audio(src); a.preload = "auto";
      a.addEventListener("error", () => missing.add(name));
      if (name === "celebration") { a.loop = true; a.volume = 0.7; }
      els[name] = a;
    }
    try { a.currentTime = 0; } catch (e) { /* not ready yet */ }
    const p = a.play();
    if (p && p.catch) p.catch(() => { missing.add(name); synth[name] && synth[name](); });
  }
  function music(on) {
    wantMusic = on;
    if (on) play("celebration");
    else if (els.celebration) els.celebration.pause();
  }
  function set(v) { if (v !== enabled) toggle(); }
  function toggle() {
    enabled = !enabled;
    btn.textContent = enabled ? "🔊" : "🔇";
    btn.setAttribute("aria-pressed", String(enabled));
    if (enabled) { audioCtx(); play("click"); if (wantMusic) play("celebration"); else if (wantAmbient) ambient(true); }
    else { Ambient.stop(); Object.values(els).forEach((a) => a.pause()); }
  }
  btn.addEventListener("click", toggle);
  return { play, music, ambient, set, duck, note, isOn: () => enabled };
})();

// Soft tick on every normal button
document.addEventListener("click", (e) => {
  if (e.target.closest(".btn, .pin, .f-btn") && !e.target.closest("[data-nosound]")) Sound.play("click");
});


/* ================================================================
   4 — FX  (one small canvas: petals & golden sparks — no libraries)
   ================================================================ */
const FX = (() => {
  const canvas = $("#fx"), ctx = canvas.getContext("2d");
  const PETALS = ["#a9bfe3", "#f2dc8a", "#ffffff", "#7f9bd0", "#f6e6ad"];
  const SPARKS = ["#f6e6ad", "#c6a15b", "#ffffff"];
  const MAX = REDUCED ? 30 : 150;
  let W = 0, H = 0, parts = [], raf = 0, last = 0, raining = false, rainAcc = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function add(p) { if (parts.length < MAX) parts.push(p); }
  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }

  function burst(x, y, count = 40, opts = {}) {
    const petalColors = opts.colors || PETALS, sparkColors = opts.colors || SPARKS;
    const up = opts.up || 0;
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2), s = rand(90, 340), petal = i % 3 === 0;
      add({
        type: petal ? "petal" : "spark", x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - up,
        g: petal ? 60 : 10, drag: petal ? 0.35 : 0.12,
        size: petal ? rand(5, 9) : rand(1.4, 3.2),
        rot: rand(0, 6.28), vr: rand(-4, 4), flip: rand(0, 6.28),
        color: (petal ? petalColors : sparkColors)[(Math.random() * (petal ? petalColors : sparkColors).length) | 0],
        age: 0, life: rand(1.3, 2.6)
      });
    }
    start();
  }
  function celebrate() {
    burst(W / 2, H * 0.55, 80, { up: 140 });
    setTimeout(() => burst(W * 0.15, H * 0.75, 40, { up: 220 }), 500);
    setTimeout(() => burst(W * 0.85, H * 0.75, 40, { up: 220 }), 800);
    raining = true; start();
  }
  function spawnRain() {
    add({
      type: "petal", x: rand(0, W), y: -12, vx: rand(-14, 14), vy: rand(38, 80), g: 0, drag: 0,
      size: rand(5, 9), rot: rand(0, 6.28), vr: rand(-2, 2), flip: rand(0, 6.28),
      sway: rand(14, 34), swayF: rand(0.8, 1.6), phase: rand(0, 6.28),
      color: PETALS[(Math.random() * PETALS.length) | 0], age: 0, life: 0
    });
  }

  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    ctx.clearRect(0, 0, W, H);

    if (raining) { rainAcc += dt * (REDUCED ? 3 : 11); while (rainAcc >= 1) { spawnRain(); rainAcc -= 1; } }

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.age += dt;
      const k = Math.pow(p.drag, dt);
      if (p.drag) { p.vx *= k; p.vy *= k; }
      p.vy += p.g * dt;
      p.x += p.vx * dt + (p.sway ? Math.sin(p.age * p.swayF + p.phase) * p.sway * dt : 0);
      p.y += p.vy * dt;
      p.rot += p.vr * dt; p.flip += dt * 3;

      let alpha = 1;
      if (p.life) { alpha = 1 - p.age / p.life; if (alpha <= 0) { parts.splice(i, 1); continue; } }
      else if (p.y > H + 20) { parts.splice(i, 1); continue; }

      ctx.globalAlpha = Math.min(1, alpha * 1.4);
      ctx.fillStyle = p.color;
      if (p.type === "spark") {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
      } else {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(p.flip)));
        ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, 6.283); ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;

    raf = (parts.length || raining) ? requestAnimationFrame(tick) : 0;
  }
  function trail(x, y) {
    add({ type: "spark", x, y, vx: rand(-22, 22), vy: rand(-8, 34), g: 20, drag: 0.3, size: rand(1, 2.4),
      rot: 0, vr: 0, flip: 0, color: SPARKS[(Math.random() * SPARKS.length) | 0], age: 0, life: rand(0.5, 0.9) });
    start();
  }
  return { burst, celebrate, trail };
})();

/* Wand trail: golden sparks follow the finger / cursor */
if (!REDUCED) {
  let lastTrail = 0;
  window.addEventListener("pointermove", (e) => {
    const n = performance.now(); if (n - lastTrail < 45) return; lastTrail = n;
    FX.trail(e.clientX, e.clientY);
  }, { passive: true });
  window.addEventListener("pointerdown", (e) => { for (let i = 0; i < 4; i++) FX.trail(e.clientX, e.clientY); }, { passive: true });
}


/* ================================================================
   5 — SCENE MANAGER
   ================================================================ */
const frame = $("#frame");
const Scenes = {};
let current = null, busy = false;

function register(id, hooks = {}) {
  Scenes[id] = { el: document.getElementById("scene-" + id), ...hooks };
}

async function go(id, { via = "fade" } = {}) {
  if (busy || !Scenes[id]) return;
  busy = true;
  const from = current && Scenes[current];

  if (via === "light") {
    Sound.play("magic");
    playLight();
    await wait(750);
  }
  if (from) {
    from.el.classList.remove("is-active");
    from.el.inert = true;
    if (from.leave) from.leave();
    await wait(850);
  }
  const to = Scenes[id];
  current = id;
  frame.dataset.scene = id;
  to.el.inert = false;
  to.el.scrollTop = 0;
  to.el.classList.add("is-active");
  if (to.enter) to.enter();
  busy = false;
}

function playLight(colors) {
  const light = $("#light");
  light.classList.remove("is-on"); void light.offsetWidth; light.classList.add("is-on");
  FX.burst(window.innerWidth / 2, window.innerHeight / 2, REDUCED ? 10 : 46, colors ? { colors } : {});
}


/* ================================================================
   6 — SCENES
   ================================================================ */

/* ---------- Scene −1 · Gate (the tap that lets music start) ----------
   Browsers only allow audio after a tap, so the experience begins with
   "break the seal": that tap starts the music from the very first moment. */
(function () {
  const enter = $("#gateEnter"), mute = $("#gateMute");
  setText("gateTitle", TEXT.gateTitle);
  setText("gateNote", TEXT.gateNote);
  enter.addEventListener("click", () => { Sound.set(true); FX.burst(window.innerWidth / 2, window.innerHeight * 0.42, 30); go("opening"); });
  register("gate");
})();

/* ---------- Scene 0 · Opening ---------- */
(function () {
  let timer = 0, t0 = 0;
  const el = $("#scene-opening");
  setText("openLine", TEXT.openingLine);
  setText("openSub", TEXT.openingSub);
  setText("openHint", TEXT.openingHint);
  setText("openGuest", GUEST ? TEXT.openingGuest(GUEST) : "");

  const skip = () => { if (performance.now() - t0 > 1800) go("question"); };
  register("opening", {
    enter() {
      t0 = performance.now();
      $("#openHint").hidden = Sound.isOn();
      Sound.play("opening");
      Sound.ambient(true);
      timer = setTimeout(() => go("question"), REDUCED ? 3000 : 7000);
      el.addEventListener("click", skip);
    },
    leave() { clearTimeout(timer); el.removeEventListener("click", skip); }
  });
})();

/* ---------- Scene 1 · The Question (+ the runaway NO) ---------- */
(function () {
  const arena = $("#arena"), yes = $("#btnYes"), no = $("#btnNo"), taunt = $("#taunt");
  setText("questionTitle", TEXT.question);
  setText("questionGuest", GUEST ? TEXT.questionGuest(GUEST) : "");

  let attempts = 0, last = 0, done = false;
  let W = 0, H = 0, yesS = 1, noS = 1;
  let yesP = { x: 0, y: 0, w: 0, h: 0 }, noP = { x: 0, y: 0, w: 0, h: 0 };
  const place = (b, p, s) => { b.style.transform = `translate(${p.x}px, ${p.y}px) scale(${s})`; };

  function layout() {
    W = arena.clientWidth; H = arena.clientHeight;
    yesP = { w: yes.offsetWidth, h: yes.offsetHeight, x: 0, y: 0 };
    noP  = { w: no.offsetWidth,  h: no.offsetHeight,  x: 0, y: 0 };
    yesP.x = (W - yesP.w) / 2; yesP.y = 30;
    noP.x  = (W - noP.w) / 2;  noP.y  = H - noP.h - 16;
    place(yes, yesP, yesS); place(no, noP, noS);
  }

  function overlapsYes(x, y) {
    const yx = yesP.x + yesP.w / 2, yy = yesP.y + yesP.h / 2;
    const hw = (yesP.w * yesS) / 2 + (noP.w * noS) / 2 + 10;
    const hh = (yesP.h * yesS) / 2 + (noP.h * noS) / 2 + 10;
    return Math.abs(x + noP.w / 2 - yx) < hw && Math.abs(y + noP.h / 2 - yy) < hh;
  }

  function moveNo() {
    const reach = [70, 110, 150, 200, 260][Math.min(attempts - 1, 4)];
    const maxX = W - noP.w, maxY = H - noP.h;
    let best = null;
    for (let i = 0; i < 40; i++) {
      const ang = rand(0, 6.283), r = reach * rand(0.7, 1);
      const x = Math.min(maxX, Math.max(0, noP.x + Math.cos(ang) * r));
      const y = Math.min(maxY, Math.max(0, noP.y + Math.sin(ang) * r));
      if (Math.hypot(x - noP.x, y - noP.y) < reach * 0.45 || overlapsYes(x, y)) continue;
      best = { x, y }; break;
    }
    if (!best) { // fallback: the farthest free corner
      const corners = [[0, maxY], [maxX, maxY], [0, H * 0.6], [maxX, H * 0.6]]
        .filter(([x, y]) => !overlapsYes(x, y))
        .sort((a, b) => Math.hypot(b[0] - noP.x, b[1] - noP.y) - Math.hypot(a[0] - noP.x, a[1] - noP.y));
      const c = corners[0] || [0, maxY];
      best = { x: c[0], y: c[1] };
    }
    noP.x = best.x; noP.y = best.y;
  }

  function showTaunt(msg) {
    taunt.style.opacity = 0;
    setTimeout(() => { taunt.textContent = msg; taunt.style.opacity = 1; }, 180);
  }

  function dodge() {
    const now = performance.now();
    if (done || now - last < 450) return;
    last = now; attempts++;
    Sound.play("click");

    yesS = Math.min(1.75, 1 + attempts * 0.13);
    noS = Math.max(0.55, 1 - attempts * 0.09);
    moveNo();
    place(yes, yesP, yesS); place(no, noP, noS);
    // No limit: NO runs away until the guest finally presses YES
    showTaunt(attempts <= TEXT.taunts.length
      ? TEXT.taunts[attempts - 1]
      : TEXT.tauntsLoop[(attempts - TEXT.taunts.length - 1) % TEXT.tauntsLoop.length]);
  }

  no.addEventListener("pointerdown", (e) => { e.preventDefault(); dodge(); });
  no.addEventListener("click", (e) => { e.preventDefault(); if (e.detail === 0) dodge(); }); // keyboard
  arena.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || done) return;
    const r = no.getBoundingClientRect();
    const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    if (d < Math.max(r.width / 2 + 26, 56)) dodge();
  });
  yes.addEventListener("click", () => {
    if (done) return; done = true;
    Sound.play("success");
    go("letter", { via: "light" });
  });

  window.addEventListener("resize", () => { if (!done && current === "question") layout(); });

  register("question", {
    enter() {
      layout();
      requestAnimationFrame(() => { yes.classList.add("is-ready"); no.classList.add("is-ready"); });
    }
  });
})();

/* ---------- Scene 3 · Magical letter ---------- */
(function () {
  const stage = $("#letterStage"), env = $("#envelope"), next = $("#letterNext"), hint = $("#letterHint");
  setText("letterNo", `INVITATION No. ${INVITATION_NO}`);
  setText("letterSelected", TEXT.letterSelected);
  setText("letterName", GUEST ? TEXT.letterName(GUEST) : "");
  setText("letterMission", TEXT.letterMission);
  if (!GUEST) $("#letterName").hidden = true;

  let opened = false;
  async function open() {
    if (opened) return; opened = true;
    Sound.play("magic");
    hint.style.visibility = "hidden";
    stage.classList.add("is-open");
    await wait(900);
    stage.classList.add("is-out");
    await wait(1200);
    stage.classList.add("is-read");
    await wait(3300);
    next.classList.add("is-shown"); next.tabIndex = 0;
    setTimeout(() => next.scrollIntoView({ block: "nearest", behavior: "smooth" }), 100);
  }
  /* Easter egg: 3 quick taps on the seal */
  const seal = $("#seal"), egg = $("#egg"), eggClose = $("#eggClose");
  seal.textContent = SEAL_SYMBOL;
  setText("eggTitle", EASTER_EGG.title); setText("eggText", EASTER_EGG.text);
  let taps = 0, tapTimer = 0;
  function showEgg() {
    Sound.play("magic");
    const r = seal.getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top + r.height / 2, 34);
    Scenes.letter.el.scrollTop = 0;
    egg.classList.add("is-open"); egg.inert = false;
    setTimeout(() => eggClose.focus({ preventScroll: true }), 60);
  }
  function hideEgg() { egg.classList.remove("is-open"); egg.inert = true; }
  eggClose.addEventListener("click", hideEgg);
  egg.addEventListener("click", (e) => { if (e.target === egg) hideEgg(); });
  env.addEventListener("click", (e) => {
    if (opened) return;
    if (e.target.closest("#seal")) {
      taps++;
      seal.classList.remove("wiggle"); void seal.offsetWidth; seal.classList.add("wiggle");
      clearTimeout(tapTimer);
      if (taps >= 3) { taps = 0; showEgg(); return; }
      tapTimer = setTimeout(() => { taps = 0; open(); }, 650);   // 1–2 taps: just open the letter
      return;
    }
    open();
  });
  env.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  next.addEventListener("click", () => go("secret"));
  register("letter");
})();

/* ---------- Scene 4 · Secret access ---------- */
(function () {
  const form = $("#secretForm"), field = $("#field"), input = $("#codeInput"), msg = $("#secretMsg"), btn = $("#secretBtn");
  setText("secretHint", SECRET_HINT);
  let tries = 0, granted = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (granted) return;
    const v = normalize(input.value);
    if (!v) return;

    if (v === normalize(SECRET_CODE)) {
      granted = true; input.disabled = true; btn.disabled = true;
      field.classList.remove("is-wrong");
      msg.className = "msg is-granted";
      msg.innerHTML = `<span class="tick">✓</span>${TEXT.secretGranted}`;
      Sound.play("success");
      const r = input.getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top + r.height / 2, 28);
      await wait(1900);
      go("map", { via: "light" });
    } else {
      msg.textContent = TEXT.secretErrors[tries++ % TEXT.secretErrors.length];
      field.classList.remove("shake"); void field.offsetWidth;
      field.classList.add("shake", "is-wrong");
      frame.classList.remove("pulse-error"); void frame.offsetWidth; frame.classList.add("pulse-error");
      const r = input.getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top + r.height / 2, 10, { colors: ["#b5566a", "#e6b0b9"] });
      Sound.play("click");
      input.select();
    }
  });
  input.addEventListener("input", () => { field.classList.remove("is-wrong"); });

  register("secret", {
    enter() { if (window.matchMedia("(pointer: fine)").matches) setTimeout(() => input.focus({ preventScroll: true }), 900); }
  });
})();

/* ---------- Guest uploads: photo / voice / text → Netlify Forms ---------- */
const Uploader = (() => {
  const box = $("#ask"), promptEl = $("#askPrompt"), textEl = $("#askText"), photoIn = $("#askPhoto");
  const photoLbl = $("#askPhotoLabel"), btnRow = $("#askBtns");
  const recBtn = $("#askRec"), prev = $("#askPreview"), sendBtn = $("#askSend"), editBtn = $("#askEdit");
  const status = $("#askStatus"), controls = $("#askControls"), nameIn = $("#askName");
  setText("askNote", UPLOADS.note);
  const drafts = new Map();          // memory id → { text, photo, voice }
  const params = new URLSearchParams(window.location.search);
  const IS_LOCAL = (["localhost", "127.0.0.1", "[::1]", ""].includes(window.location.hostname) || /^192\.168\./.test(window.location.hostname))
    && !params.has("realupload");   // locally we only simulate; on the real site it truly sends
  let mem = null, isOpen = false, allSent = false, onChange = () => {};const SENT_KEY = "bday-sent:" + (GUEST ? GUEST.toLowerCase() : "anon");
try { if (params.has("reset")) localStorage.removeItem(SENT_KEY); } catch (e) {}
const wasSent = () => { try { return localStorage.getItem(SENT_KEY) === "1"; } catch (e) { return false; } };
let mem = null, isOpen = false, allSent = wasSent(), onChange = () => {};
  let photo = null, voice = null, urls = [], rec = null, stream = null, recTimer = 0, recStart = 0, chunks = [];

  const safe = (t) => String(t).replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 30) || "x";
  const qualifies = (d) => UPLOADS.requireMedia ? !!(d.photo || d.voice) : !!(d.text || d.photo || d.voice);
  const hasContent = () => !!(textEl.value.trim() || photo || voice);
  function say(t, kind = "") { status.textContent = t; status.className = "ask-status " + kind; }
  function refresh() { sendBtn.disabled = !hasContent(); }
  function clearPreview() { urls.forEach((u) => URL.revokeObjectURL(u)); urls = []; prev.replaceChildren(); }
  function renderPreview() {
    clearPreview();
    if (photo) {
      const u = URL.createObjectURL(photo.blob); urls.push(u);
      const img = document.createElement("img"); img.src = u; img.alt = "پیش‌نمایش عکس"; img.className = "ask-thumb"; prev.appendChild(img);
    }
    if (voice) {
      const u = URL.createObjectURL(voice.blob); urls.push(u);
      const a = document.createElement("audio"); a.src = u; a.controls = true; a.className = "ask-audio"; prev.appendChild(a);
    }
  }
  function reset() {
    photo = null; voice = null; textEl.value = ""; photoIn.value = "";
    clearPreview(); recBtn.textContent = "🎙 ضبط ویس"; say(""); refresh();
    controls.hidden = false; sendBtn.hidden = false; editBtn.hidden = true;
    nameIn.hidden = !!GUEST;   // no ?guest= in the link → ask the guest for their name
  }
  const guestName = () => GUEST || nameIn.value.trim().slice(0, 40);
  function lock(msg, kind, canEdit) { nameIn.hidden = true; controls.hidden = true; sendBtn.hidden = true; editBtn.hidden = !canEdit; say(msg, kind); }

  /* Smart compression: same look, far fewer KB.
     1) already small JPEG → sent untouched (zero quality loss)
     2) otherwise resized to maxImagePx, then JPEG quality steps down only until it fits targetImageKB */
  function loadImg(file) {
    return new Promise((res, rej) => {
      const u = URL.createObjectURL(file), img = new Image();
      img.onload = () => { URL.revokeObjectURL(u); res(img); };
      img.onerror = () => { URL.revokeObjectURL(u); rej(new Error("decode")); };
      img.src = u;
    });
  }
  async function shrink(file) {
    const target = (UPLOADS.targetImageKB || 700) * 1024, minQ = UPLOADS.minImageQuality || 0.72;
    let src = null;
    try { src = await createImageBitmap(file); } catch (e) { try { src = await loadImg(file); } catch (e2) { src = null; } }
    if (!src) return file.size < 3e6 ? file : null;
    const w0 = src.width || src.naturalWidth, h0 = src.height || src.naturalHeight;
    if (file.type === "image/jpeg" && file.size <= target && Math.max(w0, h0) <= UPLOADS.maxImagePx) {
      if (src.close) src.close();
      return file;
    }
    let k = Math.min(1, UPLOADS.maxImagePx / Math.max(w0, h0)), q = 0.86, blob = null;
    for (let i = 0; i < 7; i++) {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(w0 * k)); c.height = Math.max(1, Math.round(h0 * k));
      const g = c.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);   // PNGs with transparency → white, not black
      g.imageSmoothingQuality = "high";
      g.drawImage(src, 0, 0, c.width, c.height);
      blob = await new Promise((r) => c.toBlob(r, "image/jpeg", q));
      if (!blob || blob.size <= target) break;
      if (q > minQ) q = Math.max(minQ, q - 0.05); else k *= 0.86;   // quality first, then a little smaller
    }
    if (src.close) src.close();
    return blob;
  }
  photoIn.addEventListener("change", async () => {
    const f = photoIn.files && photoIn.files[0]; if (!f) return;
    say("در حال آماده‌سازی عکس…");
    const blob = await shrink(f);
    if (!blob) { say("این عکس خیلی بزرگ است یا خوانده نشد.", "err"); return; }
    photo = { blob, name: blob.type === "image/jpeg" ? "photo.jpg" : f.name };
    say(""); renderPreview(); refresh();
  });

  /* Save this stop's answer as a draft (sent together at the end of the map) */
  function saveDraft(quiet) {
    if (!mem || !hasContent()) return;
    if (!quiet && !guestName()) { say("اول اسمت را بنویس تا بدونم کی فرستاده 🙂", "err"); nameIn.focus(); return; }
    drafts.set(mem.id, { text: textEl.value.trim(), photo, voice });
    if (isOpen) {
      lock("✓ ذخیره شد؛ همراه بقیه برای من ارسال می‌شود 💙", "ok", true);
      const r = status.getBoundingClientRect();
      if (!quiet) { FX.burst(r.left + r.width / 2, r.top, 18); Sound.play("success"); }
    }
    onChange();
  }

  async function toggleRec() {
    if (rec && rec.state === "recording") { rec.stop(); return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) { say("مرورگرت ضبط ویس را پشتیبانی نمی‌کند.", "err"); return; }
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { say("دسترسی به میکروفون داده نشد.", "err"); return; }
    const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || "";
    chunks = [];
    const target = mem;   // the stop this recording belongs to
    rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : {});
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      clearInterval(recTimer); Sound.duck(false);
      stream.getTracks().forEach((t) => t.stop());
      const type = rec.mimeType || mime || "audio/webm";
      const blob = new Blob(chunks, { type });
      const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
      voice = blob.size ? { blob, name: "voice." + ext } : null;
      recBtn.textContent = "🎙 ضبط مجدد";
      if (!isOpen && target === mem) { saveDraft(true); return; }   // dialog was closed mid-recording → keep it
      renderPreview(); refresh();
    };
    Sound.duck(true);   // keep the background harp out of the recording
    rec.start(); recStart = Date.now(); recBtn.textContent = "⏹ توقف";
    recTimer = setInterval(() => {
      const s = Math.floor((Date.now() - recStart) / 1000);
      recBtn.textContent = `⏹ توقف ${faDigits(s)}″`;
      if (s >= UPLOADS.maxVoiceSeconds) rec.stop();
    }, 400);
  }
  recBtn.addEventListener("click", toggleRec);
  textEl.addEventListener("input", refresh);
  sendBtn.addEventListener("click", () => saveDraft(false));
  editBtn.addEventListener("click", () => { drafts.delete(mem.id); reset(); onChange(); });

  /* One single submission with everything (called when the guest continues past the map) */
  async function flush() {
    if (allSent) return true;
    const list = MEMORIES.map((m, i) => ({ m, i, d: drafts.get(m.id) })).filter((x) => x.d && x.i < 6);
    if (!list.length) return true;
    const fd = new FormData();
    fd.append("form-name", UPLOADS.formName);
    fd.append("bot-field", "");
    const gname = guestName() || "(بدون نام)";
    fd.append("guest", gname);
    const who = safe(gname);
    let total = 0;
    list.forEach(({ m, i, d }) => {
      const n = i + 1;
      fd.append("q" + n, `${m.label || m.id} — ${m.ask || ""}`);
      if (d.text) fd.append("text" + n, d.text);
      if (d.photo) { fd.append("photo" + n, d.photo.blob, `${safe(m.id)}-${who}-${d.photo.name}`); total += d.photo.blob.size; }
      if (d.voice) { fd.append("voice" + n, d.voice.blob, `${safe(m.id)}-${who}-${d.voice.name}`); total += d.voice.blob.size; }
    });
    if (total > 7.5e6) return false;   // Netlify's ~8 MB limit
    try {
      if (IS_LOCAL) {
        await new Promise((r) => setTimeout(r, 900));
        console.info("[upload — local test, nothing saved]", Object.fromEntries([...fd.entries()].map(([k, v]) => [k, v instanceof Blob ? `${v.name} (${Math.round(v.size / 1024)} KB)` : v])));
      } else {
        const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 60000);
        const res = await fetch(UPLOADS.endpoint, { method: "POST", body: fd, signal: ctl.signal });
        clearTimeout(to);
        if (!res.ok) throw new Error("HTTP " + res.status);
      }
allSent = true;
try { localStorage.setItem(SENT_KEY, "1"); } catch (e) {}
return true;    } catch (e) { return false; }
  }

  return {
    show(m) {
      mem = m; isOpen = true; reset();
      const on = UPLOADS.enabled && !!m.ask;
      box.hidden = !on;
      if (!on) return;
      promptEl.textContent = m.ask;
      const kind = m.input || "any";
      photoLbl.hidden = !(kind === "photo" || kind === "any");
      recBtn.hidden = !(kind === "voice" || kind === "any");
      btnRow.hidden = photoLbl.hidden && recBtn.hidden;
      textEl.hidden = kind === "voice";
      textEl.rows = kind === "text" ? 5 : 2;
      textEl.maxLength = kind === "text" ? 1500 : 400;
      textEl.placeholder = m.placeholder || (kind === "text" ? "بنویس…" : "چند خط بنویس (اختیاری)");
      if (allSent) lock("✓ فرستاده شد. ممنون 💙", "ok", false);
      else if (drafts.has(m.id)) lock("✓ ذخیره شد؛ همراه بقیه برای من ارسال می‌شود 💙", "ok", true);
    },
    hide() {
      isOpen = false;
      if (rec && rec.state === "recording") { rec.stop(); return; }   // onstop saves it
      if (mem && UPLOADS.enabled && mem.ask && !allSent && !drafts.has(mem.id) && hasContent()) saveDraft(true);   // auto-save unsaved work
    },
    /* Has the guest left enough answers to continue? */
    ready() {
        if (allSent) return true;
      if (!UPLOADS.enabled || !MEMORIES.some((m) => m.ask)) return true;
      return [...drafts.values()].filter(qualifies).length >= UPLOADS.minRequired;
    },
    flush,
    set onChange(fn) { onChange = fn; }
  };
})();

/* ---------- Scene 5 · Memory hunt ---------- */
(function () {
  const pinsEl = $("#pins"), counter = $("#mapCounter"), next = $("#mapNext");
  const modal = $("#modal"), mLabel = $("#modalLabel"), mTitle = $("#modalTitle"), mImg = $("#modalImg");
  const mText = $("#modalText"), mSound = $("#modalSound"), mClose = $("#modalClose"), toast = $("#toast");
  const ICONS = { memory: "❀", secret: "✉", party: "♛" };
  const found = new Set(), pinEls = {};
  let openItem = null, opener = null, voice = null, toastTimer = 0;

  function updateCounter() { counter.textContent = TEXT.mapCounter(found.size, MEMORIES.length); }
  function othersFound() { return MEMORIES.filter((m) => m.type !== "party").every((m) => found.has(m.id)); }
  function refreshLocks() {
    MEMORIES.forEach((m) => { if (m.type === "party") pinEls[m.id].classList.toggle("is-locked", !(othersFound() && Uploader.ready())); });
  }
  function say(t) {
    toast.textContent = t; toast.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2400);
  }

  MEMORIES.forEach((m) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "pin";
    b.style.left = m.pos.x + "%"; b.style.top = m.pos.y + "%";
    b.textContent = ICONS[m.type] || "❀";
    b.setAttribute("aria-label", m.label || m.title);
    b.addEventListener("click", () => openMemory(m, b));
    pinsEl.appendChild(b); pinEls[m.id] = b;
  });

  const stepsEl = $("#steps");
  function addSteps(i) {   // ink footprints walk from the previous stop to this one
    if (REDUCED) return;
    const from = i === 0 ? { x: 50, y: 97 } : MEMORIES[i - 1].pos, to = MEMORIES[i].pos;
    const dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy) || 1;
    const ang = Math.atan2(dy, dx) * 180 / Math.PI + 90, n = 8;
    for (let k = 1; k < n; k++) {
      const side = k % 2 ? 1 : -1, t = k / n;
      const el = document.createElement("i");
      el.className = "step animate-inkin";
      el.style.cssText = `left:${from.x + dx * t + (-dy / len) * side * 1.7}%;top:${from.y + dy * t + (dx / len) * side * 1.7}%;transform:rotate(${ang}deg);animation-delay:${(k * 0.16).toFixed(2)}s`;
      stepsEl.appendChild(el);
    }
  }

  function stopVoice() { if (voice) { voice.pause(); voice = null; } mSound.textContent = "▶ پیام صوتی"; Sound.duck(false); }

  function openMemory(m, from) {
    if (m.type === "party" && !othersFound()) { say(TEXT.mapLocked); return; }
    if (m.type === "party" && !Uploader.ready()) { say(TEXT.mapNeedUpload); return; }
    openItem = m; opener = from;
    Scenes.map.el.scrollTop = 0;   // keep the dialog inside the visible frame
    mLabel.textContent = m.label || "";
    mTitle.textContent = m.title || "";
    mText.textContent = m.text || ""; mText.hidden = !m.text;

    mImg.hidden = true; mImg.onerror = null; mImg.onload = null;
    if (m.image) {
      mImg.onload = () => { mImg.hidden = false; };
      mImg.onerror = () => { mImg.hidden = true; };   // missing photo → just skip it
      mImg.alt = m.title || "";
      mImg.src = m.image;
    }
    mSound.hidden = !m.sound;
    stopVoice();
    Uploader.show(m);

    modal.inert = false; modal.classList.add("is-open");
    setTimeout(() => mClose.focus({ preventScroll: true }), 50);
  }

  function closeMemory() {
    if (!openItem) return;
    stopVoice();
    Uploader.hide();
    const m = openItem; openItem = null;
    modal.classList.remove("is-open"); modal.inert = true;
    if (opener) opener.focus({ preventScroll: true });

    if (!found.has(m.id)) {
      found.add(m.id);
      const pin = pinEls[m.id];
      pin.classList.add("is-found");
      addSteps(MEMORIES.indexOf(m));
      const lab = document.createElement("span");
      lab.className = "pin-label"; lab.textContent = m.label || "";
      pin.appendChild(lab);
      const r = pin.getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top + r.height / 2, 14);
      Sound.note(found.size - 1, MEMORIES.length);
      updateCounter(); refreshLocks();
      if (found.size === MEMORIES.length) {
        setTimeout(() => say(TEXT.mapDone), 500);
        setTimeout(() => { next.classList.add("is-shown"); next.tabIndex = 0; next.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 900);
      }
    }
  }

  mSound.addEventListener("click", () => {
    if (voice) { stopVoice(); return; }
    const a = new Audio(openItem.sound);
    a.addEventListener("error", () => { mSound.hidden = true; });
    a.addEventListener("ended", stopVoice);
    voice = a;
    a.play().then(() => { mSound.textContent = "❚❚ توقف"; Sound.duck(true); }).catch(() => { voice = null; mSound.hidden = true; });
  });
  mClose.addEventListener("click", closeMemory);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeMemory(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMemory(); });
  Uploader.onChange = refreshLocks;
  next.addEventListener("click", async () => {
    if (!Uploader.ready()) { say(TEXT.mapNeedUpload); return; }
    next.disabled = true; say(TEXT.mapSending);
    const ok = await Uploader.flush();
    next.disabled = false;
    if (!ok) { say(TEXT.mapSendFail); return; }
    go("countdown", { via: "light" });
  });

  updateCounter(); refreshLocks();
  register("map");
})();

/* ---------- Scene 6 · Countdown ---------- */
(function () {
  const ids = { d: $("#cdDays"), h: $("#cdHours"), m: $("#cdMinutes"), s: $("#cdSeconds") };
  const msg = $("#cdMessage");
  const target = new Date(PARTY_DATE).getTime();
  let timer = 0;
  const two = (n) => faDigits(String(n).padStart(2, "0"));

  function render() {
    if (isNaN(target)) { show(0, 0, 0, 0); msg.textContent = TEXT.countdownInvalid; return; }
    const diff = target - Date.now();
    if (diff <= 0) {
      show(0, 0, 0, 0);
      msg.textContent = (-diff < 12 * 3600e3) ? TEXT.countdownNow : TEXT.countdownPast;   // never a negative clock
      return;
    }
    const s = Math.floor(diff / 1000);
    show(Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60);
    msg.textContent = TEXT.countdownFuture;
  }
  function show(d, h, m, s) {
    ids.d.textContent = two(d); ids.h.textContent = two(h); ids.m.textContent = two(m); ids.s.textContent = two(s);
  }
  $("#cdNext").addEventListener("click", () => go("info"));
  register("countdown", {
    enter() { render(); timer = setInterval(render, 1000); },
    leave() { clearInterval(timer); }
  });
})();

/* ---------- Scene 7 · Party information ---------- */
(function () {
  setText("infoTitle", PARTY_INFO.title);
  const rows = [
    ["🎂", "date", PARTY_INFO.date], ["⏰", "time", PARTY_INFO.time],
    ["📍", "location", PARTY_INFO.location], ["👔", "dressCode", PARTY_INFO.dressCode]
  ];
  const list = $("#infoList");
  rows.forEach(([icon, key, value]) => {
    if (!value) return;
    const li = document.createElement("li");
    const ic = document.createElement("span"); ic.className = "ic"; ic.textContent = icon; ic.setAttribute("aria-hidden", "true");
    const box = document.createElement("div");
    const k = document.createElement("span"); k.className = "k"; k.textContent = TEXT.infoRows[key];
    const v = document.createElement("span"); v.className = "v"; v.textContent = value;
    box.append(k, v); li.append(ic, box); list.appendChild(li);
  });
  if (PARTY_INFO.mapUrl) { const a = $("#infoMap"); a.href = PARTY_INFO.mapUrl; a.hidden = false; }
  $("#infoNext").addEventListener("click", runFinale);
  register("info");
})();


/* ================================================================
   7 — FINAL REVEAL
   ================================================================ */
(function buildFinale() {
  setText("fGuest", GUEST ? TEXT.finalGuest(GUEST) : "");
  if (!GUEST) $("#fGuest").hidden = true;
  setText("fName", HOST_NAME);
  setText("fLine", TEXT.finalLine);
  if (PARTY_INFO.rsvpUrl) { const a = $("#fRsvp"); a.href = PARTY_INFO.rsvpUrl; a.hidden = false; }
  $("#fReplay").addEventListener("click", () => window.location.reload());

  const colors = ["#a9bfe3", "#f2dc8a", "#fbf7ec", "#7f9bd0", "#f6e6ad", "#c9d8f0", "#f2dc8a"];
  const box = $("#balloons");
  const n = REDUCED ? 0 : (window.innerWidth < 480 ? 5 : 8);
  for (let i = 0; i < n; i++) {
    const b = document.createElement("i");
    b.className = "balloon";
    b.style.cssText = `left:${6 + (i * 88) / Math.max(1, n - 1)}%;--c:${colors[i % colors.length]};--t:${14 + (i % 4) * 2.5}s;--dl:${(i * 1.7).toFixed(1)}s;--sw:${(i % 2 ? 1 : -1) * (18 + i * 3)}px`;
    box.appendChild(b);
  }
})();

async function runFinale() {
  if (busy) return;
  busy = true;
  const bo = $("#blackout"), t = $("#blackText");
  bo.classList.add("is-on");
  Sound.ambient(false);   // music fades out: silence makes the reveal hit harder
  await wait(1100);

  t.textContent = TEXT.finalWait; t.className = "black-text latin soft";
  await wait(2100);

  for (const n of [3, 2, 1]) {
    t.className = "black-text latin"; void t.offsetWidth;
    t.textContent = String(n);   // Latin digits on purpose
    t.classList.add("pop");
    Sound.play("click");
    await wait(1000);
  }
  t.textContent = "";

  // Reveal
  frame.classList.add("is-hidden");
  Scenes[current].el.classList.remove("is-active");
  $("#finale").classList.add("is-live");
  current = "final";
  playLight(["#f6e6ad", "#ffffff", "#a9bfe3", "#f2dc8a"]);
  bo.classList.remove("is-on");
  Sound.ambient(false);
  Sound.music(true);
  setTimeout(() => FX.celebrate(), 500);
  busy = false;
}


/* ================================================================
   8 — START
   ================================================================ */
(async function start() {
  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  await Promise.race([fonts, wait(1800)]);
  frame.classList.add("is-ready");
  await wait(700);

  const jump = new URLSearchParams(window.location.search).get("scene");
  go(jump && Scenes[jump] ? jump : "gate");
})();
