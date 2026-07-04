/* =========================================================
   AMAL SEBASTIAN — PORTFOLIO — shared behavior
   ========================================================= */

/* ---------- mobile nav ---------- */
(function navToggle(){
  const btn = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if(!btn || !links) return;
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
})();

/* ---------- mark active nav link ---------- */
(function markActive(){
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if(href === path) a.classList.add("active");
  });
})();

/* ---------- scroll reveal ---------- */
(function scrollReveal(){
  const items = document.querySelectorAll(".reveal");
  if(!items.length) return;
  if(!("IntersectionObserver" in window)){
    items.forEach(el => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.15});
  items.forEach(el => io.observe(el));
})();

/* ---------- hero node-graph canvas (embedding-space motif) ---------- */
(function nodeCanvas(){
  const canvas = document.getElementById("node-canvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w, h, nodes;
  const NODE_COUNT = 46;
  const LINK_DIST = 130;

  function resize(){
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width * devicePixelRatio;
    h = canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
  }

  function makeNodes(){
    nodes = Array.from({length: NODE_COUNT}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - .5) * .25 * devicePixelRatio,
      vy: (Math.random() - .5) * .25 * devicePixelRatio,
      r: (Math.random() * 1.6 + 1) * devicePixelRatio
    }));
  }

  function step(){
    ctx.clearRect(0, 0, w, h);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if(n.x < 0 || n.x > w) n.vx *= -1;
      if(n.y < 0 || n.y > h) n.vy *= -1;
    });
    for(let i = 0; i < nodes.length; i++){
      for(let j = i + 1; j < nodes.length; j++){
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < LINK_DIST * devicePixelRatio){
          ctx.strokeStyle = `rgba(20,22,31,${(1 - dist/(LINK_DIST*devicePixelRatio)) * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.fillStyle = "rgba(42,62,255,0.55)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
    if(!prefersReduced) requestAnimationFrame(step);
  }

  resize();
  makeNodes();
  step();
  window.addEventListener("resize", () => { resize(); makeNodes(); });
})();

/* ---------- projects: search + tag filter ---------- */
(function projectFilter(){
  const grid = document.getElementById("project-grid");
  if(!grid) return;
  const cards = Array.from(grid.querySelectorAll(".project-card"));
  const search = document.getElementById("project-search");
  const chips = Array.from(document.querySelectorAll(".filter-chip"));
  const noResults = document.getElementById("no-results");
  let activeTag = "all";

  function apply(){
    const q = (search?.value || "").trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const tags = (card.dataset.tags || "").toLowerCase();
      const text = card.textContent.toLowerCase();
      const matchesTag = activeTag === "all" || tags.includes(activeTag);
      const matchesQuery = !q || text.includes(q);
      const show = matchesTag && matchesQuery;
      card.style.display = show ? "" : "none";
      if(show) visible++;
    });
    if(noResults) noResults.style.display = visible === 0 ? "block" : "none";
  }

  search?.addEventListener("input", apply);
  chips.forEach(chip => chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeTag = chip.dataset.tag;
    apply();
  }));
})();

/* ---------- contact form ---------- */
(function contactForm(){
  const form = document.getElementById("contact-form");
  if(!form) return;
  const status = document.getElementById("form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Sending…";
    status.className = "form-status";

    const data = new FormData(form);
    const endpoint = form.dataset.endpoint;

    // Uses Formspree (or any compatible form-POST endpoint) if configured.
    // See the setup note in contact.html for how to activate this.
    if(!endpoint || endpoint.includes("YOUR_FORM_ID")){
      status.textContent = "Form isn't wired up yet — see setup note below. You can email me directly meanwhile.";
      status.className = "form-status err";
      return;
    }

    try{
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      });
      if(res.ok){
        status.textContent = "Message sent — thanks! I'll reply soon.";
        status.className = "form-status ok";
        form.reset();
      } else {
        status.textContent = "Something went wrong. Please email me directly instead.";
        status.className = "form-status err";
      }
    } catch(err){
      status.textContent = "Network error — please email me directly instead.";
      status.className = "form-status err";
    }
  });
})();
