export const companies = [
  {
    id: "spacemarvel",
    name: "SpaceMarvel AI",
    role: "AI Engineer Intern",
    place: "Bangalore",
    period: "April 2026 – June 2026",
    shipped: 2,
    summary:
      "Built production conversational and multi-agent AI systems — streaming backends, RAG grounding and human-in-the-loop approval under real traffic.",
    projects: [
      {
        id: "p1",
        title: "Project 01 — Conversational AI Chatbot",
        contributions: [
          "Designed and shipped a conversational AI chatbot backend with RAG-grounded responses.",
          "Implemented SSE streaming over FastAPI for low-latency token delivery.",
          "Backed conversation state with PostgreSQL and Redis for persistence and caching.",
          "Containerised services with Docker for reproducible deployment.",
        ],
        stack: ["Python", "FastAPI", "SSE", "RAG", "PostgreSQL", "Redis", "Docker", "Pydantic"],
      },
      {
        id: "p2",
        title: "Project 02 — Whisper AI: Context-Aware Multi-Agent Assistant",
        contributions: [
          "Built a multi-agent assistant with live transcription and human-in-the-loop approval.",
          "Integrated Deepgram speech-to-text and RAG-based context processing.",
          "Implemented persistent memory across sessions for continuity.",
          "Orchestrated agent handoffs with context-aware routing.",
        ],
        stack: [
          "Python",
          "FastAPI",
          "Deepgram",
          "RAG",
          "Multi-Agent Systems",
          "Speech AI",
          "Context Processing",
          "Persistent Memory",
          "LLMs",
          "Prompt Engineering",
        ],
      },
    ],
  },
  {
    id: "scalabox",
    name: "Scalabox Technology",
    role: "AI Developer Intern",
    place: "Dharmapuri",
    period: "July 2026 – Present",
    shipped: 3,
    summary:
      "Shipping AI features end to end — LLM fine-tuning, profile intelligence, video generation and mobile visual systems.",
    projects: [
      {
        id: "p1",
        title: "Project 01 — LinkedIn Profile Builder & Fixer",
        contributions: [
          "Developed AI-driven features for automated LinkedIn profile building and optimisation.",
          "Applied prompt engineering and LLM fine-tuning for profile quality.",
          "Shipped Streamlit-based tooling for internal workflows.",
        ],
        stack: ["Python", "LLMs", "Prompt Engineering", "Model Fine-Tuning", "Streamlit", "Pydantic"],
      },
      {
        id: "p2",
        title: "Project 02 — AI Video Generation Studio",
        contributions: [
          "Built an AI video generation pipeline integrating LTX and Gemma models.",
          "Fine-tuned LLMs and open-source AI models for domain-specific output.",
          "Optimised inference with PyTorch and model quantization.",
        ],
        stack: ["Python", "FastAPI", "LTX", "Gemma", "PyTorch", "Open-Source AI Models", "Model Fine-Tuning"],
      },
      {
        id: "p3",
        title: "Project 03 — Mobile Browser Visual Intelligence System",
        contributions: [
          "Developed computer vision and image processing pipelines for mobile browsers.",
          "Applied PyTorch models for on-device visual intelligence.",
          "Integrated real-time analysis with FastAPI backends.",
        ],
        stack: ["Python", "FastAPI", "PyTorch", "Computer Vision", "Image Processing"],
      },
    ],
  },
];
