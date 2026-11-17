// Pure, deterministic spring-mass simulation behind the portfolio.
// One natural orb web suspended in the upper half of the viewport, plus a
// handful of long gossamer strands. No React and no DOM: the renderer only
// reads these numbers. Distances are CSS pixels; velocities are pixels per
// 60 Hz frame.

export const DAMPING = 0.89;
export const POINTER_RADIUS = 205;
export const RIPPLE_RADIUS = 340;
export const LINK_RANGE = { mobile: 165, desktop: 215 };
export const SPOKES = 20;
export const RING_FRACTIONS = [0.14, 0.2, 0.28, 0.38, 0.5, 0.64, 0.79, 0.94];

const TETHER_K = 0.02;
const EDGE_K = { spoke: 0.15, ring: 0.12, frame: 0.1, ambient: 0.05 };
const MARGIN = 3;
const MAX_SPEED = 42;
const STEP = 1 / 60;
const TAU = Math.PI * 2;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export class BackdropSimulation {
  constructor(width, height, { reducedMotion = false, seed = 0x5eedc0de } = {}) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.seed = seed;
    this.reducedMotion = Boolean(reducedMotion);
    this.t = 0;
    this.nodes = [];
    this.edges = [];
    this.web = null;
    this.strands = [];
    this.plumbs = [];
    this.ripples = [];
    this.pointer = { active: false, x: 0, y: 0, px: 0, py: 0, speed: 0 };
    this.scrollVel = 0;
    this.build();
    this.snapToRest();
  }

  // ---------------------------------------------------------------- build

  build() {
    const w = this.width;
    const h = this.height;
    const mobile = w < 700;
    const rnd = mulberry32(this.seed);
    const nodes = [];
    const edges = [];
    const strands = [];

    const addNode = (kind, x, y, extra = {}) => {
      const drift = kind === "ambient" || kind === "web";
      const node = {
        id: nodes.length,
        kind,
        x,
        y,
        bx: x,
        by: y,
        vx: 0,
        vy: 0,
        fx: 0,
        fy: 0,
        pinned: false,
        ring: -1,
        spoke: -1,
        dew: false,
        phase: rnd() * TAU,
        freqX: 0.45 + rnd() * 0.65,
        freqY: 0.38 + rnd() * 0.55,
        ampX: drift ? 1.8 + rnd() * 2.2 : 1.2 + rnd() * 1.6,
        ampY: drift ? 1.8 + rnd() * 2.2 : 1.6 + rnd() * 2,
        ...extra,
      };
      nodes.push(node);
      return node.id;
    };

    const addEdge = (aId, bId, kind) => {
      const a = nodes[aId];
      const b = nodes[bId];
      const rest = Math.hypot(b.bx - a.bx, b.by - a.by) || 1;
      edges.push({ a: aId, b: bId, kind, rest, k: EDGE_K[kind] });
    };

    // --- one natural orb web -----------------------------------------
    // Hung high and off-centre so the top frame runs past the viewport edge
    // and the web feels attached to the architecture, not placed on it.
    const radius = mobile
      ? clamp(Math.min(w * 0.6, h * 0.27), 150, 250)
      : clamp(Math.min(w * 0.34, h * 0.46), 240, 440);
    const centerX = mobile ? w * 0.64 : w * 0.62;
    const centerY = mobile ? h * 0.24 : h * 0.3;
    const rotation = -0.22;
    const hub = addNode("hub", centerX, centerY);
    const spokes = [];
    const anchors = [];
    const rings = RING_FRACTIONS.map(() => []);

    for (let s = 0; s < SPOKES; s += 1) {
      const angle =
        rotation + (s / SPOKES) * TAU + (rnd() - 0.5) * 0.035;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const reach = radius * (1.03 + rnd() * 0.07);
      const anchor = addNode("anchor", centerX + cos * reach, centerY + sin * reach, {
        spoke: s,
        pinned: true,
      });
      anchors.push(anchor);

      const chain = [hub];
      RING_FRACTIONS.forEach((fraction, ring) => {
        // Organic spiral: every junction wanders a little off the ideal arc.
        const wobble = radius * fraction * (1 + (rnd() - 0.5) * 0.1);
        const drift = (rnd() - 0.5) * 0.05;
        const id = addNode(
          "web",
          centerX + Math.cos(angle + drift) * wobble,
          centerY + Math.sin(angle + drift) * wobble,
          { ring, spoke: s }
        );
        chain.push(id);
        rings[ring].push(id);
      });
      chain.push(anchor);

      for (let i = 0; i < chain.length - 1; i += 1) {
        addEdge(chain[i], chain[i + 1], "spoke");
      }
      spokes.push(chain);
    }

    // Capture spiral: closed loops of bowed silk between neighbouring radii.
    for (const ring of rings) {
      for (let s = 0; s < ring.length; s += 1) {
        addEdge(ring[s], ring[(s + 1) % ring.length], "ring");
      }
    }

    // Dew catches on a sparse selection of junctions.
    for (const ring of rings) {
      for (const id of ring) {
        if (rnd() < 0.05) nodes[id].dew = true;
      }
    }
    nodes[rings[2][3]].dewHot = true;
    nodes[rings[4][14]].dewHot = true;

    // Hanging dew threads below the web.
    const plumbs = [
      { node: rings[4][13], length: 54 + rnd() * 26, phase: rnd() * TAU, sway: 1.6 + rnd() * 1.8 },
      { node: rings[5][17], length: 34 + rnd() * 20, phase: rnd() * TAU, sway: 1.2 + rnd() * 1.4 },
    ];

    // --- long gossamer strands ---------------------------------------
    // Ballooning silk: a few strands sweep across the screen, each a chain of
    // drifting junctions pinned where it leaves the viewport.
    const strandCount = mobile ? 3 : 4;
    const edgePoint = (edge) => {
      const t = 0.08 + rnd() * 0.84;
      if (edge === 0) return [t * w, 0];
      if (edge === 1) return [w, t * h];
      if (edge === 2) return [t * w, h];
      return [0, t * h];
    };

    for (let s = 0; s < strandCount; s += 1) {
      const startEdge = s % 4;
      const endEdge = (startEdge + 1 + (s % 2)) % 4;
      const [ax, ay] = edgePoint(startEdge);
      const [bx, by] = edgePoint(endEdge);
      const span = Math.hypot(bx - ax, by - ay) || 1;
      const bow = (rnd() - 0.5) * Math.min(w, h) * 0.22;
      const gravity = 46 + rnd() * 70;
      const mx = (ax + bx) / 2 - ((by - ay) / span) * bow;
      const my = (ay + by) / 2 + ((bx - ax) / span) * bow + gravity;
      const steps = clamp(Math.round(span / 220), 3, 6);
      const chain = [];

      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const inv = 1 - t;
        const x = inv * inv * ax + 2 * inv * t * mx + t * t * bx;
        const y = inv * inv * ay + 2 * inv * t * my + t * t * by;
        const pinned = i === 0 || i === steps;
        const id = addNode(
          "ambient",
          clamp(x, 8, w - 8),
          clamp(y, 8, h - 8),
          { pinned, dew: !pinned && rnd() < 0.3 }
        );
        chain.push(id);
      }
      for (let i = 0; i < chain.length - 1; i += 1) {
        addEdge(chain[i], chain[i + 1], "ambient");
      }
      strands.push(chain);
    }

    this.nodes = nodes;
    this.edges = edges;
    this.strands = strands;
    this.plumbs = plumbs;
    this.web = {
      hub,
      centerX,
      centerY,
      radius,
      spokes,
      anchors,
      rings,
      mobile,
    };
    this.ripples = [];
  }

  // ---------------------------------------------------------------- input

  setPointer(x, y) {
    if (this.reducedMotion) return;
    const pointer = this.pointer;
    const dx = pointer.active ? x - pointer.x : 0;
    const dy = pointer.active ? y - pointer.y : 0;
    const speed = Math.hypot(dx, dy);

    pointer.px = pointer.active ? pointer.x : x;
    pointer.py = pointer.active ? pointer.y : y;
    pointer.x = x;
    pointer.y = y;
    pointer.speed = speed;
    pointer.active = true;

    if (speed < 0.6) return;
    const dirX = dx / speed;
    const dirY = dy / speed;
    const pull = Math.min(8, speed * 0.14);

    for (const node of this.nodes) {
      if (node.pinned) continue;
      const distance = Math.hypot(node.x - x, node.y - y);
      if (distance > POINTER_RADIUS) continue;
      const falloff = 1 - distance / POINTER_RADIUS;
      const kick = pull * falloff * falloff;
      node.vx += dirX * kick + (x - node.x) * 0.012 * falloff;
      node.vy += dirY * kick + (y - node.y) * 0.012 * falloff;
      node.energy = Math.max(
        node.energy,
        Math.min(1, falloff * (0.35 + speed * 0.02))
      );
    }
  }

  clearPointer() {
    this.pointer.active = false;
    this.pointer.speed = 0;
  }

  ripple(x, y) {
    if (this.reducedMotion) return;
    this.ripples.push({ x, y, age: 0, life: 1 });
    if (this.ripples.length > 3) this.ripples.splice(0, this.ripples.length - 3);

    for (const node of this.nodes) {
      if (node.pinned) continue;
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.hypot(dx, dy);
      if (distance > RIPPLE_RADIUS) continue;
      const falloff = 1 - distance / RIPPLE_RADIUS;
      const push = 3 + 24 * falloff * falloff;
      const inv = 1 / (distance || 1);
      node.vx += dx * inv * push;
      node.vy += dy * inv * push;
      node.energy = Math.max(node.energy, Math.min(1, falloff * 1.3 + 0.15));
    }
  }

  addScroll(deltaY) {
    if (this.reducedMotion) return;
    this.scrollVel = clamp(this.scrollVel + deltaY, -260, 260);
    const kick = clamp(deltaY * 0.06, -6, 6);
    for (const node of this.nodes) {
      if (node.pinned) continue;
      if (node.kind !== "web" && node.kind !== "hub") continue;
      node.vy += kick * (node.kind === "hub" ? 0.45 : 1);
    }
  }

  // ------------------------------------------------------------- simulate

  step(dt = STEP) {
    if (this.reducedMotion) return;
    const f = Math.min(dt, 1 / 30) * 60;
    if (f <= 0) return;
    this.t += dt;

    this.scrollVel *= Math.pow(0.9, f);
    if (Math.abs(this.scrollVel) < 0.04) this.scrollVel = 0;

    if (this.ripples.length) {
      for (const ripple of this.ripples) ripple.age += dt;
      this.ripples = this.ripples.filter((ripple) => ripple.age < ripple.life);
    }

    const nodes = this.nodes;
    for (const node of nodes) {
      node.fx = 0;
      node.fy = 0;
    }

    // Structural Hooke springs: pulling one strand ripples to its neighbours.
    for (const edge of this.edges) {
      const a = nodes[edge.a];
      const b = nodes[edge.b];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 0.0001) continue;
      const strain = distance - edge.rest;
      if (Math.abs(strain) < 0.005) continue;
      const k = (strain * edge.k) / distance;
      const fx = dx * k;
      const fy = dy * k;
      if (!a.pinned) {
        a.fx += fx;
        a.fy += fy;
      }
      if (!b.pinned) {
        b.fx -= fx;
        b.fy -= fy;
      }
    }

    const pointer = this.pointer;
    const hasPointer = pointer.active;
    const t = this.t;

    for (const node of nodes) {
      if (node.pinned) continue;

      const restX = node.bx + Math.sin(t * node.freqX + node.phase) * node.ampX;
      const restY =
        node.by + Math.cos(t * node.freqY + node.phase * 1.7) * node.ampY;
      node.fx += (restX - node.x) * TETHER_K;
      node.fy += (restY - node.y) * TETHER_K;

      if ((node.kind === "web" || node.kind === "hub") && this.scrollVel) {
        node.fy += clamp(this.scrollVel * 0.035, -5, 5);
        node.fx +=
          clamp(this.scrollVel * 0.008, -2, 2) *
          (node.bx < this.width / 2 ? 1 : -1);
      }

      if (hasPointer) {
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const distance = Math.hypot(dx, dy);
        if (distance < POINTER_RADIUS) {
          const falloff = 1 - distance / POINTER_RADIUS;
          node.fx += dx * 0.0032 * falloff * falloff;
          node.fy += dy * 0.0032 * falloff * falloff;
        }
      }
    }

    const damp = Math.pow(DAMPING, f);
    for (const node of nodes) {
      if (node.pinned) continue;
      node.vx = (node.vx + node.fx * f) * damp;
      node.vy = (node.vy + node.fy * f) * damp;

      const speed = Math.hypot(node.vx, node.vy);
      if (speed > MAX_SPEED) {
        node.vx = (node.vx / speed) * MAX_SPEED;
        node.vy = (node.vy / speed) * MAX_SPEED;
      }
      node.x += node.vx * f;
      node.y += node.vy * f;

      // The orb web intentionally overhangs the top/side edges, so only the
      // free-floating gossamer is held inside the viewport.
      if (node.kind === "web") continue;

      if (node.x < MARGIN) {
        node.x = MARGIN;
        if (node.vx < 0) node.vx *= -0.3;
      } else if (node.x > this.width - MARGIN) {
        node.x = this.width - MARGIN;
        if (node.vx > 0) node.vx *= -0.3;
      }
      if (node.y < MARGIN) {
        node.y = MARGIN;
        if (node.vy < 0) node.vy *= -0.3;
      } else if (node.y > this.height - MARGIN) {
        node.y = this.height - MARGIN;
        if (node.vy > 0) node.vy *= -0.3;
      }

      if (node.energy > 0) {
        node.energy = Math.max(0, node.energy * Math.pow(0.955, f) - 0.002 * f);
      }
    }
  }

  // ---------------------------------------------------------------- state

  snapToRest() {
    for (const node of this.nodes) {
      node.x = node.bx;
      node.y = node.by;
      node.vx = 0;
      node.vy = 0;
      node.fx = 0;
      node.fy = 0;
      node.energy = 0;
    }
    this.ripples = [];
    this.scrollVel = 0;
    this.pointer.active = false;
    this.pointer.speed = 0;
  }

  reset() {
    this.snapToRest();
  }

  setReducedMotion(on) {
    this.reducedMotion = Boolean(on);
    if (this.reducedMotion) this.snapToRest();
  }

  resize(width, height) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.build();
    this.snapToRest();
  }

  energy() {
    let total = 0;
    for (const node of this.nodes) {
      if (node.pinned) continue;
      total += node.vx * node.vx + node.vy * node.vy;
    }
    return total;
  }
}

export function createBackdropSimulation(width, height, options) {
  return new BackdropSimulation(width, height, options);
}
