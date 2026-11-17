import { useEffect, useRef } from "react";
import Arrow from "./Arrow";

const GRIPS = [
  [0, -6],
  [8, 5],
  [-7, 4],
  [12, 15],
  [-5, 14],
  [5, -3],
  [9, 20],
  [0, 18],
];

const SENSE = 250;
const REACH = 134;
const RELEASE = 196;

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function quadPoint(p0, c, p1, t) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
    y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y,
  };
}

export default function WebCta({ href, label = "let’s collaborate" }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const btn = btnRef.current;
    if (!stage || !canvas || !btn) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !fine) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let lastT = 0;
    let time = 0;
    let mode = "idle";
    let tingle = 0;
    let grow = 0;
    let release = 1;
    let strands = [];
    let splat = [];
    let pill = { x: 0, y: 0, w: 0, h: 0 };
    const pointer = { x: -1e4, y: -1e4, on: false };

    const roundPoint = (s) => {
      const { x, y, w, h } = pill;
      const r = h / 2;
      const straight = Math.max(0, w - 2 * r);
      const perimeter = 2 * straight + 2 * Math.PI * r;
      let t = ((s % perimeter) + perimeter) % perimeter;
      if (t < straight) return { x: x + r + t, y, nx: 0, ny: -1 };
      t -= straight;
      if (t < Math.PI * r) {
        const angle = -Math.PI / 2 + t / r;
        return {
          x: x + w - r + Math.cos(angle) * r,
          y: y + r + Math.sin(angle) * r,
          nx: Math.cos(angle),
          ny: Math.sin(angle),
        };
      }
      t -= Math.PI * r;
      if (t < straight) return { x: x + w - r - t, y: y + h, nx: 0, ny: 1 };
      t -= straight;
      const angle = Math.PI / 2 + t / r;
      return {
        x: x + r + Math.cos(angle) * r,
        y: y + r + Math.sin(angle) * r,
        nx: Math.cos(angle),
        ny: Math.sin(angle),
      };
    };

    const nearest = (qx, qy) => {
      const { x, y, w, h } = pill;
      const r = h / 2;
      const straight = Math.max(0, w - 2 * r);
      const cy = y + r;
      const cx = Math.max(x + r, Math.min(x + w - r, qx));
      const dist = Math.max(0, Math.hypot(qx - cx, qy - cy) - r);
      let s;
      if (qx > x + w - r) {
        s = straight + (Math.atan2(qy - cy, qx - cx) + Math.PI / 2) * r;
      } else if (qx < x + r) {
        let angle = Math.atan2(qy - cy, qx - cx);
        if (angle < -Math.PI / 2) angle += Math.PI * 2;
        s = 2 * straight + Math.PI * r + (angle - Math.PI / 2) * r;
      } else {
        s = qy < cy ? qx - (x + r) : straight + Math.PI * r + (x + w - r - qx);
      }
      return { s, dist };
    };

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = stageRect.width;
      height = stageRect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      pill = {
        x: btnRect.left - stageRect.left,
        y: btnRect.top - stageRect.top,
        w: btnRect.width,
        h: btnRect.height,
      };
    };

    const spawn = () => {
      const total = 7;
      grow = 0;
      release = 1;
      strands = Array.from({ length: total }, (_, i) => ({
        spread: (i / (total - 1)) * 2 - 1,
        width: i % 2 === 1 ? 0.85 : 1.55,
        grip: GRIPS[i % GRIPS.length],
        hair: i % 2 === 1,
        lag: Math.random() * 0.1,
      }));
      splat = Array.from({ length: 9 }, () => [
        (Math.random() - 0.5) * 0.5,
        0.8 + Math.random() * 0.4,
      ]);
    };

    const drawTingle = () => {
      const near = nearest(pointer.x, pointer.y);
      const n = 7;
      ctx.strokeStyle = `rgba(245,245,247,${Math.min(1, 0.22 + 0.9 * tingle)})`;
      ctx.lineWidth = 1.6;
      const spreadPx = Math.max(8, pill.h * 0.14);
      for (let k = 0; k < n; k++) {
        const edge = roundPoint(near.s + (k - 3) * spreadPx);
        const bx = edge.x - edge.nx * 7;
        const by = edge.y - edge.ny * 7;
        const angle =
          Math.atan2(pointer.y - by, pointer.x - bx) + (k - 3) * 0.05;
        const flicker = 0.72 + 0.28 * Math.sin(time * 26 + k * 2.3);
        const len = (8 + 17 * tingle) * flicker;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        for (let z = 1; z <= 4; z++) {
          const t = (z / 4) * len;
          const side = (z % 2 ? 1 : -1) * 3 * (z < 4 ? 1 : 0);
          ctx.lineTo(
            bx + Math.cos(angle) * t - Math.sin(angle) * side,
            by + Math.sin(angle) * t + Math.cos(angle) * side
          );
        }
        ctx.stroke();
      }
    };

    const draw = (dt) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (!width || !height) return;

      const near = nearest(pointer.x, pointer.y);
      const dist = pointer.on ? near.dist : 1e4;

      if (mode === "idle" && dist < SENSE) mode = "seek";
      if (mode === "seek" && dist < REACH) {
        spawn();
        mode = "fire";
      }
      if (mode === "seek" && dist > SENSE) mode = "idle";
      if (mode === "fire" && dist > RELEASE) mode = "idle";

      const target =
        mode === "seek"
          ? Math.max(0, Math.min(1, (SENSE - dist) / Math.max(1, SENSE - REACH)))
          : mode === "fire"
            ? 1
            : 0;
      tingle += (target - tingle) * Math.min(1, dt * 6);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (tingle > 0.02 && mode !== "fire") drawTingle();

      if (grow > 0.01 && release > 0.01) {
        const spreadPx = Math.min(pill.w * 0.26, 24 + dist * 0.35);
        const drawn = [];
        let caught = 0;

        strands.forEach((strand) => {
          const root = roundPoint(near.s + strand.spread * spreadPx);
          const progress = Math.max(
            0,
            Math.min(1, (grow - strand.lag) / (1 - strand.lag))
          );
          const eased = easeOut(progress) * release;
          const targetX = pointer.x + strand.grip[0];
          const targetY = pointer.y + strand.grip[1];
          const tip = {
            x: root.x + (targetX - root.x) * eased,
            y: root.y + (targetY - root.y) * eased,
          };
          const dx = tip.x - root.x;
          const dy = tip.y - root.y;
          const len = Math.hypot(dx, dy) || 1;
          const sag = Math.sin(time * 2.1 + strand.spread * 3) * 2 + 2.5;
          const control = {
            x: (root.x + tip.x) / 2 + (-dy / len) * sag,
            y: (root.y + tip.y) / 2 + (dx / len) * sag,
          };

          ctx.strokeStyle = `rgba(245,245,247,${0.35 + 0.6 * release})`;
          ctx.lineWidth = strand.width * (0.75 + 0.25 * release);
          ctx.beginPath();
          ctx.moveTo(root.x, root.y);
          ctx.quadraticCurveTo(control.x, control.y, tip.x, tip.y);
          ctx.stroke();

          if (progress > 0.92) caught = Math.max(caught, 1);
          drawn.push({ root, control, tip, hair: strand.hair });
        });

        if (grow > 0.7 && release > 0.4 && drawn.length > 1) {
          ctx.strokeStyle = `rgba(245,245,247,${0.3 * release})`;
          ctx.lineWidth = 0.7;
          for (let i = 0; i < drawn.length - 1; i++) {
            for (const t of [0.34, 0.58, 0.82]) {
              if (t > 0.4 + grow * 0.7) continue;
              const a = quadPoint(drawn[i].root, drawn[i].control, drawn[i].tip, t);
              const b = quadPoint(
                drawn[i + 1].root,
                drawn[i + 1].control,
                drawn[i + 1].tip,
                t
              );
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.quadraticCurveTo(
                (a.x + b.x) / 2,
                (a.y + b.y) / 2 + 3,
                b.x,
                b.y
              );
              ctx.stroke();
            }
          }
        }

        if (caught && grow > 0.85) {
          const e = easeOut(Math.min(1, (grow - 0.85) / 0.15));
          const radius = 4 + e * 10;
          const cxp = pointer.x;
          const cyp = pointer.y;
          ctx.strokeStyle = "rgba(245,245,247,0.85)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          splat.forEach(([jitter, scale], k) => {
            const angle = (k / splat.length) * Math.PI * 2 + jitter;
            ctx.moveTo(cxp, cyp);
            ctx.lineTo(
              cxp + Math.cos(angle) * radius * scale,
              cyp + Math.sin(angle) * radius * scale
            );
          });
          ctx.stroke();
          ctx.beginPath();
          splat.forEach(([jitter], k) => {
            const angle = (k / splat.length) * Math.PI * 2 + jitter;
            const nextAngle =
              ((k + 1) / splat.length) * Math.PI * 2 + splat[(k + 1) % splat.length][0];
            const ax = cxp + Math.cos(angle) * radius * 0.72;
            const ay = cyp + Math.sin(angle) * radius * 0.72;
            const bx = cxp + Math.cos(nextAngle) * radius * 0.72;
            const by = cyp + Math.sin(nextAngle) * radius * 0.72;
            if (k === 0) ctx.moveTo(ax, ay);
            ctx.quadraticCurveTo(
              cxp + ((ax + bx) / 2 - cxp) * 0.82,
              cyp + ((ay + by) / 2 - cyp) * 0.82,
              bx,
              by
            );
          });
          ctx.stroke();
        }
      }
    };

    const frame = (now) => {
      const dt = Math.min(0.033, (now - lastT) / 1000) || 0;
      lastT = now;
      time += dt;

      if (mode === "fire") {
        grow = Math.min(1, grow + dt * 4.4);
        release = 1;
      } else {
        grow = Math.max(0, grow - dt * 7);
        release = Math.max(0, release - dt * 2.6);
      }

      draw(dt);

      if (mode !== "idle" || tingle > 0.02 || release > 0.02) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (event) => {
      const stageRect = stage.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      pill = {
        x: btnRect.left - stageRect.left,
        y: btnRect.top - stageRect.top,
        w: btnRect.width,
        h: btnRect.height,
      };
      pointer.x = event.clientX - stageRect.left;
      pointer.y = event.clientY - stageRect.top;
      pointer.on =
        pointer.x > -60 &&
        pointer.y > -60 &&
        pointer.x < stageRect.width + 60 &&
        pointer.y < stageRect.height + 60;
      if (pointer.on) start();
      else if (mode !== "idle") mode = "idle";
    };

    const onLeave = () => {
      pointer.on = false;
      if (mode !== "idle") mode = "idle";
    };

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    measure();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <span className="webcta" ref={stageRef}>
      <canvas ref={canvasRef} className="webcta-canvas" aria-hidden="true" />
      <a ref={btnRef} className="web-btn" href={href}>
        <svg className="web-corner web-corner--tl" viewBox="0 0 40 40" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="0.7">
            <circle cx="0" cy="0" r="10" />
            <circle cx="0" cy="0" r="19" />
            <circle cx="0" cy="0" r="28" />
            <circle cx="0" cy="0" r="37" />
            <path d="M0 0L40 4M0 0L38 14M0 0L32 26M0 0L18 36M0 0L4 40" />
          </g>
        </svg>
        <svg className="web-corner web-corner--br" viewBox="0 0 40 40" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="0.7">
            <circle cx="40" cy="40" r="10" />
            <circle cx="40" cy="40" r="19" />
            <circle cx="40" cy="40" r="28" />
            <circle cx="40" cy="40" r="37" />
            <path d="M40 40L0 36M40 40L2 26M40 40L8 14M40 40L22 4M40 40L36 0" />
          </g>
        </svg>
        <span className="web-btn-label">{label}</span>
        <span className="web-arrow">
          <Arrow size={15} />
        </span>
      </a>
    </span>
  );
}
