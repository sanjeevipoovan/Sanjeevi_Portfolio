import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Play,
  ScanLine,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { projectFilters, projects } from "../data/projects";
import { resolveSkill } from "../data/stack";
import TechIcon from "./TechIcon";
import SectionHeading from "./SectionHeading";
import { EditorialSerifWord, HighlightedProse } from "./EditorialText";

type Lens = "scenario" | "overview";

function StackBadge({ name }: { name: string }) {
  const skill = resolveSkill(name);

  const jumpToStack = () => {
    if (!skill) return;
    document.getElementById("capabilities")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.dispatchEvent(new CustomEvent("cap:select", { detail: skill }));
  };

  return (
    <button
      type="button"
      onClick={jumpToStack}
      className="group/chip inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[10px] text-[#A1A1AA] transition-colors duration-300 hover:border-[#E11D48]/40 hover:text-[#F4F4F5]"
      title={skill ? `Open ${skill} in the stack web` : name}
    >
      <TechIcon name={name} size={11} />
      <span>{name}</span>
    </button>
  );
}

function LensSwitch({
  lens,
  onChange,
  size = "md",
  scope,
}: {
  lens: Lens;
  onChange: (lens: Lens) => void;
  size?: "sm" | "md";
  scope: string;
}) {
  const options: { id: Lens; label: string }[] = [
    { id: "scenario", label: "Scenario" },
    { id: "overview", label: "Overview" },
  ];

  return (
    <div
      role="group"
      aria-label="Display lens"
      className={`inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] p-0.5 ${
        size === "sm" ? "text-[8.5px]" : "text-[9.5px]"
      }`}
    >
      {options.map((option) => {
        const active = lens === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`relative rounded-full px-2.5 py-1 font-mono uppercase tracking-[0.14em] transition-colors duration-300 ${
              active ? "text-[#F4F4F5]" : "text-[#71717A] hover:text-[#A1A1AA]"
            }`}
          >
            {active ? (
              <motion.span
                layoutId={`lens-pill-${size}-${scope}`}
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#E11D48]/15 ring-1 ring-[#E11D48]/30"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            ) : null}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ScenarioLayer({
  project,
  onTracingChange,
}: {
  project: (typeof projects)[number];
  onTracingChange?: (tracing: boolean) => void;
}) {
  const scenario = project.scenario;
  const [stage, setStage] = useState(0);
  const [tracing, setTracing] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  const runFlow = () => {
    if (tracing) return;
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setStage(0);
    setTracing(true);
    onTracingChange?.(true);
    timers.current.push(
      window.setTimeout(() => setStage(1), 900),
      window.setTimeout(() => setStage(2), 1800),
      window.setTimeout(() => {
        setTracing(false);
        onTracingChange?.(false);
      }, 2900)
    );
  };

  const activeStep = scenario.steps[stage];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#71717A]">
          <Timer size={11} aria-hidden="true" className="text-[#E11D48]" />
          Execution trace
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#A1A1AA]">
          <b className="mr-1 font-medium text-[#F4F4F5]">{scenario.metric}</b>
          {scenario.metricLabel}
        </span>
      </div>

      <div
        role="group"
        aria-label={`${project.title} execution stages`}
        className="mt-3 grid grid-cols-3 gap-1"
      >
        {scenario.steps.map((step: { label: string }, index: number) => {
          const active = stage === index;
          return (
            <button
              key={step.label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                timers.current.forEach((timer) => window.clearTimeout(timer));
                setTracing(false);
                onTracingChange?.(false);
                setStage(index);
              }}
              className="relative rounded-md px-2 py-2 text-left transition-colors duration-300"
            >
              {active ? (
                <motion.span
                  layoutId={`stage-pill-${project.id}`}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-md border border-[#E11D48]/35 bg-[#E11D48]/10"
                  transition={{ type: "spring", stiffness: 420, damping: 38 }}
                />
              ) : null}
              <span
                className={`relative block font-mono text-[8.5px] uppercase tracking-[0.16em] ${
                  active ? "text-[#FB7185]" : "text-[#71717A]"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={`relative mt-0.5 block truncate text-[10px] font-medium ${
                  active ? "text-[#F4F4F5]" : "text-[#A1A1AA]"
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-2 h-px w-full overflow-hidden bg-white/[0.07]" aria-hidden="true">
        <motion.span
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#E11D48] to-[#FB7185]"
          animate={{ width: `${stage * 50}%` }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="mt-4 min-h-[92px]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
          >
            <h4 className="text-[13.5px] font-semibold text-[#F4F4F5]">
              {activeStep.title}
            </h4>
            <p className="mt-1.5 text-[12px] leading-relaxed text-[#A1A1AA]">
              {activeStep.detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 overflow-hidden rounded-md border border-white/[0.07] bg-[#08080A] px-2.5 py-2">
        <p className="truncate font-mono text-[9.5px] tabular-nums text-[#D4D4D8]">
          <span className="mr-1.5 text-[#E11D48]">$</span>
          {activeStep.telemetry}
        </p>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-md border border-white/[0.06] bg-white/[0.015] px-2.5 py-2.5">
        <ShieldCheck
          size={13}
          strokeWidth={1.7}
          aria-hidden="true"
          className="mt-px shrink-0 text-[#FB7185]"
        />
        <p className="font-mono text-[9px] leading-[1.6] text-[#71717A]">
          {scenario.safeguard}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={runFlow}
          disabled={tracing}
          className={`group/sim inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors duration-300 ${
            tracing
              ? "border-[#E11D48]/40 bg-[#E11D48]/10 text-[#FB7185]"
              : "border-white/[0.12] text-[#D4D4D8] hover:border-[#E11D48]/50 hover:text-white"
          }`}
        >
          {tracing ? (
            <ScanLine size={11} aria-hidden="true" />
          ) : (
            <Play size={10} aria-hidden="true" className="text-[#E11D48]" />
          )}
          {tracing ? "Tracing..." : "Simulate Flow"}
        </button>
        <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#71717A]">
          {String(stage + 1).padStart(2, "0")} / 03
        </span>
      </div>
    </div>
  );
}

function OverviewLayer({ project }: { project: (typeof projects)[number] }) {
  return (
    <div className="flex h-full flex-col">
      <p className="text-[12.5px] leading-relaxed text-[#A1A1AA]">{project.summary}</p>
      <ul className="mt-4 space-y-2">
        {project.highlights.map((highlight: string) => (
          <li key={highlight} className="group/item flex gap-2.5">
            <span
              aria-hidden="true"
              className="mt-[0.7em] h-px w-2.5 shrink-0 bg-[#E11D48] transition-all duration-300 ease-out group-hover/item:w-3.5 group-hover/item:bg-[#FB7185]"
            />
            <span className="text-[12px] leading-relaxed text-[#A1A1AA] transition-colors duration-300 group-hover/item:text-[#F4F4F5]">
              {highlight}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-[#71717A]">
        {project.category} · {project.index} / 05
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  lens,
}: {
  project: (typeof projects)[number];
  index: number;
  lens: Lens;
}) {
  const [cardLens, setCardLens] = useState<Lens>(lens);
  const [tracing, setTracing] = useState(false);
  const scenario = project.scenario;

  useEffect(() => setCardLens(lens), [lens]);

  const handleSpotlight = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--card-mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--card-my", `${event.clientY - rect.top}px`);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleSpotlight}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#0B0B0E] p-5 transition-colors duration-300 hover:border-white/[0.12] md:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(340px circle at var(--card-mx, 50%) var(--card-my, 0%), rgba(225, 29, 72, 0.10), transparent 72%)",
        }}
      />

      {tracing ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-[#E11D48]/70 to-transparent"
          initial={{ x: "-110%" }}
          animate={{ x: "260%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.2em]">
          <span className="text-[#E11D48]">{project.index}</span>
          <span aria-hidden="true" className="h-3 w-px bg-white/10" />
          <span className="text-[#71717A]">{project.category}</span>
        </div>
        <LensSwitch
          lens={cardLens}
          onChange={setCardLens}
          size="sm"
          scope={project.id}
        />
      </div>

      <h3 className="font-display-tight relative mt-4 text-[22px] font-bold text-[#F4F4F5]">
        {project.title}
      </h3>
      <p className="relative mt-1 text-[11.5px] text-[#A1A1AA]">{project.subtitle}</p>

      <div className="relative mt-5 grid flex-1">
        <div
          className={`col-start-1 row-start-1 transition-[opacity,visibility] duration-300 ${
            cardLens === "scenario" ? "visible opacity-100" : "invisible opacity-0"
          }`}
          aria-hidden={cardLens !== "scenario"}
        >
          <ScenarioLayer project={project} onTracingChange={setTracing} />
        </div>
        <div
          className={`col-start-1 row-start-1 transition-[opacity,visibility] duration-300 ${
            cardLens === "overview" ? "visible opacity-100" : "invisible opacity-0"
          }`}
          aria-hidden={cardLens !== "overview"}
        >
          <OverviewLayer project={project} />
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-1.5 border-t border-white/[0.06] pt-4">
        {project.stack.map((name: string) => (
          <StackBadge key={name} name={name} />
        ))}
      </div>

      {project.link ? (
        <a
          href={project.link}
          target="_blank"
          rel="noreferrer"
          className="relative mt-4 inline-flex items-center gap-1.5 self-start font-mono text-[9px] uppercase tracking-[0.16em] text-[#FB7185] transition-colors hover:text-white"
        >
          {project.link.replace(/^https?:\/\//, "")}
          <ArrowUpRight size={11} aria-hidden="true" />
        </a>
      ) : null}
    </motion.article>
  );
}

export default function PersonalProjectsSection() {
  const [filter, setFilter] = useState("all");
  const [lens, setLens] = useState<Lens>("scenario");

  const visible = projects.filter(
    (project) => filter === "all" || project.filter === filter
  );

  return (
    <section id="work" className="relative z-10 scroll-mt-[104px] md:scroll-mt-24">
      <div className="mx-auto max-w-[1360px] px-6 py-20 lg:px-10 lg:py-28">
        <SectionHeading
          index="01"
          label="Personal Projects"
          title={
            <>
              Selected <EditorialSerifWord>projects</EditorialSerifWord>, traced end to end
            </>
          }
          lede={
            <HighlightedProse
              text="Five shipped builds where the model is only half the story — the rest is routing, retrieval, latency and the guardrails around it."
              highlights={["retrieval", "guardrails"]}
            />
          }
        />

        <div className="mb-8 flex flex-col gap-4 border-b border-white/[0.07] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Project category" className="flex flex-wrap items-center gap-1.5">
            {projectFilters.map((option) => {
              const active = filter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(option.id)}
                  className={`relative rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${
                    active ? "text-white" : "text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="project-filter-pill"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-[#E11D48]"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  ) : null}
                  <span className="relative">
                    {option.label}{" "}
                    <span className="ml-1 font-mono text-[8.5px] text-current opacity-60">
                      {String(option.count).padStart(2, "0")}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 self-start">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#71717A]">
              Display lens
            </span>
            <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-[#0B0B0E] p-0.5">
              {(["scenario", "overview"] as Lens[]).map((option) => {
                const active = lens === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLens(option)}
                    className={`relative rounded-full px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                      active ? "text-white" : "text-[#71717A] hover:text-[#A1A1AA]"
                    }`}
                  >
                    {active ? (
                      <motion.span
                        layoutId="global-lens-pill"
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-[#E11D48]/15 ring-1 ring-[#E11D48]/30"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    ) : null}
                    <span className="relative">
                      {option === "scenario" ? "Scenario Flow" : "Overview"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          <div key={filter} className="grid gap-4 lg:grid-cols-2">
            {visible.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} lens={lens} />
            ))}
          </div>
        </AnimatePresence>

        <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.18em] text-[#71717A]">
          {String(visible.length).padStart(2, "0")} projects shown
          <span className="mx-2 text-[#E11D48]">·</span>
          stack tags link into the web below
        </p>
      </div>
    </section>
  );
}
