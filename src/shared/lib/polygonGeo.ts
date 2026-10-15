// Client-side mirror of the polygon math in fox-passport-republic-api's
// utils/geo.ts — used for live feedback (self-intersection, overlap, area)
// while drawing. The backend re-validates independently on submit; nothing
// here is the source of truth.

export type LngLat = [number, number];

function closeRing(ring: LngLat[]): LngLat[] {
  if (ring.length < 2) return ring;
  const [first] = ring;
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return ring;
  return [...ring, first];
}

function orientation(a: LngLat, b: LngLat, c: LngLat): number {
  const val = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);
  if (Math.abs(val) < Number.EPSILON) return 0;
  return val > 0 ? 1 : 2;
}

function onSegment(a: LngLat, b: LngLat, c: LngLat): boolean {
  return (
    b[0] <= Math.max(a[0], c[0]) &&
    b[0] >= Math.min(a[0], c[0]) &&
    b[1] <= Math.max(a[1], c[1]) &&
    b[1] >= Math.min(a[1], c[1])
  );
}

export function segmentsIntersect(
  p1: LngLat,
  p2: LngLat,
  p3: LngLat,
  p4: LngLat,
): boolean {
  const o1 = orientation(p1, p2, p3);
  const o2 = orientation(p1, p2, p4);
  const o3 = orientation(p3, p4, p1);
  const o4 = orientation(p3, p4, p2);

  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p3, p2)) return true;
  if (o2 === 0 && onSegment(p1, p4, p2)) return true;
  if (o3 === 0 && onSegment(p3, p1, p4)) return true;
  if (o4 === 0 && onSegment(p3, p2, p4)) return true;
  return false;
}

function pointInPolygon(point: LngLat, ring: LngLat[]): boolean {
  const [x, y] = point;
  let inside = false;
  const closed = closeRing(ring);

  for (let i = 0, j = closed.length - 2; i < closed.length - 1; j = i++) {
    const [xi, yi] = closed[i];
    const [xj, yj] = closed[j];
    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function polygonsOverlap(a: LngLat[], b: LngLat[]): boolean {
  if (a.length < 3 || b.length < 3) return false;
  const ringA = closeRing(a);
  const ringB = closeRing(b);

  for (let i = 0; i < ringA.length - 1; i++) {
    for (let j = 0; j < ringB.length - 1; j++) {
      if (segmentsIntersect(ringA[i], ringA[i + 1], ringB[j], ringB[j + 1])) {
        return true;
      }
    }
  }
  return pointInPolygon(ringA[0], ringB) || pointInPolygon(ringB[0], ringA);
}

/**
 * True when any two non-adjacent edges of this ring itself cross — a shape
 * a host drew "wrong" (a bowtie/figure-eight) rather than a valid simple
 * polygon.
 */
export function ringSelfIntersects(ring: LngLat[]): boolean {
  if (ring.length < 4) return false;
  const closed = closeRing(ring);
  const edgeCount = closed.length - 1;

  for (let i = 0; i < edgeCount; i++) {
    for (let j = i + 1; j < edgeCount; j++) {
      const adjacent = j === i + 1 || (i === 0 && j === edgeCount - 1);
      if (adjacent) continue;
      if (
        segmentsIntersect(closed[i], closed[i + 1], closed[j], closed[j + 1])
      ) {
        return true;
      }
    }
  }
  return false;
}

/** Shoelace-formula area in squared degrees — cheap degenerate-shape check. */
function ringAreaDeg2(ring: LngLat[]): number {
  const closed = closeRing(ring);
  let sum = 0;
  for (let i = 0; i < closed.length - 1; i++) {
    const [x1, y1] = closed[i];
    const [x2, y2] = closed[i + 1];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

const MIN_AREA_DEG2 = 1e-10;

export function isDegenerate(ring: LngLat[]): boolean {
  return ringAreaDeg2(ring) < MIN_AREA_DEG2;
}

/**
 * Approximate geodesic area in km², via an equirectangular projection to
 * meters around the ring's mean latitude. Good enough for a "here's roughly
 * how big this is" display at city scale; not survey-grade.
 */
export function approximateAreaKm2(ring: LngLat[]): number {
  if (ring.length < 3) return 0;
  const meanLat = ring.reduce((sum, [, lat]) => sum + lat, 0) / ring.length;
  const latRad = (meanLat * Math.PI) / 180;
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos(latRad);

  const meters: LngLat[] = ring.map(([lng, lat]) => [
    lng * metersPerDegLng,
    lat * metersPerDegLat,
  ]);
  return ringAreaDeg2(meters) / 1_000_000;
}

/** Closest point to `p` on segment (a, b), clamped to the segment. */
export function nearestPointOnSegment(p: LngLat, a: LngLat, b: LngLat): LngLat {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) return a;

  let t = ((px - ax) * dx + (py - ay) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  return [ax + t * dx, ay + t * dy];
}
