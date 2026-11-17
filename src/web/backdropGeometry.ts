// src/web/backdropGeometry.ts
export interface WebPoint {
  x: number;
  y: number;
}

export interface CornerWebGeometry {
  spokes: string[];
  rings: string[];
  knots: WebPoint[];
  plumbLines: string[];
}

export interface CornerWebConfig {
  cx: number;
  cy: number;
  maxRadius: number;
  startDeg: number;
  endDeg: number;
  spokeCount: number;
  ringCount: number;
  sagFactor?: number;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function buildCornerWebGeometry(config: CornerWebConfig): CornerWebGeometry {
  const { cx, cy, maxRadius, startDeg, endDeg, spokeCount, ringCount, sagFactor = 0.08 } = config;

  const spokes: string[] = [];
  const rings: string[] = [];
  const knots: WebPoint[] = [];
  const plumbLines: string[] = [];

  const fullCircle = Math.abs(endDeg - startDeg) >= 359.5;
  const angles: number[] = [];
  for (let i = 0; i < spokeCount; i++) {
    const t = fullCircle
      ? i / spokeCount
      : spokeCount === 1
        ? 0.5
        : i / (spokeCount - 1);
    angles.push(degToRad(startDeg + t * (endDeg - startDeg)));
  }

  for (const ang of angles) {
    const ex = cx + Math.cos(ang) * maxRadius;
    const ey = cy + Math.sin(ang) * maxRadius;
    spokes.push(`M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`);
  }

  for (let rIdx = 1; rIdx <= ringCount; rIdx++) {
    const ratio = Math.pow(rIdx / ringCount, 1.12);
    const radius = maxRadius * ratio;

    const ringPoints: WebPoint[] = angles.map((ang) => ({
      x: cx + Math.cos(ang) * radius,
      y: cy + Math.sin(ang) * radius,
    }));

    const segmentCount = fullCircle ? ringPoints.length : ringPoints.length - 1;
    for (let i = 0; i < ringPoints.length; i++) {
      const pt = ringPoints[i];
      if (rIdx % 2 === 1) {
        knots.push({ x: Number(pt.x.toFixed(1)), y: Number(pt.y.toFixed(1)) });
      }
      if (i < segmentCount) {
        const next = ringPoints[(i + 1) % ringPoints.length];
        const dist = Math.hypot(next.x - pt.x, next.y - pt.y);
        const mx = (pt.x + next.x) / 2;
        const my = (pt.y + next.y) / 2 + dist * sagFactor;
        rings.push(
          `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${next.x.toFixed(1)} ${next.y.toFixed(1)}`
        );
      }
    }
  }

  const outerRatio = Math.pow((ringCount - 1) / ringCount, 1.12);
  const outerR = maxRadius * outerRatio;
  for (let i = 1; i < angles.length - 1; i += 2) {
    const px = cx + Math.cos(angles[i]) * outerR;
    const py = cy + Math.sin(angles[i]) * outerR;
    const drop = 44 + (i % 3) * 28;
    plumbLines.push(
      `M ${px.toFixed(1)} ${py.toFixed(1)} L ${px.toFixed(1)} ${(py + drop).toFixed(1)}`
    );
  }

  return { spokes, rings, knots, plumbLines };
}