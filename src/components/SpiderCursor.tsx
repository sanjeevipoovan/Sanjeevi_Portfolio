import { useEffect, useRef, useState } from "react";
import { CHANGE_EVENT, readCursorEnabled } from "../web/cursorPreference";
import {
  PROSONA_X,
  computeSpiderLegs,
  createSpiderState,
  stepSpiderState,
} from "../web/spiderCursorKinematics";

// 64x64 local art. The precision bead at (0, 0) is the exact pointer hotspot;
// the prosoma sits at PROSONA_X (-13) ahead of the trailing abdomen.
const VIEW_X = 52;
const VIEW_Y = 32;
const LEG_COUNT = 8;

const EYES: [number, number, number][] = [
  [3.4, -2.0, 0.42],
  [3.4, 2.0, 0.42],
  [4.6, -1.2, 0.36],
  [4.6, 1.2, 0.36],
  [5.3, -0.4, 0.3],
  [5.3, 0.4, 0.3],
  [2.4, -1.4, 0.28],
  [2.4, 1.4, 0.28],
];

export default function SpiderCursor() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const spiderRef = useRef<SVGGElement | null>(null);
  const dragRef = useRef<SVGPathElement | null>(null);
  const femurRimRefs = useRef<(SVGPathElement | null)[]>([]);
  const femurCoreRefs = useRef<(SVGPathElement | null)[]>([]);
  const tarsusRefs = useRef<(SVGPathElement | null)[]>([]);

  const [enabled, setEnabled] = useState(readCursorEnabled);
  const [eligible, setEligible] = useState(false);
  const active = enabled && eligible;

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEligible(finePointer.matches && !reducedMotion.matches);
    update();
    finePointer.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      finePointer.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const syncPreference = (event: Event) => {
      setEnabled(Boolean((event as CustomEvent<boolean>).detail));
    };
    const syncStorage = () => setEnabled(readCursorEnabled());

    window.addEventListener(CHANGE_EVENT, syncPreference as EventListener);
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, syncPreference as EventListener);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const root = document.documentElement;

    if (!active) {
      svg.style.opacity = "0";
      root.classList.remove("spider-cursor-active");
      return;
    }

    const pointer = {
      x: typeof window === "undefined" ? -120 : window.innerWidth * 0.5,
      y: typeof window === "undefined" ? -120 : window.innerHeight * 0.4,
      hovering: false,
      strikeUntil: 0,
      visible: false,
    };

    const state = createSpiderState(pointer.x, pointer.y);
    let raf = 0;
    let lastTime = performance.now();

    const show = (x: number, y: number) => {
      svg.style.transform = `translate3d(${x - VIEW_X}px, ${y - VIEW_Y}px, 0)`;
      if (!pointer.visible) {
        pointer.visible = true;
        svg.style.opacity = "1";
        root.classList.add("spider-cursor-active");
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      show(pointer.x, pointer.y);
    };

    const onPointerDown = () => {
      pointer.strikeUntil = performance.now() + 170;
    };

    const isInteractive = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest(
          'a, button, [role="button"], input, textarea, select, summary, [data-cursor-hover]'
        )
      );
    };

    const onPointerOver = (event: PointerEvent) => {
      pointer.hovering = isInteractive(event.target);
    };

    const onPointerLeave = () => {
      pointer.visible = false;
      svg.style.opacity = "0";
      root.classList.remove("spider-cursor-active");
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      stepSpiderState(
        state,
        dt,
        pointer.x,
        pointer.y,
        pointer.hovering,
        now < pointer.strikeUntil
      );

      const legs = computeSpiderLegs(state);
      for (let i = 0; i < LEG_COUNT; i += 1) {
        const leg = legs[i];
        const rim = femurRimRefs.current[i];
        const core = femurCoreRefs.current[i];
        const claw = tarsusRefs.current[i];
        if (rim) rim.setAttribute("d", leg.femurPath);
        if (core) core.setAttribute("d", leg.femurPath);
        if (claw) claw.setAttribute("d", leg.tarsusPath);
      }

      const lagX = Math.max(-11, Math.min(11, state.x - state.targetX));
      const lagY = Math.max(-11, Math.min(11, state.y - state.targetY));
      const angle = (state.angle * 180) / Math.PI;

      spiderRef.current?.setAttribute(
        "transform",
        `translate(${(PROSONA_X + lagX).toFixed(2)} ${lagY.toFixed(
          2
        )}) rotate(${angle.toFixed(2)})`
      );

      const drag = dragRef.current;
      if (drag) {
        const sway = Math.sin(timeSeconds(now)) * 1.8 - state.vy * 0.012;
        const length = 9 + Math.min(8, state.speed * 0.008);
        const startX = -20.5;
        const endX = startX - length;
        drag.setAttribute(
          "d",
          `M${startX} 0 C${(startX - 4).toFixed(1)} ${(sway * 0.35).toFixed(
            1
          )} ${(endX + 4).toFixed(1)} ${(sway * 0.8).toFixed(1)} ${endX.toFixed(
            1
          )} ${sway.toFixed(1)}`
        );
      }

      raf = window.requestAnimationFrame(loop);
    };

    raf = window.requestAnimationFrame(loop);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      root.classList.remove("spider-cursor-active");
      svg.style.opacity = "0";
    };
  }, [active]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      viewBox="-52 -32 64 64"
      className="pointer-events-none fixed left-0 top-0 z-[100] h-16 w-16"
      style={{
        opacity: 0,
        willChange: "transform",
        transition: "opacity 0.18s ease-out",
        transform: "translate3d(-100px, -100px, 0)",
      }}
    >
      <defs>
        <radialGradient id="spiderAbdomen" cx="34%" cy="30%" r="85%">
          <stop offset="0%" stopColor="#2b2b33" />
          <stop offset="48%" stopColor="#141419" />
          <stop offset="100%" stopColor="#08080a" />
        </radialGradient>
        <radialGradient id="spiderCarapace" cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#33333c" />
          <stop offset="60%" stopColor="#121218" />
          <stop offset="100%" stopColor="#09090c" />
        </radialGradient>
        <radialGradient id="spiderHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(8,8,10,0.62)" />
          <stop offset="100%" stopColor="rgba(8,8,10,0)" />
        </radialGradient>
      </defs>

      <g ref={spiderRef} transform="translate(-13 0) rotate(0)">
        <ellipse cx="-8" cy="0" rx="19" ry="13" fill="url(#spiderHalo)" />

        <path
          ref={dragRef}
          fill="none"
          stroke="rgba(228,228,231,0.24)"
          strokeWidth="0.6"
          strokeDasharray="3 4"
          strokeLinecap="round"
        />

        {Array.from({ length: LEG_COUNT }).map((_, index) => (
          <g key={`leg-${index}`}>
            <path
              ref={(el) => {
                femurRimRefs.current[index] = el;
              }}
              fill="none"
              stroke="#F4F4F5"
              strokeOpacity="0.45"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={(el) => {
                femurCoreRefs.current[index] = el;
              }}
              fill="none"
              stroke="#181820"
              strokeWidth="1.45"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={(el) => {
                tarsusRefs.current[index] = el;
              }}
              fill="none"
              stroke="#E4E4E7"
              strokeOpacity="0.88"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}

        <path
          d="M-6 0 C-6 -5 -9 -7.5 -13 -7.5 C-18 -7.5 -21 -4 -21 0 C-21 4 -18 7.5 -13 7.5 C-9 7.5 -6 5 -6 0 Z"
          fill="url(#spiderAbdomen)"
          stroke="rgba(228,228,231,0.34)"
          strokeWidth="0.55"
        />
        <path
          d="M-15 -2.7 L-10.5 -2.7 L-12.6 0 L-10.5 2.7 L-15 2.7 L-12.9 0 Z"
          fill="#E11D48"
          opacity="0.66"
        />
        <path
          d="M-15 -2.7 L-10.5 -2.7 L-12.6 0 L-10.5 2.7 L-15 2.7 L-12.9 0 Z"
          fill="none"
          stroke="rgba(251,113,133,0.42)"
          strokeWidth="0.3"
        />
        <circle cx="-17.4" cy="-4.2" r="0.7" fill="rgba(255,255,255,0.24)" />

        <path
          d="M-5.4 0 C-4.2 -1.2 -2.6 -1.4 -1.8 -0.6 C-1.8 0.6 -2.6 1.4 -3.8 1.2 C-4.6 1 -5.2 0.6 -5.4 0 Z"
          fill="#0d0d12"
          stroke="rgba(228,228,231,0.16)"
          strokeWidth="0.4"
        />

        <path
          d="M-4.2 2.2 C-1 1.4 2.4 2.2 3.2 4.4 C0.6 4.8 -2.4 4.2 -4.2 2.2 Z"
          fill="none"
          stroke="rgba(228,228,231,0.42)"
          strokeWidth="0.85"
          strokeLinecap="round"
        />
        <path
          d="M-1.8 -3.4 C1.2 -3.8 4 -2.8 4.8 -1.2 C2.2 -0.8 -0.4 -1.8 -1.8 -3.4 Z"
          fill="none"
          stroke="rgba(228,228,231,0.32)"
          strokeWidth="0.7"
          strokeLinecap="round"
        />

        <path
          d="M-3.8 0 C-3.8 -3.2 -1.6 -5 1.4 -4.6 C5.2 -4.1 7.4 -1.6 7 1.2 C6.6 4.2 3.2 5.4 -0.2 4.6 C-2.8 4 -4.2 2.2 -3.8 0 Z"
          fill="url(#spiderCarapace)"
          stroke="rgba(228,228,231,0.36)"
          strokeWidth="0.55"
        />

        {EYES.map(([cx, cy, r], index) => (
          <g key={`eye-${index}`}>
            <circle cx={cx} cy={cy} r={r} fill="#E11D48" />
            <circle
              cx={cx - r * 0.28}
              cy={cy - r * 0.28}
              r={Math.max(0.08, r * 0.26)}
              fill="rgba(255,255,255,0.86)"
            />
          </g>
        ))}

        <path
          d="M5.4 1.6 C7 2.2 8 2.8 8.4 3.4 C7.4 3.8 6.2 3.4 5.2 2.6 Z"
          fill="#0b0b0f"
          stroke="rgba(225,29,72,0.75)"
          strokeWidth="0.35"
        />
        <path
          d="M5.4 -1.6 C7 -2.2 8 -2.8 8.4 -3.4 C7.4 -3.8 6.2 -3.4 5.2 -2.6 Z"
          fill="#0b0b0f"
          stroke="rgba(225,29,72,0.65)"
          strokeWidth="0.32"
        />
        <path
          d="M4.2 -2.6 C6.2 -4 8 -4.6 9 -4 C7.8 -3.2 6.2 -2.6 5 -2.2"
          fill="none"
          stroke="rgba(228,228,231,0.5)"
          strokeWidth="0.85"
          strokeLinecap="round"
        />
        <path
          d="M4.2 2.6 C6.2 4 8 4.6 9 4 C7.8 3.2 6.2 2.6 5 2.2"
          fill="none"
          stroke="rgba(228,228,231,0.42)"
          strokeWidth="0.75"
          strokeLinecap="round"
        />
      </g>

      <circle
        cx="0"
        cy="0"
        r="4.2"
        fill="rgba(225,29,72,0.1)"
        stroke="rgba(225,29,72,0.42)"
        strokeWidth="0.5"
      />
      <circle cx="0" cy="0" r="1.2" fill="rgba(255,255,255,0.94)" />
    </svg>
  );
}

function timeSeconds(now: number) {
  return now / 1000;
}
