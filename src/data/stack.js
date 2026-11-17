// Tech stack data for the Capabilities section.
// `ring` is derived from the order: the first N skills sit on the inner ring,
// then the runtime ring, then the outermost infrastructure ring.
export const RING_LAYERS = [
  "Inner Core Ring",
  "Production Runtime Ring",
  "Edge & Infrastructure Ring",
];

export const disciplines = [
  {
    id: "01",
    key: "languages",
    title: "Languages",
    short: "Languages",
    rings: [1, 2, 3],
    skills: [
      { name: "Python", icon: "python", role: "Primary language for model serving, evaluation scripts and data pipelines." },
      { name: "TypeScript", icon: "typescript", role: "Typed glue for streaming clients and API contracts." },
      { name: "SQL", icon: "database", role: "Query planning, indexing and the joins that keep retrieval honest." },
      { name: "Java", icon: "openjdk", role: "Service-layer work where typed concurrency and JVM tooling win." },
      { name: "C++", icon: "cplusplus", role: "Performance-critical preprocessing and native inference bindings." },
      { name: "C", icon: "c", role: "Memory-level work behind tokenisers and quantised kernels." },
    ],
  },
  {
    id: "02",
    key: "ai",
    title: "AI / Machine Learning",
    short: "AI / ML",
    rings: [2, 3, 6],
    skills: [
      { name: "LLMs", icon: "llms", role: "Grounded generation with explicit budgets, rubrics and fallbacks." },
      { name: "RAG", icon: "rag", role: "Retrieval pipelines that cite the source or refuse to answer." },
      { name: "AI Agents", icon: "agents", role: "Tool-using agents with human-in-the-loop checkpoints." },
      { name: "NLP", icon: "nlp", role: "Tokenisation, normalisation and Tamil-aware text handling." },
      { name: "PyTorch", icon: "pytorch", role: "Training loops, fine-tuning runs and inference benchmarks." },
      { name: "Transformers", icon: "huggingface", role: "Attention-level work: context packing, KV cache and adapters." },
      { name: "Fine-tuning", icon: "finetuning", role: "LoRA and instruction tuning evaluated against a held-out set." },
      { name: "Scikit-learn", icon: "scikitlearn", role: "Classical baselines, feature selection and honest metrics." },
      { name: "CNN · RNN · LSTM", icon: "network", role: "Sequence and vision backbones for pre-LLM pipelines." },
      { name: "Whisper", icon: "whisper", role: "Speech-to-text for Tamil and English with chunked streaming." },
      { name: "OCR", icon: "ocr", role: "Document ingestion with layout-aware text extraction." },
    ],
  },
  {
    id: "03",
    key: "llmops",
    title: "LLMOps & Security",
    short: "LLMOps",
    rings: [1, 2, 2],
    skills: [
      { name: "Guardrails", icon: "guardrails", role: "Input and output policies that fail closed, never open." },
      { name: "PII redaction", icon: "pii", role: "Redaction before logs, prompts and vector stores." },
      { name: "Model quantization", icon: "quantization", role: "4-bit and 8-bit paths that fit the target hardware." },
      { name: "Local LLM deployment", icon: "local", role: "Private inference on constrained, offline machines." },
      { name: "Context window optimisation", icon: "context", role: "Compaction, truncation and caching to fit the budget." },
    ],
  },
  {
    id: "04",
    key: "backend",
    title: "Backend & APIs",
    short: "Backend",
    rings: [1, 3, 4],
    skills: [
      { name: "FastAPI", icon: "fastapi", role: "Typed endpoints, dependency injection and async handlers." },
      { name: "Pydantic", icon: "pydantic", role: "Schemas that reject malformed model output at the boundary." },
      { name: "Uvicorn", icon: "uvicorn", role: "Worker tuning, graceful shutdown and request timeouts." },
      { name: "SSE streaming", icon: "sse", role: "Token streaming that survives proxies and slow clients." },
      { name: "PostgreSQL", icon: "postgresql", role: "Relational truth for users, runs and audit trails." },
      { name: "REST APIs", icon: "rest", role: "Versioned contracts with predictable error shapes." },
      { name: "Redis", icon: "redis", role: "Rate limits, hot-path cache and short-lived session state." },
      { name: "SQLAlchemy 2.0", icon: "sqlalchemy", role: "Async ORM sessions and migrations without N+1s." },
    ],
  },
  {
    id: "05",
    key: "systems",
    title: "System Design",
    short: "Systems",
    rings: [1, 1, 3],
    skills: [
      { name: "Vector databases", icon: "vectors", role: "Embedding indexes with namespace and metadata filters." },
      { name: "Microservices", icon: "microservices", role: "Bounded contexts with explicit, versioned interfaces." },
      { name: "Caching strategies", icon: "caching", role: "Freshness budgets, invalidation and stampede control." },
      { name: "Event-driven architecture", icon: "events", role: "Queues and outbox patterns for durable side effects." },
      { name: "Asynchronous processing", icon: "async", role: "Background jobs, retries and idempotent consumers." },
    ],
  },
  {
    id: "06",
    key: "tooling",
    title: "Tooling",
    short: "Tooling",
    rings: [1, 2, 3],
    skills: [
      { name: "Docker", icon: "docker", role: "Reproducible images with slim, pinned runtime layers." },
      { name: "Git", icon: "git", role: "Branch hygiene and reviewable, atomic commits." },
      { name: "GitHub", icon: "github", role: "CI checks, PR gates and issue-linked releases." },
      { name: "Jupyter", icon: "jupyter", role: "Notebook spikes that get promoted into tested modules." },
      { name: "Streamlit", icon: "streamlit", role: "Fast internal tools for evaluating model behaviour." },
      { name: "VS Code", icon: "vscode", role: "Debug configs, remote containers and a tuned workspace." },
    ],
  },
];

export const TOTAL_SKILLS = disciplines.reduce((sum, d) => sum + d.skills.length, 0);

export const skillIndex = new Map();
for (const discipline of disciplines) {
  let cursor = 0;
  discipline.rings.forEach((count, ring) => {
    for (let i = 0; i < count; i += 1) {
      const skill = discipline.skills[cursor + i];
      if (!skill) return;
      skillIndex.set(skill.name, { ...skill, ring, discipline: discipline.id });
    }
    cursor += count;
  });
}

export function getSkill(name) {
  return skillIndex.get(name) || null;
}

// Undirected cross-stack relationships — each pair is rendered as one crimson silk filament.
const relationMap = {
  Python: ["PyTorch", "LLMs", "FastAPI", "Pydantic", "SQLAlchemy 2.0", "Scikit-learn"],
  TypeScript: ["REST APIs", "AI Agents", "Event-driven architecture", "Caching strategies"],
  SQL: ["PostgreSQL", "Vector databases", "SQLAlchemy 2.0", "Caching strategies"],
  Java: ["Microservices", "REST APIs", "Event-driven architecture", "Asynchronous processing"],
  "C++": ["Model quantization", "Local LLM deployment", "CNN · RNN · LSTM"],
  C: ["Model quantization", "Local LLM deployment", "Docker"],
  LLMs: ["RAG", "AI Agents", "Fine-tuning", "Guardrails", "PII redaction", "SSE streaming", "Transformers"],
  RAG: ["Vector databases", "Guardrails", "PII redaction", "PostgreSQL", "Caching strategies", "Context window optimisation"],
  "AI Agents": ["Guardrails", "Event-driven architecture", "Asynchronous processing", "Microservices"],
  NLP: ["Transformers", "Whisper", "OCR", "Fine-tuning", "LLMs"],
  PyTorch: ["Fine-tuning", "Transformers", "CNN · RNN · LSTM", "Model quantization", "Whisper"],
  Transformers: ["Fine-tuning", "NLP", "LLMs", "Model quantization", "Local LLM deployment"],
  "Fine-tuning": ["Model quantization", "Local LLM deployment", "LLMs"],
  "Scikit-learn": ["CNN · RNN · LSTM", "NLP", "Jupyter"],
  "CNN · RNN · LSTM": ["PyTorch", "Transformers", "OCR", "Scikit-learn"],
  Whisper: ["NLP", "Transformers", "Local LLM deployment", "SSE streaming"],
  OCR: ["NLP", "CNN · RNN · LSTM", "PII redaction", "Python"],
  Guardrails: ["LLMs", "AI Agents", "PII redaction", "Pydantic"],
  "PII redaction": ["PostgreSQL", "Fine-tuning", "OCR", "Guardrails"],
  "Model quantization": ["PyTorch", "Fine-tuning", "Local LLM deployment", "C++"],
  "Local LLM deployment": ["Model quantization", "Transformers", "Docker", "Context window optimisation"],
  "Context window optimisation": ["LLMs", "RAG", "Guardrails", "Caching strategies", "Local LLM deployment"],
  FastAPI: ["Python", "Pydantic", "Uvicorn", "SSE streaming", "REST APIs", "SQLAlchemy 2.0"],
  Pydantic: ["Guardrails", "REST APIs", "Python"],
  Uvicorn: ["Docker", "Asynchronous processing", "SSE streaming"],
  "SSE streaming": ["REST APIs", "Asynchronous processing", "Uvicorn", "LLMs"],
  PostgreSQL: ["SQLAlchemy 2.0", "SQL", "FastAPI", "Vector databases", "RAG"],
  "REST APIs": ["Pydantic", "Microservices", "SSE streaming", "TypeScript"],
  Redis: ["Caching strategies", "Asynchronous processing", "FastAPI", "Docker", "Event-driven architecture"],
  "SQLAlchemy 2.0": ["PostgreSQL", "SQL", "FastAPI", "Pydantic"],
  "Vector databases": ["RAG", "PostgreSQL", "SQL", "Microservices", "Caching strategies"],
  Microservices: ["REST APIs", "Docker", "Event-driven architecture", "Asynchronous processing", "Java"],
  "Caching strategies": ["Redis", "Vector databases", "Asynchronous processing", "RAG", "TypeScript"],
  "Event-driven architecture": ["Microservices", "Asynchronous processing", "Redis", "AI Agents", "Java"],
  "Asynchronous processing": ["SSE streaming", "Microservices", "Redis", "Event-driven architecture", "Uvicorn"],
  Docker: ["FastAPI", "Uvicorn", "Microservices", "Local LLM deployment", "GitHub"],
  Git: ["GitHub", "VS Code", "Docker", "Jupyter"],
  GitHub: ["Git", "Docker", "VS Code", "Streamlit"],
  Jupyter: ["Python", "Scikit-learn", "PyTorch", "Git", "Streamlit"],
  Streamlit: ["Python", "FastAPI", "Jupyter", "Scikit-learn"],
  "VS Code": ["Git", "GitHub", "Jupyter", "Python", "TypeScript"],
};

// Build one canonical, deduplicated filament list: [a, b] with a < b alphabetically.
export const filaments = (() => {
  const seen = new Set();
  const pairs = [];
  for (const [from, targets] of Object.entries(relationMap)) {
    for (const to of targets) {
      if (!skillIndex.has(to) || !skillIndex.has(from) || from === to) continue;
      const key = from < to ? `${from}|${to}` : `${to}|${from}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push(key.split("|"));
    }
  }
  return pairs;
})();

const relatedMap = (() => {
  const map = new Map();
  for (const [a, b] of filaments) {
    if (!map.has(a)) map.set(a, []);
    if (!map.has(b)) map.set(b, []);
    map.get(a).push(b);
    map.get(b).push(a);
  }
  return map;
})();

export function relatedSkills(name) {
  return relatedMap.get(name) || [];
}

// Map a capability label (possibly with spaces/suffixes) to an exact skill name in the web.
const SKILL_ALIASES = {
  SSE: "SSE streaming",
  "SSE streaming": "SSE streaming",
  SQLAlchemy: "SQLAlchemy 2.0",
  "SQLAlchemy 2.0": "SQLAlchemy 2.0",
  "Fine-tuning": "Fine-tuning",
  "Model Fine-Tuning": "Fine-tuning",
  "Multi-Agent Systems": "AI Agents",
  "C/C++": "C++",
  "Context Processing": "Context window optimisation",
  "Context": "Context window optimisation",
  "Scikit-learn": "Scikit-learn",
  "Scikitlearn": "Scikit-learn",
};

export function resolveSkill(name) {
  if (!name) return null;
  const direct = [...skillIndex.keys()].find(
    (key) => key.toLowerCase() === String(name).trim().toLowerCase()
  );
  if (direct) return direct;
  const alias = SKILL_ALIASES[String(name).trim()];
  if (alias && skillIndex.has(alias)) return alias;
  return null;
}
