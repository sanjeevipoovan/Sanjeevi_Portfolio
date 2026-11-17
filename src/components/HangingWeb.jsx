import { useEffect, useMemo, useRef, useState } from "react";
import { TOTAL_SKILLS, relatedSkills } from "../data/stack";
import { WebEngine, tensionFor } from "../lib/webEngine";
import { BEAM, CENTER, ORBIT, STAGE, buildLayout } from "../lib/webLayout";
import TechIcon from "./TechIcon";

const SAG = { spoke: 0.42, ring: 0.62, tether: 0.32, sector: 0.36, suspension: 0.03, guy: 0.02 };

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function strandPath(strand, nodes) {
  let d = "";
  for (const seg of strand.segs) {
    const a = nodes[seg.a];
    const b = nodes[seg.b];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const tension = tensionFor(seg.base, len);
    const sag = Math.min(9, len * 0.05) * (SAG[strand.kind] ?? 0.3) * (1 - tension * 0.85);
    d += `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${((a.x + b.x) / 2).toFixed(1)} ${(
      (a.y + b.y) / 2 +
      sag
    ).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

export default function HangingWeb({
  breeze,
  filter,
  selected,
  hovered,
  onSelect,
  onHover,
  onFilter,
  apiRef,
}) {
  const layout = useMemo(() => buildLayout(), []);
  const engineRef = useRef(null);
  if (!engineRef.current) {
    engineRef.current = new WebEngine(layout, { breeze });
  }
  const engine = engineRef.current;

  const stageRef = useRef(null);
  const nodeEls = useRef(new Map());
  const pathEls = useRef([]);
  const filEls = useRef(new Map());
  const dragRef = useRef(null);
  const suppressUntil = useRef(0);
  const wakeRef = useRef(() => {});
  const splashId = useRef(0);
  const [splashes, setSplashes] = useState([]);

  const active = hovered || selected;

  const relatedSet = useMemo(() => {
    if (!active) return null;
    return new Set([active, ...relatedSkills(active)]);
  }, [active]);

  const filamentLinks = useMemo(() => {
    if (!active) return [];
    return relatedSkills(active)
      .filter((name) => layout.nameIndex.has(name))
      .map((name) => {
        const key = [active, name].sort().join("|");
        const h = hashString(key);
        return {
          key,
          a: active,
          b: name,
          bow: (h % 2 === 0 ? 1 : -1) * (10 + (h % 14)),
        };
      });
  }, [active, layout]);

  useEffect(() => {
    engine.setBreeze(breeze);
  }, [breeze, engine]);

  useEffect(() => {
    wakeRef.current();
  }, [filamentLinks]);

  useEffect(() => {
    if (!apiRef) return undefined;
    apiRef.current = {
      pluck: () => engine.pluckWeb(),
      reset: () => engine.reset(),
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, engine]);

  useEffect(() => {
    const stage = stageRef.current;
    const svg = stage?.querySelector(".capw-svg");
    if (!stage || !svg) return undefined;

    const domNodes = [];
    for (const node of engine.nodes) {
      const el = nodeEls.current.get(node.id);
      if (el) domNodes.push({ node, el });
    }

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let visible = true;

    const paint = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const scale = Math.min(w / STAGE.w, h / STAGE.h) || 1;
      const ox = (w - STAGE.w * scale) / 2;
      const oy = (h - STAGE.h * scale) / 2;
      const nodes = engine.nodes;
      stage.style.setProperty("--s", scale.toFixed(4));
      stage.dataset.ready = "true";

      for (let i = 0; i < layout.paths.length; i += 1) {
        const el = pathEls.current[i];
        if (el) el.setAttribute("d", strandPath(layout.paths[i], nodes));
      }

      for (const { node, el } of domNodes) {
        el.style.transform = `translate3d(${(ox + node.x * scale).toFixed(2)}px, ${(
          oy + node.y * scale
        ).toFixed(2)}px, 0)`;
      }

      for (const [key, el] of filEls.current) {
        const [aName, bName] = key.split("|");
        const ai = layout.nameIndex.get(aName);
        const bi = layout.nameIndex.get(bName);
        if (ai == null || bi == null) continue;
        const a = nodes[ai];
        const b = nodes[bi];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const dir = (hashString(key) % 2 === 0 ? 1 : -1) * (10 + (hashString(key) % 14));
        const cx = (a.x + b.x) / 2 + (-dy / len) * dir;
        const cy = (a.y + b.y) / 2 + (dx / len) * dir + len * 0.04;
        el.setAttribute(
          "d",
          `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(
            1
          )} ${b.y.toFixed(1)}`
        );
      }
    };

    const loop = (now) => {
      raf = 0;
      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      acc += delta;
      let steps = 0;
      while (acc >= 1 / 60 && steps < 4) {
        engine.step(1 / 60);
        acc -= 1 / 60;
        steps += 1;
      }
      if (acc > 0.12) acc = 0;

      paint();

      if (!visible) return;
      if (!engine.breeze && engine.isSettled()) return;
      raf = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (!visible || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    wakeRef.current = wake;
    engine.wake = wake;

    paint();
    raf = requestAnimationFrame(loop);

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              visible = entries.some((entry) => entry.isIntersecting);
              if (visible) wake();
            },
            { threshold: 0.05 }
          )
        : null;
    observer?.observe(stage);

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) wake();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(() => paint()) : null;
    resizeObserver?.observe(stage);

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      observer?.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [engine, layout]);

  const toStage = (event) => {
    const rect = stageRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * STAGE.w,
      y: ((event.clientY - rect.top) / rect.height) * STAGE.h,
    };
  };

  const handleDown = (node) => (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    const p = toStage(event);
    const live = engine.nodes[layout.index.get(node.id)];
    dragRef.current = {
      id: node.id,
      name: node.name,
      kind: node.kind,
      disc: node.disc,
      offsetX: (live?.x ?? 0) - p.x,
      offsetY: (live?.y ?? 0) - p.y,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    engine.beginDrag(node.id);
    wakeRef.current();
  };

  const handleMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (
      !drag.moved &&
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4
    ) {
      drag.moved = true;
    }
    const p = toStage(event);
    engine.moveDrag(drag.id, p.x + drag.offsetX, p.y + drag.offsetY);
  };

  const handleUp = () => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.moved) suppressUntil.current = performance.now() + 260;
    engine.endDrag(drag.id);
    dragRef.current = null;
  };

  const handleStageDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest?.(".capw-node")) return;
    const p = toStage(event);
    engine.pluckAt(p.x, p.y);
    const id = splashId.current + 1;
    splashId.current = id;
    setSplashes((prev) => [...prev.slice(-4), { id, x: p.x, y: p.y }]);
    window.setTimeout(() => {
      setSplashes((prev) => prev.filter((s) => s.id !== id));
    }, 900);
    wakeRef.current();
  };

  const handleClick = (node) => () => {
    if (performance.now() < suppressUntil.current) return;
    if (node.kind === "sector") {
      engine.pluckNode(node.id);
      onFilter(node.disc);
      return;
    }
    if (node.kind === "hub") {
      onSelect(null);
      return;
    }
    engine.pluckNode(node.id);
    onSelect(selected === node.name ? null : node.name);
  };

  const htmlNodes = layout.nodes.filter(
    (node) => node.kind === "skill" || node.kind === "sector" || node.kind === "hub"
  );

  return (
    <div
      className="capw-stage"
      ref={stageRef}
      data-focus={filter || ""}
      role="group"
      aria-label="Interactive hanging spider web of the engineering stack"
      onPointerDown={handleStageDown}
    >
      <svg
        className="capw-svg"
        viewBox={`0 0 ${STAGE.w} ${STAGE.h}`}
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="capwBeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="18%" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="82%" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          <radialGradient id="capwHub" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(225,29,72,0.22)" />
            <stop offset="100%" stopColor="rgba(225,29,72,0)" />
          </radialGradient>
        </defs>

        <g className="capw-orbits" aria-hidden="true">
          {[0.4, 0.68, 1].map((factor) => (
            <ellipse
              key={factor}
              cx={CENTER.x}
              cy={CENTER.y}
              rx={ORBIT.rx * factor}
              ry={ORBIT.ry * factor}
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="0.7"
              strokeDasharray="2 7"
            />
          ))}
        </g>

        <circle cx={CENTER.x} cy={CENTER.y} r="182" fill="url(#capwHub)" opacity="0.5" />

        <g className="capw-beam">
          <line
            x1={BEAM.x1}
            y1={BEAM.y}
            x2={BEAM.x2}
            y2={BEAM.y}
            stroke="url(#capwBeam)"
            strokeWidth="1"
          />
          <line
            x1={BEAM.x1}
            y1={BEAM.y + 7}
            x2={BEAM.x2}
            y2={BEAM.y + 7}
            stroke="rgba(255,255,255,0.045)"
            strokeWidth="1"
          />
          {layout.anchors.map((anchor) => (
            <g key={anchor.id}>
              <circle cx={anchor.x} cy={anchor.y} r="5.2" fill="#0d0d11" stroke="rgba(255,255,255,0.34)" />
              <circle cx={anchor.x} cy={anchor.y} r="1.8" fill="#e11d48" />
            </g>
          ))}
        </g>

        <g className="capw-pins">
          {layout.guys.map((guy) => (
            <g key={guy.id}>
              <path
                d={`M${guy.x - 4} ${guy.y}h8M${guy.x} ${guy.y - 4}v8`}
                stroke="rgba(255,255,255,0.24)"
                strokeWidth="1"
              />
              <circle cx={guy.x} cy={guy.y} r="1.6" fill="rgba(251,113,133,0.8)" />
            </g>
          ))}
        </g>

        <g className="capw-strands">
          {layout.paths.map((strand, i) => (
            <path
              key={strand.id}
              data-strand={strand.kind}
              data-dim={
                strand.name && relatedSet
                  ? !relatedSet.has(strand.name)
                  : filter && strand.disc
                    ? strand.disc !== filter
                    : undefined
              }
              data-active={
                strand.name && relatedSet && relatedSet.has(strand.name)
                  ? "true"
                  : undefined
              }
              data-ring={strand.ring}
              className={`capw-strand capw-strand--${strand.kind}`}
              ref={(el) => {
                pathEls.current[i] = el;
              }}
            />
          ))}
        </g>

        <g className="capw-filaments">
          {filamentLinks.map((link) => (
            <path
              key={link.key}
              className="capw-filament"
              ref={(el) => {
                if (el) filEls.current.set(link.key, el);
                else filEls.current.delete(link.key);
              }}
            />
          ))}
        </g>
      </svg>

      <svg
        className="capw-svg capw-splash-layer"
        viewBox={`0 0 ${STAGE.w} ${STAGE.h}`}
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {splashes.map((splash) => (
          <g key={splash.id} transform={`translate(${splash.x.toFixed(1)} ${splash.y.toFixed(1)})`}>
            <g className="capw-splash">
              <circle r="10" />
              <circle r="22" />
              <circle r="36" />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const angle = (i * Math.PI) / 4;
                return (
                  <line
                    key={i}
                    x1={(Math.cos(angle) * 5).toFixed(2)}
                    y1={(Math.sin(angle) * 5).toFixed(2)}
                    x2={(Math.cos(angle) * 46).toFixed(2)}
                    y2={(Math.sin(angle) * 46).toFixed(2)}
                  />
                );
              })}
            </g>
          </g>
        ))}
      </svg>

      <div className="capw-nodes">
        {htmlNodes.map((node) => {
          const dim =
            node.kind === "skill" &&
            (relatedSet
              ? !relatedSet.has(node.name)
              : filter && node.disc && node.disc !== filter);
          const isSkill = node.kind === "skill";
          const common = {
            type: "button",
            className: "capw-node",
            "data-kind": node.kind,
            "data-disc": node.disc,
            "data-dim": dim ? "true" : undefined,
            "data-selected": isSkill && selected === node.name ? "true" : undefined,
            style: {
              "--ox": ((node.dirX ?? 0) * (node.off ?? 0)).toFixed(2),
              "--oy": ((node.dirY ?? 0) * (node.off ?? 0)).toFixed(2),
              "--off": (node.off ?? 0).toFixed(2),
              "--angle": `${Math.atan2(node.dirY ?? 0, node.dirX ?? 0)}rad`,
            },
            ref: (el) => {
              if (el) nodeEls.current.set(node.id, el);
              else nodeEls.current.delete(node.id);
            },
            onPointerDown: handleDown(node),
            onPointerMove: handleMove,
            onPointerUp: handleUp,
            onPointerCancel: handleUp,
            onClick: handleClick(node),
            onPointerEnter: () => {
              if (!isSkill) return;
              engine.pluckNode(node.id);
              onHover(node.name);
            },
            onPointerLeave: () => {
              if (isSkill && !dragRef.current) onHover(null);
            },
          };

          if (node.kind === "hub") {
            return (
              <button
                {...common}
                key={node.id}
                aria-label={`Core Stack hub, ${TOTAL_SKILLS} capability nodes. Drag to move the web.`}
              >
                <span className="capw-hub">
                  <span className="capw-hub-kicker">Core Stack</span>
                  <strong className="capw-hub-count">{TOTAL_SKILLS}</strong>
                  <span className="capw-hub-sub">nodes</span>
                </span>
              </button>
            );
          }

          if (node.kind === "sector") {
            return (
              <button
                {...common}
                key={node.id}
                aria-label={`Filter by ${node.title}, ${node.count} capabilities`}
                aria-pressed={filter === node.disc}
              >
                <span className="capw-node-body capw-node-body--sector">
                  <span className="capw-node-num">{node.num}</span>
                  <span className="capw-node-label">{node.short}</span>
                </span>
              </button>
            );
          }

          return (
            <button
              {...common}
              key={node.id}
              aria-pressed={selected === node.name}
              aria-label={`${node.name}, ${node.discTitle}. Drag to pluck the silk.`}
            >
              <span className="capw-node-body">
                <TechIcon name={node.icon} size={13.5} className="capw-node-icon" />
                <span className="capw-node-label">{node.name}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="capw-aura" aria-hidden="true" />
    </div>
  );
}
