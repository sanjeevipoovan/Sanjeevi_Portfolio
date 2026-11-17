// src/web/backdropSimulation.ts
export interface BackdropNode {
  id: number;
  x: number;
  y: number;
  restX: number;
  restY: number;
  vx: number;
  vy: number;
  pinned: boolean;
  kind: 'corner' | 'ambient';
  radius: number;
  phase: number;
  energy: number;
}

export interface BackdropEdge {
  a: number;
  b: number;
  restLength: number;
  stiffness: number;
  sagFactor: number;
  crimson: boolean;
}

export interface BackdropRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  age: number;
  duration: number;
}

export interface BackdropPointer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

export interface BackdropWebState {
  width: number;
  height: number;
  nodes: BackdropNode[];
  edges: BackdropEdge[];
  ripples: BackdropRipple[];
  scrollVelocity: number;
}

function buildCornerSpringMesh(
  nodes: BackdropNode[],
  edges: BackdropEdge[],
  config: {
    cx: number;
    cy: number;
    maxRadius: number;
    startDeg: number;
    endDeg: number;
    spokeCount: number;
    ringCount: number;
    sagFactor: number;
  }
): void {
  const { cx, cy, maxRadius, startDeg, endDeg, spokeCount, ringCount, sagFactor } = config;
  const grid: number[][] = [];

  const hubId = nodes.length;
  nodes.push({
    id: hubId,
    x: cx,
    y: cy,
    restX: cx,
    restY: cy,
    vx: 0,
    vy: 0,
    pinned: true,
    kind: 'corner',
    radius: 2,
    phase: 0,
    energy: 0,
  });

  for (let s = 0; s < spokeCount; s++) {
    const t = spokeCount === 1 ? 0.5 : s / (spokeCount - 1);
    const deg = startDeg + t * (endDeg - startDeg);
    const rad = (deg * Math.PI) / 180;
    const spokeNodes: number[] = [];

    for (let r = 1; r <= ringCount; r++) {
      const ratio = Math.pow(r / ringCount, 1.12);
      const dist = maxRadius * ratio;
      const nx = cx + Math.cos(rad) * dist;
      const ny = cy + Math.sin(rad) * dist;
      const isOuterBoundary = r === ringCount;
      const isSideBoundary = s === 0 || s === spokeCount - 1;
      const pinned = isOuterBoundary && isSideBoundary;

      const id = nodes.length;
      nodes.push({
        id,
        x: nx,
        y: ny,
        restX: nx,
        restY: ny,
        vx: 0,
        vy: 0,
        pinned,
        kind: 'corner',
        radius: (s + r) % 4 === 0 ? 1.7 : 1.15,
        phase: s * 0.65 + r * 0.4,
        energy: 0,
      });
      spokeNodes.push(id);

      const prevId = r === 1 ? hubId : spokeNodes[r - 2];
      const prevNode = nodes[prevId];
      edges.push({
        a: prevId,
        b: id,
        restLength: Math.hypot(nx - prevNode.restX, ny - prevNode.restY),
        stiffness: 0.085,
        sagFactor: 0.015,
        crimson: s % 3 === 1,
      });
    }
    grid.push(spokeNodes);
  }

  for (let r = 0; r < ringCount; r++) {
    for (let s = 0; s < spokeCount - 1; s++) {
      const aId = grid[s][r];
      const bId = grid[s + 1][r];
      const aNode = nodes[aId];
      const bNode = nodes[bId];
      edges.push({
        a: aId,
        b: bId,
        restLength: Math.hypot(bNode.restX - aNode.restX, bNode.restY - aNode.restY),
        stiffness: 0.06,
        sagFactor,
        crimson: false,
      });
    }
  }
}

export function createBackdropWebState(width: number, height: number): BackdropWebState {
  const safeW = Math.max(width, 320);
  const safeH = Math.max(height, 480);
  const nodes: BackdropNode[] = [];
  const edges: BackdropEdge[] = [];

  const cornerScale = Math.min(safeW / 1440, 1.15);
  const topRadius = Math.max(260, Math.round(480 * cornerScale));
  const bottomRadius = Math.max(210, Math.round(370 * cornerScale));

  buildCornerSpringMesh(nodes, edges, {
    cx: 0,
    cy: 0,
    maxRadius: topRadius,
    startDeg: 6,
    endDeg: 84,
    spokeCount: 7,
    ringCount: 5,
    sagFactor: 0.08,
  });

  buildCornerSpringMesh(nodes, edges, {
    cx: safeW,
    cy: 0,
    maxRadius: topRadius + 30,
    startDeg: 96,
    endDeg: 174,
    spokeCount: 7,
    ringCount: 5,
    sagFactor: 0.08,
  });

  buildCornerSpringMesh(nodes, edges, {
    cx: 0,
    cy: safeH,
    maxRadius: bottomRadius,
    startDeg: -84,
    endDeg: -6,
    spokeCount: 5,
    ringCount: 4,
    sagFactor: 0.055,
  });

  buildCornerSpringMesh(nodes, edges, {
    cx: safeW,
    cy: safeH,
    maxRadius: bottomRadius,
    startDeg: 186,
    endDeg: 264,
    spokeCount: 5,
    ringCount: 4,
    sagFactor: 0.055,
  });

  const cols = safeW < 768 ? 5 : 9;
  const rows = safeH < 700 ? 4 : 6;
  const cellW = safeW / cols;
  const cellH = safeH / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      const jx = Math.sin(idx * 12.9898 + 1.7) * 0.32;
      const jy = Math.cos(idx * 78.233 + 0.9) * 0.32;
      const rx = (col + 0.5 + jx) * cellW;
      const ry = (row + 0.5 + jy) * cellH;

      nodes.push({
        id: nodes.length,
        x: rx,
        y: ry,
        restX: rx,
        restY: ry,
        vx: 0,
        vy: 0,
        pinned: false,
        kind: 'ambient',
        radius: idx % 5 === 0 ? 1.85 : 1.25,
        phase: idx * 0.77,
        energy: 0,
      });
    }
  }

  return {
    width: safeW,
    height: safeH,
    nodes,
    edges,
    ripples: [],
    scrollVelocity: 0,
  };
}

export function applyBackdropRipple(
  state: BackdropWebState,
  x: number,
  y: number,
  strength = 6.5
): void {
  state.ripples.push({
    x,
    y,
    radius: 6,
    maxRadius: 340,
    strength,
    age: 0,
    duration: 0.85,
  });
  if (state.ripples.length > 5) {
    state.ripples.shift();
  }
  for (const node of state.nodes) {
    if (node.pinned) continue;
    const dx = node.x - x;
    const dy = node.y - y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.1 && dist < 280) {
      const falloff = 1 - dist / 280;
      const impulse = strength * falloff;
      node.vx += (dx / dist) * impulse;
      node.vy += (dy / dist) * impulse;
      node.energy = Math.min(1, node.energy + falloff * 0.95);
    }
  }
}

export function applyBackdropScrollGust(state: BackdropWebState, deltaY: number): void {
  const clamped = Math.max(-180, Math.min(180, deltaY));
  state.scrollVelocity = Math.max(-14, Math.min(14, state.scrollVelocity + clamped * 0.025));
}

export function stepBackdropWebState(
  state: BackdropWebState,
  dtSeconds: number,
  time: number,
  pointer: BackdropPointer,
  reducedMotion: boolean
): void {
  const dt = Math.min(Math.max(dtSeconds, 0.004), 0.032) * 60;

  if (reducedMotion) {
    for (const node of state.nodes) {
      node.x = node.restX;
      node.y = node.restY;
      node.vx = 0;
      node.vy = 0;
      node.energy = 0;
    }
    state.ripples = [];
    state.scrollVelocity = 0;
    return;
  }

  for (let i = state.ripples.length - 1; i >= 0; i--) {
    const ripple = state.ripples[i];
    ripple.age += dtSeconds;
    ripple.radius = (ripple.age / ripple.duration) * ripple.maxRadius;
    if (ripple.age >= ripple.duration) {
      state.ripples.splice(i, 1);
    }
  }

  const pointerSpeed = Math.hypot(pointer.vx, pointer.vy);
  const pointerInfluenceRadius = 210;

  for (const node of state.nodes) {
    node.energy = Math.max(0, node.energy - 0.018 * dt);
    if (node.pinned) continue;

    const driftAmp = node.kind === 'ambient' ? 14 : 4.2;
    const targetX = node.restX + Math.sin(time * 0.65 + node.phase) * driftAmp;
    const targetY =
      node.restY + Math.cos(time * 0.52 + node.phase * 1.15) * driftAmp;

    const homeStiffness = node.kind === 'corner' ? 0.045 : 0.026;
    let fx = (targetX - node.x) * homeStiffness;
    let fy = (targetY - node.y) * homeStiffness;

    if (Math.abs(state.scrollVelocity) > 0.05) {
      const weight = node.kind === 'corner' ? 0.038 : 0.055;
      fy -= state.scrollVelocity * weight;
    }

    if (pointer.active) {
      const dx = pointer.x - node.x;
      const dy = pointer.y - node.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 1 && dist < pointerInfluenceRadius) {
        const proximity = 1 - dist / pointerInfluenceRadius;
        const pull = proximity * (node.kind === 'ambient' ? 0.14 : 0.09);
        fx += (dx / dist) * pull * 8;
        fy += (dy / dist) * pull * 8;

        if (pointerSpeed > 2.5) {
          const pluck = Math.min(1.6, pointerSpeed * 0.035) * proximity;
          fx += pointer.vx * pluck * 0.18;
          fy += pointer.vy * pluck * 0.18;
        }

        node.energy = Math.max(node.energy, proximity * 0.85);
      }
    }

    node.vx += fx * dt;
    node.vy += fy * dt;
  }

  for (const edge of state.edges) {
    const a = state.nodes[edge.a];
    const b = state.nodes[edge.b];
    if (!a || !b) continue;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const stretch = dist - edge.restLength;
    const force = stretch * edge.stiffness;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (!a.pinned) {
      a.vx += fx * dt;
      a.vy += fy * dt;
    }
    if (!b.pinned) {
      b.vx -= fx * dt;
      b.vy -= fy * dt;
    }
  }

  const damping = Math.pow(0.89, dt);
  for (const node of state.nodes) {
    if (node.pinned) continue;
    node.vx *= damping;
    node.vy *= damping;
    node.x += node.vx * dt;
    node.y += node.vy * dt;

    const maxExcursion = node.kind === 'corner' ? 42 : 56;
    const ox = node.x - node.restX;
    const oy = node.y - node.restY;
    const mag = Math.hypot(ox, oy);
    if (mag > maxExcursion) {
      node.x = node.restX + (ox / mag) * maxExcursion;
      node.y = node.restY + (oy / mag) * maxExcursion;
    }
  }

  state.scrollVelocity *= Math.pow(0.86, dt);
}