import { useEffect, useMemo, useRef, useState } from "react";
import {
  RING_LAYERS,
  TOTAL_SKILLS,
  disciplines,
  getSkill,
  relatedSkills,
} from "../data/stack";
import HangingWeb from "./HangingWeb";
import SectionHeading from "./SectionHeading";
import TechIcon from "./TechIcon";
import {
  EditorialSerifWord,
  HighlightedProse,
  KineticMetricNumber,
} from "./EditorialText";

function useReducedMotion() {
  const [reduce, setReduce] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  return reduce;
}

function InspectorOverview({ filter, onFilter }) {
  return (
    <>
      <div className="capw-metrics">
        <div>
          <b>
            <KineticMetricNumber value={6} pad={2} />
          </b>
          <span>Disciplines</span>
        </div>
        <div>
          <b>
            <KineticMetricNumber value={TOTAL_SKILLS} pad={2} />
          </b>
          <span>Stack nodes</span>
        </div>
        <div>
          <b>
            <KineticMetricNumber value={3} pad={2} />
          </b>
          <span>Orb rings</span>
        </div>
      </div>
      <p className="capw-insp-copy">
        Three concentric rings hang from five ceiling anchors. Grab any node and the
        silk stretches, then springs back.
      </p>
      <div className="capw-insp-label">
        <span>Quick-jump anchors</span>
        <b>01—06</b>
      </div>
      <ul className="capw-jumps">
        {disciplines.map((discipline) => (
          <li key={discipline.id}>
            <button
              type="button"
              aria-pressed={filter === discipline.id}
              onClick={() => onFilter(discipline.id)}
            >
              <span className="capw-jump-num">{discipline.id}</span>
              <span>{discipline.title}</span>
              <em>{String(discipline.skills.length).padStart(2, "0")}</em>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function InspectorSkill({ skill, discipline, onSelect }) {
  const related = relatedSkills(skill.name);
  return (
    <>
      <button type="button" className="capw-back" onClick={() => onSelect(null)}>
        <span aria-hidden="true">←</span> Overview
      </button>
      <div className="capw-sel-head">
        <span className="capw-sel-icon">
          <TechIcon name={skill.icon} size={19} />
        </span>
        <div>
          <span className="capw-sel-disc">
            {discipline.id} · {discipline.title}
          </span>
          <h3 className="capw-sel-name">{skill.name}</h3>
        </div>
      </div>
      <div className="capw-sel-meta">
        <span className="capw-ring-badge">{RING_LAYERS[skill.ring]}</span>
        <span className="capw-ring-num">R{skill.ring + 1} / 03</span>
      </div>
      <p className="capw-sel-role">{skill.role}</p>
      <div className="capw-insp-label">
        <span>Connected silk</span>
        <b>{String(related.length).padStart(2, "0")}</b>
      </div>
      <ul className="capw-links">
        {related.map((name) => {
          const target = getSkill(name);
          return (
            <li key={name}>
              <button type="button" onClick={() => onSelect(name)}>
                {target ? <TechIcon name={target.icon} size={11} /> : null}
                <span>{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function Capabilities() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [breeze, setBreeze] = useState(!reduce);
  const apiRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.matchMedia("(max-width: 760px)").matches) return;
    canvas.scrollLeft = Math.max(0, (canvas.scrollWidth - canvas.clientWidth) / 2);
  }, []);

  useEffect(() => {
    if (reduce) setBreeze(false);
  }, [reduce]);

  useEffect(() => {
    const handler = (event) => {
      const name = event?.detail;
      if (!name) return;
      setFilter(null);
      setSelected(name);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => apiRef.current?.pluck());
      });
    };
    window.addEventListener("cap:select", handler);
    return () => window.removeEventListener("cap:select", handler);
  }, []);

  const skill = useMemo(() => (selected ? getSkill(selected) : null), [selected]);
  const discipline = useMemo(
    () => (skill ? disciplines.find((entry) => entry.id === skill.discipline) : null),
    [skill]
  );

  const toggleFilter = (id) => setFilter((current) => (current === id ? null : id));

  const resetWeb = () => {
    apiRef.current?.reset();
    setSelected(null);
    setHovered(null);
    setFilter(null);
  };

  return (
    <section className="section capabilities" id="capabilities">
      <div className="mx-auto max-w-[1360px] px-6 lg:px-10">
        <SectionHeading
          index="03"
          label="Capabilities"
          title={
            <>
              The <EditorialSerifWord>stack</EditorialSerifWord> I ship with
            </>
          }
          lede={
            <HighlightedProse
              text="Chosen for production, not for demos — Python at the core, FastAPI at the edge, and safety wrapped around every model call. Hover a node to trace its cross-stack silk."
              highlights={["Python", "FastAPI", "safety"]}
            />
          }
        />

        <div className="capw-tools">
          <div className="capw-actions">
            <button
              type="button"
              className="capw-action"
              onClick={() => apiRef.current?.pluck()}
            >
              Pluck Web
            </button>
            <button
              type="button"
              className="capw-action"
              aria-pressed={breeze}
              disabled={reduce}
              title={
                reduce
                  ? "Ambient breeze is disabled by your reduced-motion preference"
                  : "Toggle ambient breeze"
              }
              onClick={() => setBreeze((on) => !on)}
            >
              {breeze ? "Breeze On" : "Breeze Off"}
            </button>
            <button type="button" className="capw-action" onClick={resetWeb}>
              Reset Web
            </button>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#71717A]">
            {TOTAL_SKILLS} nodes
            <span className="mx-2 text-[#E11D48]">·</span>
            15 spokes
            <span className="mx-2 text-[#E11D48]">·</span>
            3 rings
          </span>
        </div>

        <div className="capw-filters" role="group" aria-label="Filter by discipline">
          <button
            type="button"
            className="capw-filter"
            aria-pressed={!filter}
            onClick={() => setFilter(null)}
          >
            All <b>({String(TOTAL_SKILLS).padStart(2, "0")})</b>
          </button>
          {disciplines.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="capw-filter"
              aria-pressed={filter === entry.id}
              onClick={() => toggleFilter(entry.id)}
            >
              <b>{entry.id}</b> {entry.title}
            </button>
          ))}
        </div>

        <div className="capw-body">
          <div className="capw-canvas" ref={canvasRef}>
            <HangingWeb
              apiRef={apiRef}
              breeze={breeze}
              filter={filter}
              selected={selected}
              hovered={hovered}
              onSelect={setSelected}
              onHover={setHovered}
              onFilter={toggleFilter}
            />
            <div className="capw-caption">
              <span>5 ceiling anchors · 15 radial spokes · 3 concentric orb rings</span>
              <em>Drag a node · click to inspect</em>
            </div>
          </div>

          <aside className="capw-inspector" aria-live="polite">
            <div className="capw-insp-top">
              <span>Inspector</span>
              <span className="capw-insp-live">
                <i aria-hidden="true" /> silk live
              </span>
            </div>
            {skill && discipline ? (
              <InspectorSkill
                skill={skill}
                discipline={discipline}
                onSelect={setSelected}
              />
            ) : (
              <InspectorOverview filter={filter} onFilter={toggleFilter} />
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
