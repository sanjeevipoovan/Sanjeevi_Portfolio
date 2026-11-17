export const profile = {
  name: "Sanjeevi Kumar P",
  firstName: "Sanjeevi",
  lastName: "Kumar",
  role: "AI Engineer",
  email: "iamsanjeevikumar.dev@gmail.com",
  phone: "+91 73589 96769",
  location: "Tamil Nadu, India",
  summary:
    "I design and ship production LLM systems — retrieval that stays grounded, agents that hold a conversation, and APIs fast enough that it still feels like one. Currently building AI features at Scalabox Technology.",
  meta: [
    { k: "Status", v: "Open to AI engineering roles" },
    { k: "Based in", v: "Tamil Nadu, India" },
    { k: "Focus", v: "RAG · Agents · Voice AI" },
    { k: "Now", v: "Fine-tuning & LLM evaluation" },
  ],
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/sanjeevi-kumar-p/", handle: "/in/sanjeevi-kumar-p" },
    { label: "GitHub", href: "https://github.com/sanjeevipoovan", handle: "@sanjeevipoovan" },
    { label: "LeetCode", href: "https://leetcode.com/u/sanjeevi_644/", handle: "/u/sanjeevi_644" },
  ],
};

export const navLinks = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#about", label: "About" },
];

export const tickerItems = [
  "Large Language Models",
  "Retrieval-Augmented Generation",
  "Multi-agent systems",
  "FastAPI",
  "PyTorch",
  "Voice AI",
  "Vector databases",
  "Guardrails",
  "Model quantization",
  "Local inference",
];

export const projects = [
  {
    title: "Conversia AI",
    kicker: "Multi-agent career simulator",
    year: "2025",
    visual: "agents",
    summary:
      "An AI career simulator that runs interviews, group discussions and coding rounds — with agents that can hand off to each other mid-conversation.",
    points: [
      "Built multi-agent workflows integrating RAG, resume analysis and conversational memory.",
      "Added real-time voice interaction and modular FastAPI workflows for candidate evaluation.",
    ],
    tags: ["Python", "LangChain", "RAG", "Voice AI", "FastAPI"],
  },
  {
    title: "AutoClueDJ",
    kicker: "Intelligent DJ cue detection",
    year: "2025",
    visual: "audio",
    summary:
      "Automated music analysis: beat detection, vocal separation and cue-point prediction that exports straight into Rekordbox.",
    points: [
      "Assembled audio pipelines with FFmpeg, Librosa, Demucs and OpenCV, with a Random Forest for cue prediction.",
      "Streamed beat-synchronised cue markers and Rekordbox-compatible XML from async FastAPI services.",
    ],
    tags: ["Librosa", "Demucs", "OpenCV", "Random Forest", "FastAPI"],
  },
  {
    title: "Seleria",
    kicker: "AI-powered Senthamil translator",
    year: "2025",
    visual: "language",
    summary:
      "A speech-to-speech translator built for Tamil — Whisper for transcription, NLTK and prompt engineering for translation that respects context.",
    points: [
      "Chained Whisper transcription with NLTK refinement for context-aware Senthamil translation.",
      "Wrapped speech processing, inference and translation in FastAPI services.",
    ],
    tags: ["Whisper", "NLTK", "LLMs", "Prompt engineering", "FastAPI"],
  },
];

export const experience = [
  {
    role: "AI Developer Intern",
    company: "Scalabox Technology",
    place: "Dharmapuri",
    period: "Jul 2026 — Present",
    points: [
      "Fine-tuning specialised LLMs to improve application inference quality and response accuracy.",
      "Developing AI-driven features for automated LinkedIn profile building and optimisation.",
      "Running application testing, debugging, error analysis and AI-based system troubleshooting.",
    ],
    stack: ["Python", "Fine-tuning", "LLM evaluation", "NLP"],
  },
  {
    role: "AI Engineer Intern",
    company: "SpaceMarvel AI",
    place: "Bangalore",
    period: "Apr 2026 — Jun 2026",
    points: [
      "Built a context-aware multi-agent assistant with live transcription, human-in-the-loop approval and RAG-based processing.",
      "Shipped FastAPI services with SSE streaming, PostgreSQL, Redis, Docker and Deepgram speech-to-text.",
    ],
    stack: ["FastAPI", "SSE", "PostgreSQL", "Redis", "Docker", "Deepgram"],
  },
];

export const skillGroups = [
  {
    title: "Languages",
    items: ["Python", "Java", "C", "C++", "TypeScript", "SQL"],
  },
  {
    title: "AI / Machine Learning",
    items: [
      "LLMs",
      "RAG",
      "AI Agents",
      "NLP",
      "PyTorch",
      "Scikit-learn",
      "Transformers",
      "CNN · RNN · LSTM",
      "Whisper",
      "OCR",
      "Fine-tuning",
    ],
  },
  {
    title: "LLMOps & Security",
    items: [
      "Local LLM deployment",
      "Model quantization",
      "Context window optimisation",
      "Guardrails",
      "PII redaction",
    ],
  },
  {
    title: "Backend & APIs",
    items: [
      "FastAPI",
      "Uvicorn",
      "SSE streaming",
      "REST APIs",
      "Pydantic",
      "PostgreSQL",
      "Redis",
      "SQLAlchemy 2.0",
    ],
  },
  {
    title: "System Design",
    items: [
      "Event-driven architecture",
      "Microservices",
      "Asynchronous processing",
      "Vector databases",
      "Caching strategies",
    ],
  },
  {
    title: "Tooling",
    items: ["Docker", "Git", "GitHub", "Jupyter", "Streamlit", "VS Code"],
  },
];

export const education = [
  {
    school: "Sona College of Technology",
    period: "2022 — 2026",
    degree: "B.E. Computer Science and Engineering (AI & ML)",
    score: "CGPA 7.3 / 10",
  },
  {
    school: "Paramveer Matric Hr. Sec. School",
    period: "2020 — 2021",
    degree: "Higher Secondary Certificate",
    score: "86.13%",
  },
];

export const achievements = [
  {
    title: "Winner — Sona Vervathon 2025",
    detail: "First place at a 24-hour national hackathon.",
  },
  {
    title: "Smart India Hackathon",
    detail: "National-level participant, 2023 – 2025.",
  },
];
