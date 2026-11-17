import React, { useEffect, useRef } from 'react';
import { applyBackdropRipple, applyBackdropScrollGust, BackdropPointer, BackdropWebState, createBackdropWebState, stepBackdropWebState } from '../web/backdropSimulation';

export const SpiderWebBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let reducedMotion = motionQuery ? motionQuery.matches : false;

    let width = window.innerWidth || 1440;
    let height = window.innerHeight || 900;

    let sim: BackdropWebState = createBackdropWebState(width, height);
    let ambientIndices: number[] = [];
    const pointer: BackdropPointer = {
      x: width * 0.62,
      y: height * 0.34,
      vx: 0,
      vy: 0,
      active: false,
    };

    const rebuildAmbientCache = () => {
      ambientIndices = [];
      for (let i = 0; i < sim.nodes.length; i++) {
        if (sim.nodes[i].kind === 'ambient') {
          ambientIndices.push(i);
        }
      }
    };

    const resizeCanvas = () => {
      width = window.innerWidth || 1440;
      height = window.innerHeight || 900;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      sim = createBackdropWebState(width, height);
      rebuildAmbientCache();
    };

    resizeCanvas();

    let lastScrollY = window.scrollY;
    let lastSimTime = performance.now();
    let lastDrawTime = 0;
    let rafId = 0;

    const renderScene = (now: number) => {
      const dtSeconds = Math.min((now - lastSimTime) / 1000, 0.05);
      lastSimTime = now;
      const elapsedSec = now / 1000;

      stepBackdropWebState(sim, dtSeconds, elapsedSec, pointer, reducedMotion);

      pointer.vx *= 0.82;
      pointer.vy *= 0.82;

      ctx.clearRect(0, 0, width, height);

      // 1. Subtle vertical margin anchor rails
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(36, 0);
      ctx.lineTo(36, height);
      ctx.moveTo(width - 36, 0);
      ctx.lineTo(width - 36, height);
      ctx.stroke();

      // 2. Batched ambient silk compound lattice (silver base + energized crimson pass)
      const maxLinkDist = width < 768 ? 165 : 215;
      const maxLinkSq = maxLinkDist * maxLinkDist;
      const baseAmbient = new Path2D();
      const hotAmbient = new Path2D();
      let hasHotAmbient = false;

      for (let ii = 0; ii < ambientIndices.length; ii++) {
        const a = sim.nodes[ambientIndices[ii]];
        for (let jj = ii + 1; jj < ambientIndices.length; jj++) {
          const b = sim.nodes[ambientIndices[jj]];
          const dx = b.x - a.x;
          if (dx > maxLinkDist || dx < -maxLinkDist) continue;
          const dy = b.y - a.y;
          if (dy > maxLinkDist || dy < -maxLinkDist) continue;
          if (dx * dx + dy * dy > maxLinkSq) continue;

          if (a.energy > 0.14 || b.energy > 0.14) {
            hotAmbient.moveTo(a.x, a.y);
            hotAmbient.lineTo(b.x, b.y);
            hasHotAmbient = true;
          } else {
            baseAmbient.moveTo(a.x, a.y);
            baseAmbient.lineTo(b.x, b.y);
          }
        }
      }

      ctx.strokeStyle = 'rgba(228, 228, 231, 0.095)';
      ctx.lineWidth = 0.8;
      ctx.stroke(baseAmbient);

      if (hasHotAmbient) {
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.32)';
        ctx.lineWidth = 1.1;
        ctx.stroke(hotAmbient);
      }

      // 3. Batched Four Corner Hanging Orb Webs
      const silverPath = new Path2D();
      const crimsonPath = new Path2D();

      for (const edge of sim.edges) {
        const a = sim.nodes[edge.a];
        const b = sim.nodes[edge.b];
        if (!a || !b) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const stretchRatio = edge.restLength > 0 ? Math.max(0, (dist - edge.restLength) / edge.restLength) : 0;
        const tautness = Math.max(0.25, 1 - stretchRatio * 2.4);
        const sag = dist * edge.sagFactor * tautness;
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2 + sag;

        const target = edge.crimson || a.energy > 0.18 || b.energy > 0.18 ? crimsonPath : silverPath;
        target.moveTo(a.x, a.y);
        target.quadraticCurveTo(midX, midY, b.x, b.y);
      }

      ctx.strokeStyle = 'rgba(228, 228, 231, 0.12)';
      ctx.lineWidth = 0.85;
      ctx.stroke(silverPath);

      ctx.strokeStyle = 'rgba(225, 29, 72, 0.24)';
      ctx.lineWidth = 1;
      ctx.stroke(crimsonPath);

      // 4. Dynamic pointer capture silk filaments (two-tier gradual distance attenuation)
      if (pointer.active && !reducedMotion) {
        const outerRadius = 220;
        const innerRadius = 128;
        const outerSq = outerRadius * outerRadius;
        const innerSq = innerRadius * innerRadius;
        const pOuter = new Path2D();
        const pInner = new Path2D();

        for (const node of sim.nodes) {
          if (node.pinned) continue;
          const dx = pointer.x - node.x;
          if (dx > outerRadius || dx < -outerRadius) continue;
          const dy = pointer.y - node.y;
          if (dy > outerRadius || dy < -outerRadius) continue;
          const distSq = dx * dx + dy * dy;
          if (distSq > outerSq) continue;

          const dist = Math.sqrt(distSq);
          const midX = (node.x + pointer.x) / 2;
          const midY = (node.y + pointer.y) / 2 + dist * 0.045;
          const path = distSq <= innerSq || node.kind === 'corner' ? pInner : pOuter;
          path.moveTo(node.x, node.y);
          path.quadraticCurveTo(midX, midY, pointer.x, pointer.y);
        }

        ctx.strokeStyle = 'rgba(244, 244, 245, 0.13)';
        ctx.lineWidth = 0.75;
        ctx.stroke(pOuter);

        ctx.strokeStyle = 'rgba(225, 29, 72, 0.36)';
        ctx.lineWidth = 1.05;
        ctx.stroke(pInner);
      }

      // 5. Batched junction knots, pearl dewdrop glints, & swaying plumb drops
      const silverKnots = new Path2D();
      const crimsonKnots = new Path2D();
      const pearlGlints = new Path2D();
      const plumbLines = new Path2D();

      for (let i = 0; i < sim.nodes.length; i++) {
        const node = sim.nodes[i];
        const r = node.radius + node.energy * 0.9;
        const target = node.energy > 0.15 || i % 4 === 0 ? crimsonKnots : silverKnots;
        target.moveTo(node.x + r, node.y);
        target.arc(node.x, node.y, r, 0, Math.PI * 2);

        if (node.energy > 0.2 || (node.kind === 'corner' && i % 5 === 0)) {
          pearlGlints.moveTo(node.x + 0.85, node.y);
          pearlGlints.arc(node.x, node.y, 0.85, 0, Math.PI * 2);
        }

        if (
          node.kind === 'corner' &&
          !node.pinned &&
          node.restY < height * 0.45 &&
          i % 7 === 3
        ) {
          const sway = Math.sin(elapsedSec * 1.4 + node.phase) * 5 + node.vx * 1.5;
          const dropLen = 38 + (i % 3) * 18;
          const endX = node.x + sway;
          const endY = node.y + dropLen;

          plumbLines.moveTo(node.x, node.y);
          plumbLines.quadraticCurveTo(
            node.x + sway * 0.35,
            node.y + dropLen * 0.5,
            endX,
            endY
          );
          crimsonKnots.moveTo(endX + 1.9, endY);
          crimsonKnots.arc(endX, endY, 1.9, 0, Math.PI * 2);
          pearlGlints.moveTo(endX + 0.7, endY);
          pearlGlints.arc(endX, endY, 0.7, 0, Math.PI * 2);
        }
      }

      ctx.strokeStyle = 'rgba(228, 228, 231, 0.15)';
      ctx.lineWidth = 0.85;
      ctx.stroke(plumbLines);

      ctx.fillStyle = 'rgba(244, 244, 245, 0.24)';
      ctx.fill(silverKnots);

      ctx.fillStyle = 'rgba(225, 29, 72, 0.48)';
      ctx.fill(crimsonKnots);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.46)';
      ctx.fill(pearlGlints);

      // 6. Expanding tension shockwave rings from clicks
      for (const ripple of sim.ripples) {
        const progress = ripple.age / ripple.duration;
        const alpha = (1 - progress) * 0.34;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(225, 29, 72, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.3 * (1 - progress * 0.45);
        ctx.stroke();
      }
    };

    const tick = (now: number) => {
      if (now - lastDrawTime >= 26) {
        lastDrawTime = now;
        renderScene(now);
      }
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const updateGlowPosition = (x: number, y: number, active: boolean) => {
      const glow = glowRef.current;
      if (!glow) return;
      glow.style.opacity = active ? '1' : '0.45';
      glow.style.setProperty('--web-mx', `${x.toFixed(0)}px`);
      glow.style.setProperty('--web-my', `${y.toFixed(0)}px`);
    };

    const onPointerMove = (e: PointerEvent) => {
      const nextX = e.clientX;
      const nextY = e.clientY;
      pointer.vx = nextX - pointer.x;
      pointer.vy = nextY - pointer.y;
      pointer.x = nextX;
      pointer.y = nextY;
      pointer.active = true;
      updateGlowPosition(nextX, nextY, true);
    };

    const onPointerLeave = () => {
      pointer.active = false;
      updateGlowPosition(pointer.x, pointer.y, false);
    };

    const onPointerDown = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      updateGlowPosition(e.clientX, e.clientY, true);
      if (!reducedMotion) {
        applyBackdropRipple(sim, e.clientX, e.clientY, 7.2);
      }
    };

    const onScroll = () => {
      const currentY = window.scrollY;
      const deltaY = currentY - lastScrollY;
      lastScrollY = currentY;
      if (!reducedMotion) {
        applyBackdropScrollGust(sim, deltaY);
      }
    };

    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      if (reducedMotion && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
        renderScene(performance.now());
      } else if (!reducedMotion && !rafId) {
        lastSimTime = performance.now();
        lastDrawTime = 0;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    motionQuery?.addEventListener('change', onMotionChange);

    renderScene(performance.now());
    if (!reducedMotion) {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('mouseleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      motionQuery?.removeEventListener('change', onMotionChange);
    };
  }, []);

  return (
    <div
      data-testid="spider-web-backdrop"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        ref={glowRef}
        className="absolute inset-0 transition-opacity duration-500"
        style={
          {
            '--web-mx': '62vw',
            '--web-my': '34vh',
            opacity: 0.45,
            background:
              'radial-gradient(520px circle at var(--web-mx) var(--web-my), rgba(225, 29, 72, 0.08), rgba(8, 8, 10, 0) 70%)',
          } as React.CSSProperties
        }
      />
      <canvas
        ref={canvasRef}
        data-testid="spider-web-canvas"
        className="block h-full w-full"
      />
    </div>
  );
};