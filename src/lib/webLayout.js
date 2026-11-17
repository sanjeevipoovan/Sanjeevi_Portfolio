// Deterministic layout for the hanging orb web.
// Everything here is pure + seeded, so the web relaxes to the same rest state on every load.
import { disciplines } from "../data/stack.js";

export const STAGE = { w: 1040, h: 590 };
export const CENTER = { x: 520, y: 306 };
export const BEAM = { y: 18, x1: 112, x2: 928 };
export const SPOKE_COUNT = 15;
export const RING_COUNT = 3;
export const ORBIT = { rx: 366, ry: 206 };

const RX = ORBIT.rx;
const RY = ORBIT.ry;
const CX = CENTER.x;
const CY = CENTER.y;
const RING_F = [0.4, 0.68, 1];
const SPOKE_STEP = 360 / SPOKE_COUNT;
// The web is designed at 1040 units but rendered ~800px wide at desktop;
// measure label boxes a little heavier than their CSS size so the relaxed
// layout still holds at typical viewport widths.
const DENSITY = 0.78;
const PAD = 5;

const ANCHOR_X = [150, 350, 520, 700, 890];
const ANCHOR_SPOKES = [2, 3, 4, 5, 6];
const GUYS = [
  { x: 30, y: 168, spoke: 3 },
  { x: 1012, y: 168, spoke: 4 },
  { x: 128, y: 566, spoke: 8 },
  { x: 918, y: 566, spoke: 6 },
  { x: 520, y: 574, spoke: 7 },
];

const rad = (deg) => (deg * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

export function ellipsePoint(angle, radiusFactor = 1) {
  return [
    CX + Math.cos(rad(angle)) * RX * radiusFactor,
    CY + Math.sin(rad(angle)) * RY * radiusFactor,
  ];
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function labelBox(text, { mono = false } = {}) {
  if (mono) {
    return { w: (text.length * 6.4 + 22) / DENSITY, h: 21 / DENSITY };
  }
  const textWidth = Math.min(96, text.length * 4.9);
  const width = textWidth + 31;
  const height = text.length * 4.9 > 96 ? 29 : 17;
  return { w: width / DENSITY, h: height / DENSITY };
}

function skillRings() {
  // Group each discipline's skills by ring, preserving the authored order.
  const groups = disciplines.map((discipline) => {
    const buckets = [[], [], []];
    let cursor = 0;
    discipline.rings.forEach((count, ring) => {
      for (let i = 0; i < count; i += 1) {
        const skill = discipline.skills[cursor + i];
        if (skill) buckets[ring].push({ discipline, skill });
      }
      cursor += count;
    });
    return buckets;
  });
  return groups;
}

export function buildLayout() {
  const nodes = [];
  const index = new Map();
  const add = (node) => {
    index.set(node.id, nodes.length);
    nodes.push(node);
    return node;
  };

  add({
    id: "hub",
    kind: "hub",
    x: CX,
    y: CY,
    bx: CX,
    by: CY,
    fixed: true,
    w: 100,
    h: 92,
  });

  const spokes = [];
  for (let i = 0; i < SPOKE_COUNT; i += 1) {
    const angle = -90 + i * SPOKE_STEP;
    const chain = [];
    for (let ring = 0; ring < RING_COUNT; ring += 1) {
      const [x, y] = ellipsePoint(angle, RING_F[ring]);
      const node = add({
        id: `spoke-${i}-${ring}`,
        kind: "spoke",
        x,
        y,
        bx: x,
        by: y,
        angle,
        ring,
      });
      chain.push(node.id);
    }
    spokes.push({ angle, chain });
  }

  const buckets = skillRings();
  const ringNodes = [[], [], []];

  for (let ring = 0; ring < RING_COUNT; ring += 1) {
    const seq = [];
    buckets.forEach((group) => group[ring].forEach((item) => seq.push(item)));
    const count = seq.length;

    seq.forEach(({ discipline, skill }, i) => {
      const step = 360 / count;
      const jitter = (hash(skill.name) - 0.5) * step * 0.18;
      const angle = -90 + (i + 0.5) * step + jitter;
      const rf = RING_F[ring] * (1 + (hash(`${skill.name}r`) - 0.5) * 0.016);
      const [x, y] = ellipsePoint(angle, rf);
      const box = labelBox(skill.name);
      const dx = x - CX;
      const dy = y - CY;
      const len = Math.hypot(dx, dy) || 1;
      // Skill labels hang inward, keeping the outer band clear for the
      // sector headers, suspension lines and guy-lines.
      const dirX = -dx / len;
      const dirY = -dy / len;
      const off = 8 + box.h / 2;

      const node = add({
        id: `skill-${skill.name}`,
        kind: "skill",
        name: skill.name,
        icon: skill.icon,
        role: skill.role,
        disc: discipline.id,
        discTitle: discipline.title,
        ring,
        angle,
        x,
        y,
        bx: x,
        by: y,
        dirX,
        dirY,
        off,
        w: box.w,
        h: box.h,
      });
      ringNodes[ring].push(node);
    });
  }

  // Sector headers sit just outside the rim, at the circular mean of the
  // discipline's outer-ring skills.
  for (const discipline of disciplines) {
    const outer = ringNodes[2].filter((node) => node.disc === discipline.id);
    let sx = 0;
    let sy = 0;
    for (const node of outer) {
      sx += Math.cos(rad(node.angle));
      sy += Math.sin(rad(node.angle));
    }
    const angle = sx === 0 && sy === 0 ? 0 : deg(Math.atan2(sy, sx));
    const [x, y] = ellipsePoint(angle, 1.068);
    const text = `${discipline.id} ${discipline.short}`;
    const box = labelBox(text, { mono: true });
    const dx = x - CX;
    const dy = y - CY;
    const len = Math.hypot(dx, dy) || 1;

    add({
      id: `sector-${discipline.id}`,
      kind: "sector",
      disc: discipline.id,
      title: discipline.title,
      num: discipline.id,
      short: discipline.short,
      count: discipline.skills.length,
      angle,
      x,
      y,
      bx: x,
      by: y,
      dirX: dx / len,
      dirY: dy / len,
      off: 8 + box.h / 2,
      w: box.w,
      h: box.h,
      fixed: true,
    });
  }

  ANCHOR_X.forEach((x, i) => {
    add({ id: `anchor-${i}`, kind: "pin", x, y: BEAM.y, bx: x, by: BEAM.y, pinned: true });
  });
  GUYS.forEach((guy, i) => {
    add({ id: `guy-${i}`, kind: "pin", x: guy.x, y: guy.y, bx: guy.x, by: guy.y, pinned: true });
  });

  // ---- deterministic anti-overlap relaxation on label bounding boxes ----
  const boxes = nodes.map((node) => ({
    node,
    kind: node.kind,
    dirX: node.dirX || 0,
    dirY: node.dirY || 0,
    off: node.off || 0,
  }));

  const labelCenter = (node) => ({
    cx: node.x + (node.dirX || 0) * (node.off || 0),
    cy: node.y + (node.dirY || 0) * (node.off || 0),
  });

  for (let iter = 0; iter < 220; iter += 1) {
    for (let i = 0; i < boxes.length; i += 1) {
      const a = boxes[i].node;
      if (!a.w) continue;
      const ca = labelCenter(a);

      for (let j = i + 1; j < boxes.length; j += 1) {
        const b = boxes[j].node;
        if (!b.w) continue;
        const cb = labelCenter(b);
        const overlapX = (a.w + b.w) / 2 + PAD - Math.abs(ca.cx - cb.cx);
        if (overlapX <= 0) continue;
        const overlapY = (a.h + b.h) / 2 + PAD - Math.abs(ca.cy - cb.cy);
        if (overlapY <= 0) continue;

        const movableA = !a.fixed && a.kind === "skill";
        const movableB = !b.fixed && b.kind === "skill";
        if (!movableA && !movableB) continue;

        const axisX = overlapX < overlapY;
        const sign = axisX
          ? Math.sign(ca.cx - cb.cx) || 1
          : Math.sign(ca.cy - cb.cy) || 1;
        const move = (axisX ? overlapX : overlapY) * (iter < 40 ? 0.55 : 0.42);

        if (movableA && movableB) {
          if (axisX) {
            a.x += (sign * move) / 2;
            b.x -= (sign * move) / 2;
          } else {
            a.y += (sign * move) / 2;
            b.y -= (sign * move) / 2;
          }
        } else if (movableA) {
          if (axisX) a.x += sign * move;
          else a.y += sign * move;
        } else if (axisX) {
          b.x -= sign * move;
        } else {
          b.y -= sign * move;
        }
      }
    }

    // Keep every skill on its ring and inside the stage.
    for (const node of ringNodes.flat()) {
      const dx = node.x - CX;
      const dy = node.y - CY;
      const d = Math.hypot(dx, dy) || 1;
      const min = Math.min(RX, RY) * (RING_F[node.ring] - 0.035);
      const max = Math.max(RX, RY) * (RING_F[node.ring] + 0.045);
      const target = d < min ? min : d > max ? max : d;
      node.x = CX + (dx / d) * target;
      node.y = CY + (dy / d) * target;

      const center = labelCenter(node);
      const halfW = node.w / 2;
      const halfH = node.h / 2;
      if (center.cx - halfW < 12) node.x += 12 - (center.cx - halfW);
      if (center.cx + halfW > STAGE.w - 12) node.x -= center.cx + halfW - (STAGE.w - 12);
      if (center.cy - halfH < 14) node.y += 14 - (center.cy - halfH);
      if (center.cy + halfH > STAGE.h - 10) node.y -= center.cy + halfH - (STAGE.h - 10);
    }
  }

  for (const node of nodes) {
    node.bx = node.x;
    node.by = node.y;
  }

  // ---- edges ----
  const edges = [];
  const link = (a, b, kind) => {
    const an = nodes[index.get(a)];
    const bn = nodes[index.get(b)];
    edges.push({
      a: index.get(a),
      b: index.get(b),
      kind,
      base: Math.hypot(bn.bx - an.bx, bn.by - an.by) || 1,
    });
  };

  spokes.forEach((spoke) => {
    link("hub", spoke.chain[0], "spoke");
    link(spoke.chain[0], spoke.chain[1], "spoke");
    link(spoke.chain[1], spoke.chain[2], "spoke");
  });

  for (let ring = 0; ring < RING_COUNT; ring += 1) {
    for (let i = 0; i < SPOKE_COUNT; i += 1) {
      link(spokes[i].chain[ring], spokes[(i + 1) % SPOKE_COUNT].chain[ring], "ring");
    }
  }

  const nearestSpokes = (angle) => {
    const t = (((angle + 90) % 360) + 360) % 360 / SPOKE_STEP;
    const a = Math.round(t) % SPOKE_COUNT;
    return [a, (a + 1) % SPOKE_COUNT];
  };

  for (const node of ringNodes.flat()) {
    const [a, b] = nearestSpokes(node.angle);
    node.weave = [a, b];
    link(node.id, `spoke-${a}-${node.ring}`, "tether");
    link(node.id, `spoke-${b}-${node.ring}`, "tether");
  }

  for (const discipline of disciplines) {
    const sector = nodes[index.get(`sector-${discipline.id}`)];
    const [a, b] = nearestSpokes(sector.angle);
    sector.weave = [a, b];
    link(sector.id, `spoke-${a}-2`, "sector");
    link(sector.id, `spoke-${b}-2`, "sector");
  }

  ANCHOR_X.forEach((_, i) => {
    link(`anchor-${i}`, spokes[ANCHOR_SPOKES[i]].chain[2], "suspension");
  });
  GUYS.forEach((guy, i) => {
    link(`guy-${i}`, spokes[guy.spoke].chain[2], "guy");
  });

  // ---- renderable silk paths ----
  const paths = [];
  const makeSeg = (aId, bId) => {
    const a = nodes[index.get(aId)];
    const b = nodes[index.get(bId)];
    return {
      a: index.get(aId),
      b: index.get(bId),
      base: Math.hypot(b.bx - a.bx, b.by - a.by) || 1,
    };
  };

  spokes.forEach((spoke, i) => {
    paths.push({
      id: `spoke-${i}`,
      kind: "spoke",
      segs: [
        makeSeg("hub", spoke.chain[0]),
        makeSeg(spoke.chain[0], spoke.chain[1]),
        makeSeg(spoke.chain[1], spoke.chain[2]),
      ],
    });
  });

  for (let ring = 0; ring < RING_COUNT; ring += 1) {
    const segs = [];
    for (let i = 0; i < SPOKE_COUNT; i += 1) {
      segs.push(makeSeg(spokes[i].chain[ring], spokes[(i + 1) % SPOKE_COUNT].chain[ring]));
    }
    paths.push({ id: `ring-${ring}`, kind: "ring", segs, ring });
  }

  for (const node of ringNodes.flat()) {
    const [a, b] = node.weave;
    paths.push({
      id: `tether-${node.id}`,
      kind: "tether",
      disc: node.disc,
      name: node.name,
      segs: [makeSeg(`spoke-${a}-${node.ring}`, node.id), makeSeg(node.id, `spoke-${b}-${node.ring}`)],
    });
  }

  for (const discipline of disciplines) {
    const sector = nodes[index.get(`sector-${discipline.id}`)];
    const [a, b] = sector.weave;
    paths.push({
      id: `sector-line-${discipline.id}`,
      kind: "sector",
      disc: discipline.id,
      segs: [makeSeg(`spoke-${a}-2`, sector.id), makeSeg(sector.id, `spoke-${b}-2`)],
    });
  }

  ANCHOR_X.forEach((_, i) => {
    paths.push({
      id: `suspension-${i}`,
      kind: "suspension",
      segs: [makeSeg(`anchor-${i}`, spokes[ANCHOR_SPOKES[i]].chain[2])],
    });
  });
  GUYS.forEach((guy, i) => {
    paths.push({
      id: `guy-line-${i}`,
      kind: "guy",
      segs: [makeSeg(`guy-${i}`, spokes[guy.spoke].chain[2])],
    });
  });

  const nameIndex = new Map();
  nodes.forEach((node, i) => {
    if (node.kind === "skill") nameIndex.set(node.name, i);
  });

  return {
    nodes,
    edges,
    paths,
    index,
    nameIndex,
    anchors: ANCHOR_X.map((x, i) => ({ x, y: BEAM.y, id: `anchor-${i}` })),
    guys: GUYS.map((guy, i) => ({ ...guy, id: `guy-${i}` })),
    sectors: disciplines.map((d) => nodes[index.get(`sector-${d.id}`)]),
  };
}
