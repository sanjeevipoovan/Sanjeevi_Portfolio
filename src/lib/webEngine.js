// Hooke's-law spring-damper engine for the hanging web.
// Pure numbers — React never re-renders at 60Hz; the renderer reads these values.
import { CENTER, STAGE } from "./webLayout.js";

const KIND_K = {
  spoke: 26,
  ring: 22,
  tether: 17,
  sector: 15,
  suspension: 44,
  guy: 52,
};

const ANCHOR_K = 1.9;
const DAMPING = 0.938;
const STEP = 1 / 60;
const MAX_SPEED = 260;

export class WebEngine {
  constructor(layout, { breeze = true } = {}) {
    this.nodes = layout.nodes.map((node) => ({ ...node, vx: 0, vy: 0, grip: false }));
    this.edges = layout.edges;
    this.breeze = breeze;
    this.t = 0;
    this.wave = [];
    this.dragging = null;
    this.wake = () => {};
    // Precompute breeze phases so the sway is stable and deterministic.
    this.nodes.forEach((node, i) => {
      node.phase = (i * 2.399) % (Math.PI * 2);
    });
  }

  setBreeze(on) {
    this.breeze = on;
    if (on) this.wake();
  }

  impulse(id, fx, fy) {
    const node = this.nodes.find((n) => n.id === id);
    if (!node || node.pinned) return;
    node.vx += fx;
    node.vy += fy;
  }

  // A short pluck along the silk touching this node.
  pluckNode(id) {
    const node = this.nodes.find((n) => n.id === id);
    if (!node || node.pinned) return;
    const dx = node.x - CENTER.x;
    const dy = node.y - CENTER.y;
    const d = Math.hypot(dx, dy) || 1;
    node.vx += (dx / d) * 16 + 4;
    node.vy += (dy / d) * 16 + 7;
    for (const edge of this.edges) {
      const a = this.nodes[edge.a];
      const b = this.nodes[edge.b];
      if (a.id !== id && b.id !== id) continue;
      const other = a.id === id ? b : a;
      if (other.pinned) continue;
      other.vx += (dx / d) * 6 + ((edge.a * 7) % 5) - 2;
      other.vy += 5 + ((edge.b * 5) % 4);
    }
    this.wake();
  }

  // A local pluck at an arbitrary stage point (cursor click on empty silk).
  pluckAt(x, y, { radius = 300, force = 30 } = {}) {
    for (const node of this.nodes) {
      if (node.pinned || node.grip) continue;
      const dx = node.x - x;
      const dy = node.y - y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > radius) continue;
      const falloff = 1 - d / radius;
      const push = force * falloff * falloff + 3;
      node.vx += (dx / d) * push;
      node.vy += (dy / d) * push + 4 * falloff;
    }
    this.wake();
  }

  // A travelling wave from the hub out to the rim.
  pluckWeb() {
    this.wave = [];
    for (let i = 0; i < this.nodes.length; i += 1) {
      const node = this.nodes[i];
      if (node.pinned) continue;
      const dx = node.x - CENTER.x;
      const dy = node.y - CENTER.y;
      const d = Math.hypot(dx, dy) || 1;
      const lift = 20 + (i % 5) * 2.5;
      this.wave.push({
        i,
        at: this.t + d / 760,
        fx: (dx / d) * lift,
        fy: (dy / d) * lift + 7,
      });
    }
    this.wake();
  }

  reset() {
    for (const node of this.nodes) {
      node.x = node.bx;
      node.y = node.by;
      node.vx = 0;
      node.vy = 0;
      node.grip = false;
    }
    this.dragging = null;
    this.wave = [];
    this.wake();
  }

  beginDrag(id) {
    const node = this.nodes.find((n) => n.id === id);
    if (!node || node.pinned) return;
    node.grip = true;
    this.dragging = id;
    this.wake();
  }

  moveDrag(id, x, y) {
    const node = this.nodes.find((n) => n.id === id);
    if (!node) return;
    const nx = Math.max(24, Math.min(STAGE.w - 24, x));
    const ny = Math.max(28, Math.min(STAGE.h - 18, y));
    node.vx = (nx - node.x) * 34;
    node.vy = (ny - node.y) * 34;
    node.x = nx;
    node.y = ny;
    this.wake();
  }

  endDrag(id) {
    const node = this.nodes.find((n) => n.id === id);
    if (node) node.grip = false;
    if (this.dragging === id) this.dragging = null;
    this.wake();
  }

  settle() {
    for (const edge of this.edges) {
      const a = this.nodes[edge.a];
      const b = this.nodes[edge.b];
      const rest = edge.base || Math.hypot(b.bx - a.bx, b.by - a.by) || 1;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.001;
      const strain = d - rest;
      const k = KIND_K[edge.kind] || 20;
      const force = strain * k;
      const fx = (dx / d) * force;
      const fy = (dy / d) * force;
      // Immovable ends push the whole correction into the free node.
      const aFixed = a.pinned || a.grip;
      const bFixed = b.pinned || b.grip;
      if (!aFixed) {
        a.vx += bFixed ? fx : fx * 0.5;
        a.vy += bFixed ? fy : fy * 0.5;
      }
      if (!bFixed) {
        b.vx -= aFixed ? fx : fx * 0.5;
        b.vy -= aFixed ? fy : fy * 0.5;
      }
    }

    for (const node of this.nodes) {
      if (node.pinned || node.grip) continue;
      node.vx += (node.bx - node.x) * ANCHOR_K;
      node.vy += (node.by - node.y) * ANCHOR_K;

      if (this.breeze) {
        const p = node.phase;
        node.vx +=
          Math.sin(this.t * 0.9 + p) * 12 +
          Math.sin(this.t * 1.7 + p * 1.7) * 6 +
          Math.cos(this.t * 0.42 + p * 0.6) * 8;
        node.vy +=
          Math.cos(this.t * 1.15 + p * 1.3) * 6 +
          Math.sin(this.t * 0.55 + p) * 4;
      }
    }

    for (const node of this.nodes) {
      if (node.pinned || node.grip) continue;
      const speed = Math.hypot(node.vx, node.vy);
      if (speed > MAX_SPEED) {
        node.vx = (node.vx / speed) * MAX_SPEED;
        node.vy = (node.vy / speed) * MAX_SPEED;
      }
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x += node.vx * STEP;
      node.y += node.vy * STEP;
      if (node.x < 10) {
        node.x = 10;
        node.vx = Math.abs(node.vx) * 0.35;
      } else if (node.x > STAGE.w - 10) {
        node.x = STAGE.w - 10;
        node.vx = -Math.abs(node.vx) * 0.35;
      }
      if (node.y < 8) {
        node.y = 8;
        node.vy = Math.abs(node.vy) * 0.35;
      } else if (node.y > STAGE.h - 8) {
        node.y = STAGE.h - 8;
        node.vy = -Math.abs(node.vy) * 0.35;
      }
    }
  }

  step(dt = STEP) {
    if (dt > STEP * 2) dt = STEP;
    this.t += dt;
    if (this.wave.length) {
      const remaining = [];
      for (const item of this.wave) {
        if (item.at <= this.t) {
          const node = this.nodes[item.i];
          if (node && !node.pinned) {
            node.vx += item.fx;
            node.vy += item.fy;
          }
        } else {
          remaining.push(item);
        }
      }
      this.wave = remaining;
    }
    this.settle();
  }

  energy() {
    let sum = 0;
    for (const node of this.nodes) {
      if (node.pinned) continue;
      sum += node.vx * node.vx + node.vy * node.vy;
    }
    return sum;
  }

  isSettled() {
    return !this.dragging && !this.wave.length && this.energy() < 0.9;
  }
}

export function tensionFor(base, current) {
  const stretch = (current - base) / base;
  if (!Number.isFinite(stretch)) return 0;
  return Math.max(0, Math.min(1, stretch * 1.8));
}
