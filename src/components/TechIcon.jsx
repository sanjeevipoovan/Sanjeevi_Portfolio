import {
  Antenna,
  AudioLines,
  BookText,
  Blocks,
  Bot,
  Boxes,
  Braces,
  Camera,
  Coffee,
  Cpu,
  Database,
  Eye,
  EyeOff,
  FileSearch,
  Gem,
  Globe,
  HardDrive,
  HardDriveDownload,
  Image as ImageIcon,
  MapPin,
  MemoryStick,
  Mic,
  Music2,
  Navigation,
  PenLine,
  Radar,
  Signal,
  SlidersHorizontal,
  Sparkles,
  Split,
  Trees,
  Video,
  Wifi,
  Layers,
  MessageSquareText,
  Minimize2,
  Network,
  PanelsTopLeft,
  RadioTower,
  ScanText,
  ServerCog,
  ShieldCheck,
  TimerReset,
  Workflow,
} from "lucide-react";
// Simple Icons brand marks, pulled in as raw SVGs so the dev graph stays small.
import arduinoSvg from "simple-icons/icons/arduino.svg?raw";
import cSvg from "simple-icons/icons/c.svg?raw";
import cplusplusSvg from "simple-icons/icons/cplusplus.svg?raw";
import deepgramSvg from "simple-icons/icons/deepgram.svg?raw";
import dockerSvg from "simple-icons/icons/docker.svg?raw";
import fastapiSvg from "simple-icons/icons/fastapi.svg?raw";
import ffmpegSvg from "simple-icons/icons/ffmpeg.svg?raw";
import gitSvg from "simple-icons/icons/git.svg?raw";
import githubSvg from "simple-icons/icons/github.svg?raw";
import huggingfaceSvg from "simple-icons/icons/huggingface.svg?raw";
import jupyterSvg from "simple-icons/icons/jupyter.svg?raw";
import ollamaSvg from "simple-icons/icons/ollama.svg?raw";
import opencvSvg from "simple-icons/icons/opencv.svg?raw";
import openjdkSvg from "simple-icons/icons/openjdk.svg?raw";
import postgresqlSvg from "simple-icons/icons/postgresql.svg?raw";
import pydanticSvg from "simple-icons/icons/pydantic.svg?raw";
import pythonSvg from "simple-icons/icons/python.svg?raw";
import reactSvg from "simple-icons/icons/react.svg?raw";
import pytorchSvg from "simple-icons/icons/pytorch.svg?raw";
import redisSvg from "simple-icons/icons/redis.svg?raw";
import scikitlearnSvg from "simple-icons/icons/scikitlearn.svg?raw";
import sqlalchemySvg from "simple-icons/icons/sqlalchemy.svg?raw";
import streamlitSvg from "simple-icons/icons/streamlit.svg?raw";
import typescriptSvg from "simple-icons/icons/typescript.svg?raw";

function brandPath(svg) {
  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((match) => match[1]);
  return paths.join(" ");
}

const BRANDS = {
  arduino: brandPath(arduinoSvg),
  deepgram: brandPath(deepgramSvg),
  ffmpeg: brandPath(ffmpegSvg),
  ollama: brandPath(ollamaSvg),
  opencv: brandPath(opencvSvg),
  react: brandPath(reactSvg),
  python: brandPath(pythonSvg),
  typescript: brandPath(typescriptSvg),
  c: brandPath(cSvg),
  cplusplus: brandPath(cplusplusSvg),
  openjdk: brandPath(openjdkSvg),
  pytorch: brandPath(pytorchSvg),
  huggingface: brandPath(huggingfaceSvg),
  scikitlearn: brandPath(scikitlearnSvg),
  fastapi: brandPath(fastapiSvg),
  pydantic: brandPath(pydanticSvg),
  postgresql: brandPath(postgresqlSvg),
  redis: brandPath(redisSvg),
  sqlalchemy: brandPath(sqlalchemySvg),
  docker: brandPath(dockerSvg),
  git: brandPath(gitSvg),
  github: brandPath(githubSvg),
  jupyter: brandPath(jupyterSvg),
  streamlit: brandPath(streamlitSvg),
};

// Official brand colours (from simple-icons). A few brands ship a black mark
// that would vanish on the obsidian canvas, so those use a readable variant.
const BRAND_COLORS = {
  arduino: "#00878F",
  c: "#A8B9CC",
  cplusplus: "#00599C",
  deepgram: "#13EF93",
  docker: "#2496ED",
  fastapi: "#009688",
  ffmpeg: "#007808",
  git: "#F03C2E",
  github: "#E6E6E6",
  huggingface: "#FFD21E",
  jupyter: "#F37626",
  openjdk: "#F89820",
  opencv: "#5C3EE8",
  pydantic: "#E92063",
  postgresql: "#4169E1",
  python: "#3776AB",
  pytorch: "#EE4C2C",
  react: "#61DAFB",
  redis: "#FF4438",
  scikitlearn: "#F7931E",
  sqlalchemy: "#D71F00",
  streamlit: "#FF4B4B",
  typescript: "#3178C6",
  vscode: "#007ACC",
};

const TECHNICAL = {
  antenna: Antenna,
  camera: Camera,
  computervision: Eye,
  cpu: Cpu,
  database: Database,
  gem: Gem,
  globe: Globe,
  gps: Navigation,
  gsm: Signal,
  imageprocessing: ImageIcon,
  iot: Cpu,
  librosa: Music2,
  ltx: Video,
  memory: MemoryStick,
  mic: Mic,
  multiagent: Bot,
  nltk: BookText,
  opensource: Globe,
  persistent: MemoryStick,
  pgvector: Database,
  prompt: PenLine,
  radar: Radar,
  randomforest: Trees,
  speech: Mic,
  split: Split,
  ultrasonic: Radar,
  wifi: Wifi,
  llms: Sparkles,
  rag: FileSearch,
  agents: Bot,
  nlp: MessageSquareText,
  finetuning: SlidersHorizontal,
  network: Network,
  whisper: AudioLines,
  ocr: ScanText,
  guardrails: ShieldCheck,
  pii: EyeOff,
  quantization: Minimize2,
  local: HardDriveDownload,
  context: PanelsTopLeft,
  uvicorn: ServerCog,
  sse: RadioTower,
  rest: Braces,
  vectors: Boxes,
  microservices: Blocks,
  caching: Layers,
  events: Workflow,
  async: TimerReset,
};

// Custom VS Code ribbon — Simple Icons no longer ships the mark.
function VsCodeRibbon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 100 100" fill={color} aria-hidden="true" focusable="false">
      <path
        fillRule="evenodd"
        d="M76 6 46 33 22 13 8 21v58l14 8 24-20 30 27 16-10V16L76 6Zm0 22v44L52 50l24-22Z"
      />
      <path d="M22 40v20l14-10-14-10Z" />
    </svg>
  );
}

export function normalizeIconName(name) {
  const key = String(name ?? "").trim().toLowerCase();
  const ALIASES = {
    "c/c++": "cplusplus",
    "c++": "cplusplus",
    "random forest": "randomforest",
    "multi-agent systems": "multiagent",
    "multi agent systems": "multiagent",
    "model fine-tuning": "finetuning",
    "fine-tuning": "finetuning",
    "open-source ai models": "opensource",
    "computer vision": "computervision",
    "image processing": "imageprocessing",
    "context processing": "context",
    "persistent memory": "persistent",
    "speech ai": "speech",
    "prompt engineering": "prompt",
    "ultrasonic sensors": "ultrasonic",
    "sqlalchemy 2.0": "sqlalchemy",
    "sse streaming": "sse",
    "scikit-learn": "scikitlearn",
    "scikitlearn": "scikitlearn",
    "hugging face": "huggingface",
    "vs code": "vscode",
    "pii redaction": "pii",
    "model quantization": "quantization",
    "local llm deployment": "local",
    "context window optimisation": "context",
    "rest apis": "rest",
    "rest api": "rest",
    "vector databases": "vectors",
    "caching strategies": "caching",
    "event-driven architecture": "events",
    "asynchronous processing": "async",
    "whisper": "whisper",
  };
  if (ALIASES[key]) return ALIASES[key];
  const slug = key.replace(/[^a-z0-9]+/g, "");
  if (BRANDS[slug] || TECHNICAL[slug]) return slug;
  if (ALIASES[slug]) return ALIASES[slug];
  return slug;
}

export default function TechIcon({ name, size = 14, className = "" }) {
  const key = normalizeIconName(name);
  const style = { width: size, height: size };
  const cls = `tech-icon ${className}`.trim();

  if (key === "vscode") {
    return <VsCodeRibbon style={style} className={cls} color={BRAND_COLORS.vscode} />;
  }

  const path = BRANDS[key];
  if (path) {
    return (
      <svg style={style} viewBox="0 0 24 24" className={cls} role="presentation" focusable="false">
        <path d={path} fill={BRAND_COLORS[key] || "currentColor"} />
      </svg>
    );
  }

  const Icon = TECHNICAL[key] || Coffee;
  return <Icon size={size} strokeWidth={1.8} className={cls} aria-hidden="true" />;
}
