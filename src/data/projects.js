export const projectFilters = [
  { id: "all", label: "All Projects", count: 5 },
  { id: "ai", label: "AI Platforms", count: 2 },
  { id: "audio", label: "Audio & Speech", count: 2 },
  { id: "iot", label: "Embedded & IoT", count: 1 },
];

export const projects = [
  {
    id: "clyraai",
    index: "01",
    category: "AI Platform",
    filter: "ai",
    title: "ClyraAI",
    subtitle: "Unified AI Inference & Intelligence Platform",
    summary:
      "A single entry point for running, routing and observing LLM inference across local and hosted models — built so the model is never the bottleneck.",
    highlights: [
      "Unified inference gateway routing prompts across Ollama-hosted and cloud models.",
      "Streaming responses with token-level observability and latency budgets.",
      "Modular FastAPI services with Dockerised, reproducible deployment.",
    ],
    stack: ["Python", "FastAPI", "React", "Ollama", "LLMs", "Docker"],
    link: null,
    scenario: {
      trigger: "Chat request",
      metric: "410ms",
      metricLabel: "time to first token",
      safeguard:
        "If the local model stalls, the gateway retries against a hosted fallback and closes the stream with an explicit trace instead of a hanging socket.",
      steps: [
        {
          label: "Trigger",
          title: "Prompt arrives",
          detail:
            "The React client posts a typed prompt. The gateway attaches a request id, budget and a session-scoped trace before anything touches a model.",
          telemetry: "POST /v1/chat · session:warm · queue:0.4s",
        },
        {
          label: "Routing",
          title: "Cost-aware model selection",
          detail:
            "A router scores prompt complexity, then selects an Ollama-hosted model or a hosted API. Context, tools and prompt templates are assembled in one place.",
          telemetry: "route:cost-aware · model:qwen2.5:14b · fallback:hosted",
        },
        {
          label: "Outcome",
          title: "Streamed, traced answer",
          detail:
            "Tokens stream over SSE as structured events. Latency, token counts and routing decisions are emitted as telemetry alongside the response.",
          telemetry: "ttft:410ms · tokens:1.2k · trace:emitted",
        },
      ],
    },
    pipeline: [
      { stage: "Input", title: "Client requests", detail: "Prompts and documents arrive from the React client over a typed API." },
      { stage: "Inference", title: "Model routing", detail: "Ollama-hosted and cloud LLMs are selected per request by the FastAPI gateway." },
      { stage: "Processing", title: "Context assembly", detail: "Retrieval, tool calls and prompt templates are composed before inference." },
      { stage: "Output", title: "Streamed response", detail: "Token streams and structured JSON are returned with latency telemetry." },
    ],
  },
  {
    id: "zilooai",
    index: "02",
    category: "AI Platform",
    filter: "ai",
    title: "ZilooAI",
    subtitle: "AI-Powered Student Placement Ecosystem",
    summary:
      "A placement platform that matches students to roles with semantic search and LLM-driven fit scoring — live at zilooai.com.",
    highlights: [
      "Semantic candidate-role matching with pgvector embeddings.",
      "LLM fit scoring with explainable ranking signals.",
      "Redis-cached inference and PostgreSQL-backed candidate profiles.",
    ],
    stack: ["Python", "FastAPI", "React", "PostgreSQL", "Redis", "pgvector", "Docker", "LLMs"],
    link: "https://zilooai.com",
    scenario: {
      trigger: "Recruiter query",
      metric: "18ms",
      metricLabel: "vector retrieval",
      safeguard:
        "Candidate profiles are redacted before embedding, and every ranking returns the evidence behind its score so a recruiter can audit the shortlist.",
      steps: [
        {
          label: "Trigger",
          title: "Roles and profiles load",
          detail:
            "A recruiter query and candidate profiles are normalised into one schema. Redis serves the hot path while PostgreSQL remains the source of truth.",
          telemetry: "POST /v1/match · profiles:1.8k · cache:hit",
        },
        {
          label: "Retrieval",
          title: "Semantic candidate search",
          detail:
            "pgvector retrieves the closest candidate-role pairs with namespace and metadata filters, then reranks by explicit fit signals.",
          telemetry: "pgvector:cosine · k:40 · rerank:fit-v2",
        },
        {
          label: "Outcome",
          title: "Explainable shortlist",
          detail:
            "An LLM scores each match and returns reasoning attached to concrete profile evidence. The ranked shortlist is served as a versioned API contract.",
          telemetry: "shortlist:12 · reason:attached · p95:620ms",
        },
      ],
    },
    pipeline: [
      { stage: "Input", title: "Profiles & queries", detail: "Student profiles and recruiter queries are ingested and normalised." },
      { stage: "Retrieval", title: "Semantic search", detail: "pgvector embeddings retrieve the closest candidate-role pairs." },
      { stage: "Processing", title: "Fit scoring", detail: "LLMs score and rank matches with explainable reasoning." },
      { stage: "Output", title: "Ranked matches", detail: "Placement insights and ranked shortlists are served via FastAPI." },
    ],
  },
  {
    id: "autocluedj",
    index: "03",
    category: "Audio & Speech",
    filter: "audio",
    title: "AutoClueDJ",
    subtitle: "Intelligent Audio Analysis & DJ Cue Detection",
    summary:
      "Automated music analysis — beat detection, vocal separation and cue-point prediction that exports straight into Rekordbox.",
    highlights: [
      "Audio pipelines with FFmpeg, Librosa, Demucs and OpenCV.",
      "Random Forest cue prediction over beat-synchronised features.",
      "Rekordbox-compatible XML exported from async FastAPI services.",
    ],
    stack: ["Python", "Librosa", "FFmpeg", "Demucs", "OpenCV", "Random Forest", "FastAPI"],
    link: null,
    scenario: {
      trigger: "Track upload",
      metric: "4 stems",
      metricLabel: "separated per track",
      safeguard:
        "Corrupt or truncated files fail an audio checksum before separation. A failed stem never blocks the rest of the analysis pipeline.",
      steps: [
        {
          label: "Trigger",
          title: "Audio ingested",
          detail:
            "A track is uploaded and decoded with FFmpeg. Duration, sample rate and checksum are validated before any model work begins.",
          telemetry: "upload:track.wav · sr:44.1k · checksum:ok",
        },
        {
          label: "Analysis",
          title: "Stems and beats extracted",
          detail:
            "Demucs separates vocals and instrumentals while Librosa maps beats and OpenCV reads the waveform. Features are aligned to a shared beat grid.",
          telemetry: "demucs:htdemucs · bpm:128 · grid:aligned",
        },
        {
          label: "Outcome",
          title: "Cue points exported",
          detail:
            "A Random Forest predicts cue points from the beat-synchronised features, and async FastAPI workers write a Rekordbox-ready XML file.",
          telemetry: "cues:7 · export:rekordbox.xml · job:done",
        },
      ],
    },
    pipeline: [
      { stage: "Input", title: "Raw audio", detail: "Tracks are uploaded and decoded with FFmpeg." },
      { stage: "Separation", title: "Stem split", detail: "Demucs separates vocals from instrumentals." },
      { stage: "Analysis", title: "Cue prediction", detail: "Librosa beats, OpenCV waveforms and a Random Forest predict cue points." },
      { stage: "Output", title: "Rekordbox XML", detail: "Beat-synchronised cue markers are exported as Rekordbox XML." },
    ],
  },
  {
    id: "seleria",
    index: "04",
    category: "Audio & Speech",
    filter: "audio",
    title: "Seleria",
    subtitle: "AI-Powered Senthamil Translator",
    summary:
      "A speech-to-speech translator built for Tamil — Whisper for transcription, NLTK and prompt engineering for context-aware translation.",
    highlights: [
      "Whisper transcription chained with NLTK refinement.",
      "Context-aware Senthamil translation via prompt engineering.",
      "Speech processing, inference and translation wrapped in FastAPI.",
    ],
    stack: ["Python", "Whisper", "NLTK", "NLP", "FastAPI", "LLMs"],
    link: null,
    scenario: {
      trigger: "Tamil speech",
      metric: "1 pass",
      metricLabel: "speech to speech",
      safeguard:
        "Low-confidence transcripts are held back for a repeat instead of being translated into plausible-sounding nonsense.",
      steps: [
        {
          label: "Trigger",
          title: "Voice captured",
          detail:
            "Spoken Tamil is captured in the browser, trimmed and normalised into chunks small enough for responsive streaming.",
          telemetry: "audio:webm/opus · chunk:4.2s · lang:ta-IN",
        },
        {
          label: "Retrieval",
          title: "Transcription and context",
          detail:
            "Whisper transcribes each chunk while NLTK normalises the text. Idioms and context are resolved before the translation prompt is assembled.",
          telemetry: "asr:whisper-small · nltk:normalise · context:on",
        },
        {
          label: "Outcome",
          title: "Senthamil translation",
          detail:
            "A context-aware prompt produces literary Tamil, returned as both text and synthesised speech through a single FastAPI response.",
          telemetry: "translate:senthamil · tts:queued · latency:1.9s",
        },
      ],
    },
    pipeline: [
      { stage: "Input", title: "Speech audio", detail: "Spoken Tamil input is captured and pre-processed." },
      { stage: "Transcription", title: "ASR", detail: "Whisper transcribes speech to text." },
      { stage: "Translation", title: "Context-aware", detail: "NLTK and LLMs produce context-aware Senthamil translation." },
      { stage: "Output", title: "Speech & text", detail: "Translated speech and text are returned through FastAPI." },
    ],
  },
  {
    id: "smartdustbin",
    index: "05",
    category: "Embedded & IoT",
    filter: "iot",
    title: "Smart Dustbin",
    subtitle: "IoT-Based Intelligent Waste Monitoring",
    summary:
      "An IoT waste bin that senses fill level, transmits telemetry over GSM/GPS, and surfaces live status to a monitoring dashboard.",
    highlights: [
      "Ultrasonic sensors measure fill level on an Arduino (C/C++).",
      "GSM and GPS modules transmit telemetry and location.",
      "Live waste-level dashboard for municipal monitoring.",
    ],
    stack: ["Arduino", "C/C++", "Ultrasonic Sensors", "GSM", "GPS", "IoT"],
    link: null,
    scenario: {
      trigger: "Fill sensor",
      metric: "< 1m",
      metricLabel: "threshold alert",
      safeguard:
        "Debounced readings and a heartbeat state prevent a single bad sensor sample from triggering a false collection run.",
      steps: [
        {
          label: "Trigger",
          title: "Ultrasonic reading",
          detail:
            "An ultrasonic sensor measures fill level on a fixed cadence. Readings are filtered on-device before they are allowed to count.",
          telemetry: "sensor:hc-sr04 · distance:22cm · samples:5",
        },
        {
          label: "Analysis",
          title: "Threshold and debounce",
          detail:
            "Arduino firmware applies threshold and debounce logic in C/C++. A confirmed state change is the only thing that wakes the radio.",
          telemetry: "threshold:82% · debounce:3 · state:confirmed",
        },
        {
          label: "Outcome",
          title: "Located telemetry sent",
          detail:
            "GSM transmits fill level and GPS location to the monitoring dashboard, where municipal teams can route the next collection.",
          telemetry: "gsm:uplink · gps:fix · dashboard:live",
        },
      ],
    },
    pipeline: [
      { stage: "Input", title: "Sensor readings", detail: "Ultrasonic sensors measure bin fill level." },
      { stage: "Processing", title: "On-device logic", detail: "Arduino (C/C++) applies threshold and debouncing logic." },
      { stage: "Telemetry", title: "GSM / GPS", detail: "Fill level and location are transmitted over GSM/GPS." },
      { stage: "Output", title: "Live dashboard", detail: "A monitoring dashboard surfaces real-time waste status." },
    ],
  },
];
