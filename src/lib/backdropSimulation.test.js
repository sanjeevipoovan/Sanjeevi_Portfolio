import test from "node:test";
import assert from "node:assert/strict";
import {
  POINTER_RADIUS,
  RING_FRACTIONS,
  RIPPLE_RADIUS,
  SPOKES,
  createBackdropSimulation,
} from "./backdropSimulation.js";

const W = 1280;
const H = 800;

function distanceFromBase(node) {
  return Math.hypot(node.x - node.bx, node.y - node.by);
}

test("orb web construction is deterministic and stays in bounds", () => {
  const a = createBackdropSimulation(W, H);
  const b = createBackdropSimulation(W, H);

  assert.ok(a.nodes.length > 60, "expected a populated silk field");
  assert.ok(a.edges.length > 80, "expected a populated silk lattice");
  assert.equal(a.web.spokes.length, SPOKES, "one radius per spoke");
  assert.equal(a.web.rings.length, RING_FRACTIONS.length, "capture spiral rings");
  assert.equal(
    a.web.anchors.filter((id) => a.nodes[id].pinned).length,
    SPOKES,
    "the outer radii are pinned to their anchors"
  );
  assert.ok(a.strands.length >= 4, "gossamer strands cross the viewport");

  assert.deepEqual(
    a.nodes.map((node) => [node.bx, node.by]),
    b.nodes.map((node) => [node.bx, node.by]),
    "the same seed must build the same mesh"
  );

  for (const node of a.nodes) {
    assert.equal(node.x, node.bx);
    assert.equal(node.y, node.by);
    assert.equal(node.vx, 0);
    assert.equal(node.vy, 0);
    if (node.pinned || node.kind === "web") continue;
    assert.ok(node.bx >= 0 && node.bx <= W, `x ${node.bx} inside width`);
    assert.ok(node.by >= 0 && node.by <= H, `y ${node.by} inside height`);
  }

  for (const edge of a.edges) {
    assert.ok(edge.a >= 0 && edge.a < a.nodes.length);
    assert.ok(edge.b >= 0 && edge.b < a.nodes.length);
    assert.notEqual(edge.a, edge.b);
  }
});

test("pinned anchors never move under any interaction", () => {
  const sim = createBackdropSimulation(W, H);
  const anchors = sim.nodes.filter((node) => node.pinned);
  const before = anchors.map((node) => [node.x, node.y]);

  sim.setPointer(200, 200);
  sim.setPointer(260, 240);
  sim.ripple(W / 2, H / 2);
  sim.addScroll(400);
  for (let i = 0; i < 180; i += 1) sim.step(1 / 60);

  anchors.forEach((node, i) => {
    assert.deepEqual([node.x, node.y], before[i]);
    assert.equal(node.vx, 0);
    assert.equal(node.vy, 0);
  });
});

test("pointer plucks and click ripples displace knots then settle", () => {
  const sim = createBackdropSimulation(W, H);
  const ambient = sim.nodes.find((node) => node.kind === "ambient" && !node.pinned);
  const webKnot = sim.nodes.find((node) => node.kind === "web" && !node.pinned);
  assert.ok(ambient && webKnot);

  // The first move only arms the pointer; the second delivers the pluck.
  sim.setPointer(ambient.x - 80, ambient.y - 80);
  sim.setPointer(ambient.x + 60, ambient.y + 40);
  sim.step(1 / 60);
  assert.ok(
    distanceFromBase(ambient) > 0.8,
    "cursor speed should pluck nearby knots"
  );

  sim.clearPointer();
  sim.ripple(webKnot.x, webKnot.y);
  assert.equal(sim.ripples.length, 1);
  sim.step(1 / 60);
  assert.ok(
    distanceFromBase(webKnot) > 1,
    "the tension wave should push knots outward"
  );
  assert.ok(webKnot.energy > 0, "the shockwave should leave an energy glow");

  // No pointer, no ripples: the silk must relax back to a calm drift.
  for (let i = 0; i < 600; i += 1) sim.step(1 / 60);
  assert.ok(
    distanceFromBase(ambient) < 8,
    `ambient knot should settle, moved ${distanceFromBase(ambient)}px`
  );
  assert.ok(
    Math.hypot(ambient.vx, ambient.vy) < 2,
    "ambient velocity should decay to a calm drift"
  );
  assert.equal(sim.ripples.length, 0, "shockwaves expire");
});

test("only nodes within the pointer and ripple radii are captured", () => {
  const sim = createBackdropSimulation(W, H);
  const nodes = sim.nodes.filter((node) => !node.pinned);
  const near = nodes.find((node) => node.kind === "ambient");
  const far = nodes.reduce((best, node) => {
    const d = Math.hypot(node.x - near.x, node.y - near.y);
    return d > best.d ? { node, d } : best;
  }, { node: near, d: 0 }).node;

  assert.ok(Math.hypot(far.x - near.x, far.y - near.y) > POINTER_RADIUS * 1.1);

  sim.setPointer(near.x - 40, near.y);
  sim.setPointer(near.x, near.y);
  sim.step(1 / 60);
  assert.ok(Math.hypot(far.vx, far.vy) < 1, "far strands stay untouched");

  for (const node of sim.nodes) {
    node.vx = 0;
    node.vy = 0;
    node.energy = 0;
  }
  sim.ripple(far.x, far.y);
  assert.ok(
    far.vx > 0 || far.vy > 0 || far.energy > 0,
    "a knot at the wave centre is energized"
  );
  assert.ok(RIPPLE_RADIUS > POINTER_RADIUS);
});

test("scroll inertia sways the suspended web vertically", () => {
  const sim = createBackdropSimulation(W, H);
  const node = sim.nodes.find(
    (candidate) => candidate.kind === "web" && candidate.ring === 3
  );
  const startY = node.y;

  sim.addScroll(180);
  sim.step(1 / 60);
  assert.ok(node.vy > 0, "a downward draft should push the web down");
  assert.ok(node.y > startY, "the suspended web should physically move");

  for (let i = 0; i < 90; i += 1) sim.step(1 / 60);
  assert.ok(
    distanceFromBase(node) < 40,
    "scroll sway should stay subtle rather than tearing the web"
  );
});

test("reduced motion snaps and holds every knot at rest", () => {
  const sim = createBackdropSimulation(W, H);
  sim.setPointer(300, 300);
  sim.setPointer(420, 360);
  sim.ripple(640, 400);
  sim.addScroll(300);
  for (let i = 0; i < 30; i += 1) sim.step(1 / 60);
  assert.ok(sim.energy() > 0);

  sim.setReducedMotion(true);
  assert.equal(sim.reducedMotion, true);
  for (const node of sim.nodes) {
    assert.equal(node.x, node.bx);
    assert.equal(node.y, node.by);
    assert.equal(node.vx, 0);
    assert.equal(node.vy, 0);
    assert.equal(node.energy, 0);
  }
  assert.equal(sim.ripples.length, 0);
  assert.equal(sim.scrollVel, 0);

  // Inputs and stepping must not wake a reduced-motion mesh.
  sim.ripple(400, 400);
  sim.setPointer(400, 400);
  sim.addScroll(200);
  sim.step(1 / 60);
  assert.equal(sim.energy(), 0);
  assert.equal(sim.ripples.length, 0);
  assert.equal(sim.scrollVel, 0);

  const staticSim = createBackdropSimulation(W, H, { reducedMotion: true });
  assert.equal(staticSim.energy(), 0);
  for (const node of staticSim.nodes) {
    assert.equal(node.x, node.bx);
    assert.equal(node.y, node.by);
  }
});
