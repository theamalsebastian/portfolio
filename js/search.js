/* Search my work: a small in-page version of the hybrid ranking used in
   Job Search AI. Keyword rank (BM25) + concept rank (cosine over a
   hand-built concept map), merged with Reciprocal Rank Fusion (k = 60). */
(function hybridSearch() {
  const input = document.getElementById("q");
  if (!input) return;

  const DOCS = [
    { title: "AI Job Search Assistant", snippet: "Switching embeddings to FastEmbed on ONNX cut memory by 87%, enough to fit a 512 MB free-tier host.",
      text: "rag retrieval augmented generation job search hybrid bm25 dense retrieval vector search qdrant postgresql groq llama 3.3 fastapi nextjs fastembed onnx embeddings memory 512mb free tier 87% 400mb 50mb latency 1.5s live postings deployed vercel render" },
    { title: "EchoSign", snippet: "Camera frames stream over WebSockets to a CNN and MediaPipe pipeline, with under 100 ms of UI latency.",
      text: "echosign sign language recognition asl american real-time realtime video camera frames websocket streaming cnn mediapipe opencv tensorflow keras computer vision latency 100ms health check reconnection uptime free tier render deployed" },
    { title: "LastShot", snippet: "Groq answers first, and OpenRouter takes over automatically when rate limits hit.",
      text: "lastshot productivity companion hackathon vibe2ship react 19 vite groq llama openrouter fallback rate limits resilience llm deployed deadline" },
    { title: "Multi-tool research agent", snippet: "A LangGraph agent reaching its tools over MCP, traced in LangSmith.",
      text: "agent agents agentic langgraph create_react_agent tools mcp model context protocol groq tavily web search qdrant retrieval langsmith observability tracing" },
    { title: "AI writing tools sentiment", snippet: "Sentiment and engagement for Jasper, Copy.ai, Writesonic and Rytr from Reddit, YouTube and Product Hunt.",
      text: "sentiment engagement pipeline data reddit praw youtube data api product hunt graphql jasper copy.ai writesonic rytr python analysis" },
    { title: "Retrieval evaluation harness", snippet: "The reranker won on accuracy, but its memory cost broke the 512 MB hosting budget.",
      text: "evaluation eval_retrieval retrieval semantic hybrid bm25 dense reciprocal rank fusion rrf cross-encoder reranker reranking accuracy memory trade-off 512mb budget free tier hosting" },
    { title: "LoRA fine-tuning experiments", snippet: "Parameter-efficient fine-tuning with PEFT, plus quantisation of the EchoSign model.",
      text: "lora fine-tuning finetuning peft hugging face transformers parameter-efficient redis caching docker github actions ci cd quantization quantisation" },
    { title: "Azure AI-900 and AI-102", snippet: "Both Microsoft certifications passed in August 2025 during Infosys Foundation’s Finishing School.",
      text: "azure microsoft certified certification ai-900 ai-102 ai engineer associate fundamentals infosys foundation finishing school training computer vision nlp cognitive services cloud" },
    { title: "B.Tech, Computer Science", snippet: "Lourdes Matha College of Science and Technology, 2022–2026.",
      text: "btech b.tech computer science engineering degree college lourdes matha education data structures algorithms operating systems databases dbms networks software engineering" },
  ];

  // concept map: each concept is one dimension; words light it up
  const CONCEPTS = {
    memory: ["memory", "mb", "512mb", "ram", "footprint", "budget", "smaller", "lighter", "less", "onnx", "fastembed", "quantization", "quantisation", "fit", "free", "tier", "cost", "cheap"],
    speed: ["latency", "fast", "real-time", "realtime", "ms", "100ms", "speed", "quick", "websocket", "streaming", "live"],
    vision: ["vision", "video", "camera", "image", "frames", "sign", "asl", "gesture", "opencv", "mediapipe", "cnn", "hand"],
    search: ["search", "retrieval", "rag", "bm25", "dense", "vector", "qdrant", "rerank", "reranker", "reranking", "embeddings", "rank", "find"],
    llm: ["llm", "llms", "groq", "llama", "openrouter", "model", "gpt", "language", "generation", "chat"],
    reliability: ["fallback", "resilience", "rate", "limits", "limited", "uptime", "reconnection", "health", "failover", "outage", "reliable"],
    agents: ["agent", "agents", "agentic", "tools", "tool", "mcp", "langgraph", "tavily", "autonomous"],
    training: ["fine-tuning", "finetuning", "fine", "tuning", "lora", "peft", "train", "training", "adapt", "transformers"],
    cloud: ["azure", "cloud", "deploy", "deployed", "docker", "vercel", "render", "ci", "cd", "github", "actions", "production"],
    data: ["data", "pipeline", "sentiment", "reddit", "youtube", "graphql", "analysis", "engagement", "scrape"],
    credentials: ["certification", "certified", "certificate", "degree", "college", "course", "education", "exam", "infosys", "btech"],
    evaluation: ["evaluation", "eval", "measure", "benchmark", "accuracy", "trade-off", "compare", "test", "observability", "tracing"],
  };
  const DIMS = Object.keys(CONCEPTS);

  const tokenize = (s) => s.toLowerCase().replace(/[^a-z0-9.\-_ ]+/g, " ").split(/\s+/).filter((t) => t.length > 1);
  const STOP = new Set(["a", "an", "the", "in", "of", "to", "and", "or", "with", "for", "on", "my", "your", "how", "what", "when", "is", "it", "do", "does", "can"]);
  const terms = (s) => tokenize(s).filter((t) => !STOP.has(t));

  // BM25 index
  const docTerms = DOCS.map((d) => terms(d.title + " " + d.text));
  const avgdl = docTerms.reduce((n, t) => n + t.length, 0) / docTerms.length;
  const df = new Map();
  docTerms.forEach((ts) => new Set(ts).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  const N = DOCS.length, K1 = 1.4, B = 0.75;
  function bm25(q) {
    return docTerms.map((ts, i) => {
      let s = 0;
      for (const t of new Set(q)) {
        const f = ts.filter((x) => x === t).length;
        if (!f) continue;
        const idf = Math.log(1 + (N - df.get(t) + 0.5) / (df.get(t) + 0.5));
        s += idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * ts.length / avgdl));
      }
      return { i, s };
    }).filter((r) => r.s > 0).sort((a, b) => b.s - a.s);
  }

  // concept vectors
  const vec = (ts) => DIMS.map((d) => ts.reduce((n, t) => n + (CONCEPTS[d].includes(t) ? 1 : 0), 0));
  const norm = (v) => Math.sqrt(v.reduce((n, x) => n + x * x, 0)) || 1;
  const docVecs = docTerms.map(vec);
  function concept(q) {
    const qv = vec(q), qn = norm(qv);
    if (qv.every((x) => x === 0)) return [];
    return docVecs.map((dv, i) => ({ i, s: dv.reduce((n, x, k) => n + x * qv[k], 0) / (norm(dv) * qn) }))
      .filter((r) => r.s > 0.05).sort((a, b) => b.s - a.s);
  }

  function rrf(lists, k = 60) {
    const score = new Map();
    lists.forEach((list) => list.forEach((r, rank) => score.set(r.i, (score.get(r.i) || 0) + 1 / (k + rank + 1))));
    return [...score].map(([i, s]) => ({ i, s })).sort((a, b) => b.s - a.s);
  }

  const out = { fused: document.getElementById("rank-fused"), bm25: document.getElementById("rank-bm25"), dense: document.getElementById("rank-dense"), snippet: document.getElementById("rank-snippet") };
  function paint(el, list, digits, max) {
    el.innerHTML = "";
    if (!list.length) { const li = document.createElement("li"); li.className = "rank__empty"; li.textContent = "No match"; el.append(li); return; }
    list.slice(0, max).forEach((r, n) => {
      const li = document.createElement("li");
      li.className = "is-new"; li.style.setProperty("--n", n);
      const a = document.createElement("span"); a.className = "rank__doc"; a.textContent = DOCS[r.i].title;
      const b = document.createElement("span"); b.className = "rank__score"; b.textContent = r.s.toFixed(digits);
      li.append(a, b); el.append(li);
    });
  }
  function run() {
    const q = terms(input.value);
    const k = bm25(q), c = concept(q), f = rrf([k, c]);
    paint(out.fused, f, 3, 3);
    paint(out.bm25, k, 2, 4);
    paint(out.dense, c, 2, 4);
    out.snippet.textContent = f.length ? DOCS[f[0].i].snippet : "Nothing on this page matches yet. Try a tool name, such as FastAPI or Qdrant.";
  }

  let timer;
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(run, 120); syncChips(); });
  const chips = document.querySelectorAll(".chip");
  function syncChips() { chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.q === input.value))); }
  chips.forEach((chip) => chip.addEventListener("click", () => { input.value = chip.dataset.q; syncChips(); run(); }));
  syncChips();
  run();
})();
