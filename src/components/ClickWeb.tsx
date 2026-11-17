import { useEffect, useMemo, useState } from "react";

interface ClickWebMark {
  id: number;
  x: number;
  y: number;
}

const SPOKES = 12;
const RINGS = 6;
const RADIUS = 100;

function buildWeb() {
  const spokes: string[] = [];
  const rings: string[] = [];
  const knots: { x: number; y: number }[] = [];

  for (let i = 0; i < SPOKES; i += 1) {
    const angle = (i / SPOKES) * Math.PI * 2 - Math.PI / 2;
    spokes.push(
      `M0 0 L${(Math.cos(angle) * RADIUS).toFixed(1)} ${(Math.sin(angle) * RADIUS).toFixed(1)}`
    );
  }

  for (let ring = 1; ring <= RINGS; ring += 1) {
    const radius = RADIUS * Math.pow(ring / RINGS, 1.08);
    for (let i = 0; i < SPOKES; i += 1) {
      const a0 = (i / SPOKES) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((i + 1) / SPOKES) * Math.PI * 2 - Math.PI / 2;
      const x0 = Math.cos(a0) * radius;
      const y0 = Math.sin(a0) * radius;
      const x1 = Math.cos(a1) * radius;
      const y1 = Math.sin(a1) * radius;
      const midAngle = (a0 + a1) / 2;
      const sag = radius * 0.9;
      const cx = Math.cos(midAngle) * sag;
      const cy = Math.sin(midAngle) * sag;
      rings.push(
        `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(
          1
        )} ${y1.toFixed(1)}`
      );

      if (ring === 2 || ring === 4 || ring === RINGS) {
        knots.push({ x: Number(x0.toFixed(1)), y: Number(y0.toFixed(1)) });
      }
    }
  }

  return { spokes, rings, knots };
}

export default function ClickWeb() {
  const [marks, setMarks] = useState<ClickWebMark[]>([]);
  const geometry = useMemo(buildWeb, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let id = 0;
    const timers: number[] = [];

    const onPointerDown = (event: PointerEvent) => {
      if (reduced.matches) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      id += 1;
      const mark = { id, x: event.clientX, y: event.clientY };
      setMarks((current) => [...current.slice(-3), mark]);
      timers.push(
        window.setTimeout(() => {
          setMarks((current) => current.filter((item) => item.id !== mark.id));
        }, 1150)
      );
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
    >
      {marks.map((mark) => (
        <div
          key={mark.id}
          className="clickweb"
          style={{ left: mark.x - 110, top: mark.y - 110 }}
        >
          <svg viewBox="-110 -110 220 220" className="h-[220px] w-[220px]" fill="none">
            <circle
              cx="0"
              cy="0"
              r="2.4"
              fill="rgba(225,29,72,0.9)"
              className="clickweb-core"
            />
            {geometry.spokes.map((d, index) => (
              <path
                key={`s-${index}`}
                d={d}
                stroke="rgba(225,29,72,0.55)"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            ))}
            {geometry.rings.map((d, index) => (
              <path
                key={`r-${index}`}
                d={d}
                stroke="rgba(251,113,133,0.42)"
                strokeWidth="0.7"
                strokeLinecap="round"
              />
            ))}
            {geometry.knots.map((knot, index) => (
              <circle
                key={`k-${index}`}
                cx={knot.x}
                cy={knot.y}
                r="0.85"
                fill="rgba(255,255,255,0.75)"
              />
            ))}
          </svg>
        </div>
      ))}
    </div>
  );
}
