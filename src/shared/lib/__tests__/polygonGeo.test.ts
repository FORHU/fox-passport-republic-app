import { describe, it, expect } from "vitest";
import {
  segmentsIntersect,
  polygonsOverlap,
  ringSelfIntersects,
  isDegenerate,
  approximateAreaKm2,
  nearestPointOnSegment,
  type LngLat,
} from "../polygonGeo";

/**
 * This file mirrors the API's `utils/geo.ts` for live UI feedback while a
 * host is drawing a venue boundary — it is explicitly not the source of
 * truth, but a wrong answer here still shows a host a false "this is fine"
 * or "this overlaps" while drawing. Flagged as untested in the 5 Sep map
 * audit (docs/TOMORROW.md); this closes that gap for the client side.
 */

const square: LngLat[] = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 0],
];

describe("segmentsIntersect", () => {
  it("is true for two crossing segments", () => {
    expect(
      segmentsIntersect([0, 0], [1, 1], [0, 1], [1, 0]),
    ).toBe(true);
  });

  it("is false for two parallel, non-touching segments", () => {
    expect(
      segmentsIntersect([0, 0], [1, 0], [0, 1], [1, 1]),
    ).toBe(false);
  });
});

describe("polygonsOverlap", () => {
  it("is true for two crossing squares", () => {
    const other: LngLat[] = [
      [0.5, 0.5],
      [0.5, 1.5],
      [1.5, 1.5],
      [1.5, 0.5],
    ];
    expect(polygonsOverlap(square, other)).toBe(true);
  });

  it("is false for two disjoint squares", () => {
    const other: LngLat[] = [
      [10, 10],
      [10, 11],
      [11, 11],
      [11, 10],
    ];
    expect(polygonsOverlap(square, other)).toBe(false);
  });

  it("is true when one polygon is fully contained in the other", () => {
    const inner: LngLat[] = [
      [0.25, 0.25],
      [0.25, 0.75],
      [0.75, 0.75],
      [0.75, 0.25],
    ];
    expect(polygonsOverlap(square, inner)).toBe(true);
  });

  it("is false for a ring that isn't a real polygon yet (mid-draw)", () => {
    const twoPoints: LngLat[] = [
      [0, 0],
      [1, 1],
    ];
    expect(polygonsOverlap(square, twoPoints)).toBe(false);
  });
});

describe("ringSelfIntersects", () => {
  it("is false for a simple square", () => {
    expect(ringSelfIntersects(square)).toBe(false);
  });

  it("is true for a bowtie / figure-eight shape", () => {
    const bowtie: LngLat[] = [
      [0, 0],
      [1, 1],
      [0, 1],
      [1, 0],
    ];
    expect(ringSelfIntersects(bowtie)).toBe(true);
  });

  it("is false with fewer than 4 points — nothing to cross yet", () => {
    expect(ringSelfIntersects([[0, 0], [1, 1], [0, 1]])).toBe(false);
  });
});

describe("isDegenerate", () => {
  it("is false for a real square", () => {
    expect(isDegenerate(square)).toBe(false);
  });

  it("is true for three collinear points (a line, not a shape)", () => {
    const line: LngLat[] = [
      [0, 0],
      [0.5, 0.5],
      [1, 1],
    ];
    expect(isDegenerate(line)).toBe(true);
  });
});

describe("approximateAreaKm2", () => {
  it("is roughly 1 km² for a ~1km square at the equator", () => {
    // 1 km at the equator is ~1/111.32 degrees on a side.
    const side = 1 / 111.32;
    const kmSquare: LngLat[] = [
      [0, 0],
      [0, side],
      [side, side],
      [side, 0],
    ];
    expect(approximateAreaKm2(kmSquare)).toBeCloseTo(1, 1);
  });

  it("is 0 for fewer than 3 points", () => {
    expect(approximateAreaKm2([[0, 0], [1, 1]])).toBe(0);
  });
});

describe("nearestPointOnSegment", () => {
  it("projects onto the middle of a segment", () => {
    expect(nearestPointOnSegment([0.5, 1], [0, 0], [1, 0])).toEqual([0.5, 0]);
  });

  it("clamps to the segment's start when the projection falls before it", () => {
    expect(nearestPointOnSegment([-5, 5], [0, 0], [10, 0])).toEqual([0, 0]);
  });

  it("clamps to the segment's end when the projection falls past it", () => {
    expect(nearestPointOnSegment([15, 5], [0, 0], [10, 0])).toEqual([10, 0]);
  });

  it("returns the single point for a zero-length segment", () => {
    expect(nearestPointOnSegment([5, 5], [2, 2], [2, 2])).toEqual([2, 2]);
  });
});
