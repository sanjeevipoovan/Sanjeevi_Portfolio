// Pure prosoma-centered arachnid locomotion. No DOM access lives here.
// +X is forward toward the (0, 0) cursor hotspot; the body trails along -X.

export const PROSONA_X = -13;
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

export interface SpiderState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  angle: number;
  gaitPhase: number;
  speed: number;
  hoverAmount: number;
  strikeAmount: number;
}

export interface SpiderLegFrame {
  femurPath: string;
  tarsusPath: string;
  coxa: Point;
  knee: Point;
  ankle: Point;
  tip: Point;
  side: -1 | 1;
  legIndex: number;
}

interface Point {
  x: number;
  y: number;
}

interface LegPair {
  coxa: [number, number];
  femurAngle: number;
  femurLen: number;
  tibiaAngle: number;
  tibiaLen: number;
  tarsusAngle: number;
  tarsusLen: number;
  phaseOffset: number;
  swingAmp: number;
}

const LEG_PAIRS: LegPair[] = [
  {
    coxa: [2.2, 2.0],
    femurAngle: 48,
    femurLen: 9.8,
    tibiaAngle: 22,
    tibiaLen: 9.2,
    tarsusAngle: 6,
    tarsusLen: 5.8,
    phaseOffset: 0,
    swingAmp: 15,
  },
  {
    coxa: [0.7, 2.6],
    femurAngle: 78,
    femurLen: 9.0,
    tibiaAngle: 56,
    tibiaLen: 8.4,
    tarsusAngle: 36,
    tarsusLen: 5.0,
    phaseOffset: Math.PI,
    swingAmp: 13,
  },
  {
    coxa: [-1.1, 2.5],
    femurAngle: 116,
    femurLen: 7.6,
    tibiaAngle: 136,
    tibiaLen: 7.2,
    tarsusAngle: 152,
    tarsusLen: 4.4,
    phaseOffset: 0,
    swingAmp: 12,
  },
  {
    coxa: [-2.6, 1.9],
    femurAngle: 144,
    femurLen: 10.2,
    tibiaAngle: 164,
    tibiaLen: 10.0,
    tarsusAngle: 178,
    tarsusLen: 5.6,
    phaseOffset: Math.PI,
    swingAmp: 14,
  },
];

export function createSpiderState(x: number, y: number): SpiderState {
  return {
    x,
    y,
    targetX: x,
    targetY: y,
    vx: 0,
    vy: 0,
    angle: 0,
    gaitPhase: 0,
    speed: 0,
    hoverAmount: 0,
    strikeAmount: 0,
  };
}

/*
 * Exponential spring follow + travel-driven gait + posture blending.
 * `hovering` and `striking` are the live interaction states outside the model;
 * the state itself only stores the smoothed amounts the legs consume.
 */
export function stepSpiderState(
  state: SpiderState,
  dt: number,
  targetX: number,
  targetY: number,
  hovering: boolean,
  striking: boolean
): void {
  const clamped = Math.min(Math.max(dt, 0.001), 0.05);

  state.targetX = targetX;
  state.targetY = targetY;

  const followFactor = 1 - Math.exp(-32 * clamped);
  const prevX = state.x;
  const prevY = state.y;

  state.x += (targetX - state.x) * followFactor;
  state.y += (targetY - state.y) * followFactor;

  const stepX = state.x - prevX;
  const stepY = state.y - prevY;
  const stepDist = Math.hypot(stepX, stepY);

  const velBlend = 1 - Math.exp(-18 * clamped);
  const instantVx = stepX / clamped;
  const instantVy = stepY / clamped;
  state.vx += (instantVx - state.vx) * velBlend;
  state.vy += (instantVy - state.vy) * velBlend;
  state.speed = Math.hypot(state.vx, state.vy);

  if (stepDist > 0.35 && state.speed > 24) {
    const desired = Math.atan2(state.vy, state.vx);
    const turnBlend = 1 - Math.exp(-11 * clamped);
    state.angle = lerpAngle(state.angle, desired, turnBlend);
  }

  if (stepDist > 0.08) {
    state.gaitPhase = (state.gaitPhase + stepDist * 0.25) % TAU;
  }

  const postureBlend = 1 - Math.exp(-22 * clamped);
  state.hoverAmount += ((hovering ? 1 : 0) - state.hoverAmount) * postureBlend;
  state.strikeAmount += ((striking ? 1 : 0) - state.strikeAmount) * postureBlend;
}

function lerpAngle(from: number, to: number, t: number): number {
  let delta = (to - from + Math.PI) % TAU;
  if (delta < 0) delta += TAU;
  delta -= Math.PI;
  return from + delta * t;
}

function polar(origin: Point, angle: number, length: number): Point {
  return {
    x: origin.x + Math.cos(angle) * length,
    y: origin.y + Math.sin(angle) * length,
  };
}

function controlPoint(a: Point, b: Point, side: number): Point {
  return {
    x: (a.x + b.x) / 2 + side * 0.9,
    y: (a.y + b.y) / 2 + 1.35 * side,
  };
}

function fmt(value: number): string {
  return value.toFixed(2);
}

export function computeSpiderLegs(state: SpiderState): SpiderLegFrame[] {
  const motionNorm = Math.min(1, state.speed / 360);
  const frames: SpiderLegFrame[] = [];

  for (let legIndex = 0; legIndex < LEG_PAIRS.length; legIndex += 1) {
    const pair = LEG_PAIRS[legIndex];

    for (const side of [-1, 1] as const) {
      const sidePhase =
        side === 1 ? pair.phaseOffset : pair.phaseOffset + Math.PI;
      const cycle = state.gaitPhase + sidePhase;

      const swing =
        Math.sin(cycle) * pair.swingAmp * DEG * motionNorm;
      const lift = Math.max(0, Math.cos(cycle)) * motionNorm;

      const crouch =
        1 - state.strikeAmount * (legIndex >= 2 ? 0.1 : 0.04);

      let femurAngleDeg = pair.femurAngle + swing / DEG;

      if (legIndex === 0) {
        femurAngleDeg -=
          state.hoverAmount * 8 + state.strikeAmount * 12;
      } else if (legIndex === 1) {
        femurAngleDeg -=
          state.hoverAmount * 5 + state.strikeAmount * 8;
      } else {
        femurAngleDeg += state.hoverAmount * 3;
      }

      const coxa: Point = {
        x: pair.coxa[0],
        y: side * pair.coxa[1],
      };

      const femurAngle = side * femurAngleDeg * DEG;
      const knee = polar(
        coxa,
        femurAngle,
        pair.femurLen * (1 + lift * 0.07) * crouch
      );

      const tibiaAngle =
        side * (pair.tibiaAngle + (swing / DEG) * 0.85) * DEG;
      const ankle = polar(
        knee,
        tibiaAngle,
        pair.tibiaLen * (1 - lift * 0.04) * crouch
      );

      const tarsusAngle =
        side * (pair.tarsusAngle + (swing / DEG) * 0.55) * DEG;
      const tip = polar(ankle, tarsusAngle, pair.tarsusLen * crouch);

      const femurCtrl = controlPoint(coxa, knee, side);
      const femurPath = `M${fmt(coxa.x)} ${fmt(coxa.y)} Q${fmt(
        femurCtrl.x
      )} ${fmt(femurCtrl.y)} ${fmt(knee.x)} ${fmt(knee.y)}`;
      const tarsusPath = `M${fmt(knee.x)} ${fmt(knee.y)} Q${fmt(
        ankle.x
      )} ${fmt(ankle.y)} ${fmt(tip.x)} ${fmt(tip.y)}`;

      frames.push({
        femurPath,
        tarsusPath,
        coxa,
        knee,
        ankle,
        tip,
        side,
        legIndex,
      });
    }
  }

  return frames;
}

export { LEG_PAIRS };
