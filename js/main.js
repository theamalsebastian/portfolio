/* =========================================================
   AMAL SEBASTIAN, portfolio: behaviour and motion.
   The page is complete without this file; it only adds
   smooth scroll, the held frames, the menu and the entrances.
   No libraries load on phones; desktops fetch Lenis after load.
   ========================================================= */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
// on Data Saver or a slow connection the recordings stay as their posters
const conn = navigator.connection;
const lite = !!(conn && (conn.saveData || /2g|3g/.test(conn.effectiveType || "")));
const play = (v) => {
  if (reduce || lite || document.hidden) return;
  if (!v.getAttribute("src") && v.dataset.src) v.src = v.dataset.src; // fetched only when first played
  const p = v.play(); if (p) p.catch(() => {});
};
const pause = (v) => { if (!v.paused) v.pause(); };

/* ---------- smooth scroll (Lenis), desktop pointers only ---------- */
let lenis = null;
(function smoothScroll() {
  if (reduce || !fine) return;
  addEventListener("load", () => {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/lenis@1.1.13/dist/lenis.min.js";
    s.onload = () => {
      lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    };
    document.head.append(s);
  });
})();

/* ---------- posters load as their video nears the screen, never while it is hidden by the layout ---------- */
(function posters() {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.poster = e.target.dataset.poster; io.unobserve(e.target); }
  }, { rootMargin: "900px 0px" });
  document.querySelectorAll("video[data-poster]").forEach((v) => io.observe(v));
  // a hidden tab plays nothing
  let wasPlaying = [];
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { wasPlaying = [...document.querySelectorAll("video")].filter((v) => !v.paused); wasPlaying.forEach(pause); }
    else { wasPlaying.forEach(play); wasPlaying = []; }
  });
})();

/* ---------- the menu (phones) ---------- */
const bar = document.getElementById("bar");
const menuButton = bar.querySelector(".bar__menu");
function setMenu(open) {
  bar.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("is-locked", open);
  if (lenis) open ? lenis.stop() : lenis.start();
}
menuButton.addEventListener("click", () => setMenu(!bar.classList.contains("is-open")));
addEventListener("keydown", (e) => { if (e.key === "Escape" && bar.classList.contains("is-open")) { setMenu(false); menuButton.focus(); } });
matchMedia("(min-width: 48em)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

/* in-page links glide instead of jumping, and close the menu */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id === "#top" ? document.body : document.querySelector(id);
    if (!target) return;
    if (bar.classList.contains("is-open")) setMenu(false);
    if (lenis) { e.preventDefault(); lenis.scrollTo(target, { offset: id === "#top" ? 0 : -72, duration: 1.4 }); history.replaceState(null, "", id); }
  });
});

const hero = document.querySelector(".hero");

/* ---------- the about statement fills with ink as it is read ---------- */
const fill = document.querySelector("[data-fill]");
let words = [];
if (fill && !reduce) {
  const parts = fill.textContent.trim().split(/\s+/);
  fill.setAttribute("aria-label", fill.textContent.trim());
  fill.innerHTML = parts.map((w) => `<span class="fill__w" aria-hidden="true">${w}</span>`).join(" ");
  fill.classList.add("is-filling");
  words = [...fill.querySelectorAll(".fill__w")];
}

/* ---------- one scroll pass: bar ground and tuck, ink fill, footer push, code drift ---------- */
const footWords = [...document.querySelectorAll(".foot__word")];
const foot = document.querySelector(".foot");
const codes = [...document.querySelectorAll(".note__figure pre")];
const grounds = [hero, ...document.querySelectorAll(".proof__band, main > section[data-field], footer[data-field]")];
const clamp01 = (x) => Math.min(1, Math.max(0, x));
let ticking = false, lastY = scrollY;
function onScroll() {
  ticking = false;
  const h = innerHeight;
  // which ground sits under the bar (the band is checked before the section that holds it)
  const y = bar.offsetHeight / 2;
  const under = grounds.find((g) => { const r = g.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
  if (under) bar.dataset.field = under === hero ? "hero" : under.dataset.field;
  // the bar tucks away while reading down and returns on the way back up
  const sy = scrollY;
  if (Math.abs(sy - lastY) > 4) { bar.classList.toggle("is-tucked", sy > lastY && sy > h * 0.6 && !bar.classList.contains("is-open")); lastY = sy; }

  if (words.length) {
    const f = fill.getBoundingClientRect();
    const q = clamp01((h * 0.85 - f.top) / (f.height + h * 0.4));
    const lit = Math.round(q * words.length);
    words.forEach((w, k) => w.classList.toggle("is-lit", k < lit));
  }
  if (reduce) return;

  // the closing name is pushed up into its line as the footer arrives
  const ft = foot.getBoundingClientRect().top;
  if (ft < h * 1.2) {
    const f = clamp01((h - ft) / (h * 0.65));
    footWords.forEach((w, k) => { w.style.transform = `translateY(${((1 - clamp01((f - k * 0.08) / 0.92)) * 70).toFixed(1)}%)`; });
  } else if (!footWords[0].style.transform) footWords.forEach((w) => { w.style.transform = "translateY(70%)"; });

  // research code drifts inside its frame
  codes.forEach((pre) => {
    const r = pre.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > h) return;
    pre.style.transform = `translateY(${(40 - 80 * clamp01((h - r.top) / (h + r.height))).toFixed(1)}px)`;
  });
}
const requestScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
addEventListener("scroll", requestScroll, { passive: true });
addEventListener("resize", requestScroll);
onScroll();

/* ---------- figures: each digit rolls on a reel ---------- */
document.querySelectorAll("[data-roll]").forEach((dd) => {
  const text = dd.textContent;
  dd.setAttribute("aria-label", text);
  let c = 0;
  dd.innerHTML = [...text].map((ch) => {
    if (!/\d/.test(ch)) return `<span aria-hidden="true">${ch === " " ? "&nbsp;" : ch.replace("<", "&lt;")}</span>`;
    return `<span class="odo" aria-hidden="true"><span class="odo__reel" style="--to:${10 + Number(ch)};--c:${c++}"></span></span>`;
  }).join("");
});

/* ---------- entrances: once, in reading order ---------- */
(function reveal() {
  const targets = document.querySelectorAll("[data-reveal], .research__title");
  if (!("IntersectionObserver" in window)) { targets.forEach((t) => t.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
  targets.forEach((t) => io.observe(t));
  // stagger rows and cards that arrive together
  document.querySelectorAll(".rows, .creds__list, .figures__list").forEach((list) => [...list.children].forEach((el, n) => el.style.setProperty("--i", n % 2)));
  addEventListener("load", () => setTimeout(() => targets.forEach((t) => { const r = t.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) t.classList.add("is-in"); }), 2500));
})();

/* ---------- projects: the row at the middle of the screen is active ---------- */
(function projectList() {
  const section = document.querySelector(".projects");
  const rows = [...document.querySelectorAll(".row")];
  const pics = [...document.querySelectorAll(".projects__picture > *")];
  if (!rows.length) return;
  const held = matchMedia("(min-width: 64em)");
  let current = 0, inView = false;
  const sync = () => pics.forEach((p, k) => { if (p.tagName === "VIDEO") (k === current && inView && held.matches ? play(p) : pause(p)); });
  const set = (i) => {
    current = i;
    rows.forEach((r, k) => r.classList.toggle("is-active", k === i));
    pics.forEach((p, k) => p.classList.toggle("is-on", k === i));
    sync();
  };
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }).observe(section);
  held.addEventListener("change", sync);
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) set(rows.indexOf(e.target));
  }, { rootMargin: "-45% 0px -45% 0px" });
  rows.forEach((r) => io.observe(r));
  rows.forEach((r, i) => {
    if (fine) r.addEventListener("pointerenter", () => set(i));
    r.addEventListener("focusin", () => set(i));
  });

  // stacked layout: each row's own recording plays while it is on screen
  const own = new IntersectionObserver((entries) => {
    for (const e of entries) (e.isIntersecting && !held.matches ? play(e.target) : pause(e.target));
  }, { threshold: 0.4 });
  document.querySelectorAll("video.row__pic").forEach((v) => own.observe(v));
})();

/* ---------- hover: rolling labels, a magnetic pull, the name letter by letter ---------- */
(function hovers() {
  if (!fine || reduce) return;
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  document.querySelectorAll(".button, .foot__places a").forEach((el) => {
    const t = el.textContent.trim();
    el.innerHTML = `<span class="roll" data-text="${esc(t).replace(/"/g, "&quot;")}"><span class="roll__a">${esc(t)}</span></span>`;
  });
  document.querySelectorAll(".button").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.22, y = (e.clientY - r.top - r.height / 2) * 0.32;
      b.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    });
    b.addEventListener("pointerleave", () => { b.style.translate = ""; });
  });
  const title = document.querySelector(".hero__title");
  title.setAttribute("aria-label", title.textContent.replace(/\s+/g, " ").trim());
  // split into letters only once a pointer reaches the name
  title.addEventListener("pointerenter", () => title.querySelectorAll("[data-line]").forEach((line) => {
    line.setAttribute("aria-hidden", "true");
    line.innerHTML = [...line.textContent].map((ch) => `<span class="ch">${esc(ch)}</span>`).join("");
  }), { once: true });
})();

document.getElementById("year").textContent = new Date().getFullYear();
