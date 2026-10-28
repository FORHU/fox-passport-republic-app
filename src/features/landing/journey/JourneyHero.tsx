"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  cancelFrame,
  frame,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { LightsSpecification } from "mapbox-gl";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { MapBoxView } from "@/shared/components/ui/MapBoxView";
import { applyMapTheme } from "@/shared/lib/mapbox";
import { useMapThemeStore } from "@/shared/store/useMapThemeStore";
import { useThemeStore } from "@/shared/store/useThemeStore";
import {
  DESTINATIONS,
  buildStops,
  buildEventLocations,
  mergeLocationsByCity,
  eventLocationCollection,
  useEvents,
  useFoxerTotal,
  useVenues,
  type LandingEventLocation,
  type LandingVenue,
  type Stop,
} from "./data";
import { CountUp, Kicker, MaskLines } from "./motion";
import { Lightbox } from "./Lightbox";
import { HeroSearch } from "./booking";
import { InstallAppButton } from "./InstallAppButton";

const ACCENT = "#ccff00";
const STOPS = DESTINATIONS.length;
// How much scrolling (in screen heights ×100) each place gets. This is the
// tour's speed: more is a slower, calmer flight. Every 0–1 fraction below
// scales with it, so nothing else needs retuning.
const VH_PER_STOP = 130;
// How close the camera is at a place. A flat map this close is cheap to draw.
const ZOOM_IN = 6.4;

// The scroll runs in a cycle for every leg: rest at a place, pull out, fly,
// come back in. These are the parts of one leg (0–1) where each happens.
const REST_END = 0.2;
const OUT_END = 0.4;
const FLY_END = 0.72;
const IN_END = 0.9;

// Where the tour starts and ends along the scroll (0–1), outside of which the
// map is the whole world and the headline and closing card show.
const START = 0.1;
// The last place is reached here; the camera then stays on it for HOLD more
// before pulling back out, so its card has a rest of its own.
const END = 0.86;
const HOLD = 0.04;
const OUT_FROM = END + HOLD;
const LEGS = STOPS - 1;
const LEG = (END - START) / LEGS;
/** Where place `i` is reached along the scroll. */
const stopAt = (i: number) => START + i * LEG;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type LngLat = [number, number];

/** A bowed arc between two places, the way a flight is drawn on a chart. */
function arc(a: LngLat, b: LngLat, t: number, steps = 60): LngLat[] {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const bow = 0.16;
  const cx = mx - dy * bow;
  const cy = my + dx * bow;
  const n = Math.max(2, Math.round(steps * t));
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = (i / n) * t;
    const lng = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * cx + u * u * b[0];
    const lat = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * cy + u * u * b[1];
    return [lng, Math.max(-80, Math.min(80, lat))] as LngLat;
  });
}

/** Longitudes made continuous along the tour, so no flight goes the long way. */
function unwrap(points: LngLat[]): LngLat[] {
  const out: LngLat[] = [];
  points.forEach((p, i) => {
    let lng = p[0];
    if (i > 0) {
      const prev = out[i - 1][0];
      while (lng - prev > 180) lng -= 360;
      while (lng - prev < -180) lng += 360;
    }
    out.push([lng, p[1]]);
  });
  return out;
}

function pointsFC(
  items: { lat: number; lng: number }[],
  props: (i: any) => object,
) {
  return {
    type: "FeatureCollection" as const,
    features: items.map((v) => ({
      type: "Feature" as const,
      properties: props(v),
      geometry: { type: "Point" as const, coordinates: [v.lng, v.lat] },
    })),
  };
}

function lineFC(coordinates: LngLat[]) {
  return {
    type: "FeatureCollection" as const,
    features:
      coordinates.length > 1
        ? [
            {
              type: "Feature" as const,
              properties: {},
              geometry: { type: "LineString" as const, coordinates },
            },
          ]
        : [],
  };
}

const PLANE_PARTS = [
  // wings, tail, fuselage: outlined first, then filled, like the old canvas.
  "M72 46 L120 82 L120 91 L72 74 Z M56 46 L8 82 L8 91 L56 74 Z",
  "M70 100 L96 114 L96 120 L70 112 Z M58 100 L32 114 L32 120 L58 112 Z",
  "M64 4 C70 4 72 14 72 26 L72 96 C72 106 68 114 64 120 C60 114 56 106 56 96 L56 26 C56 14 58 4 64 4 Z",
];

/**
 * The plane. A DOM element over the map, moved with a CSS transform in the same
 * frame as the camera (see `drawPlane`). As a GeoJSON layer it was parsed in a
 * worker and drawn a frame or more behind the camera, so it wobbled and lagged.
 */
function PlaneGlyph({ color }: { color: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 128 128"
      aria-hidden="true"
      style={{
        display: "block",
        filter: "drop-shadow(0 2px 3.5px rgba(0,0,0,0.55))",
      }}
    >
      <g
        fill="none"
        stroke="rgba(0,0,0,0.9)"
        strokeWidth="5"
        strokeLinejoin="round"
      >
        {PLANE_PARTS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill={color}>
        {PLANE_PARTS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill="rgba(0,0,0,0.38)">
        <ellipse cx="90" cy="76" rx="4.6" ry="10" />
        <ellipse cx="38" cy="76" rx="4.6" ry="10" />
        <ellipse cx="64" cy="20" rx="5" ry="7" />
      </g>
    </svg>
  );
}

/** Web Mercator, the space the map measures a line's length in (line-progress). */
const mercator = ([lng, lat]: LngLat): [number, number] => {
  const phi = (Math.max(-85, Math.min(85, lat)) * Math.PI) / 180;
  return [lng / 360, Math.log(Math.tan(Math.PI / 4 + phi / 2)) / (2 * Math.PI)];
};

/** An angle as the equivalent one between -180 and 180 degrees. */
const wrapDeg = (d: number) => (((d % 360) + 540) % 360) - 180;

/**
 * How often it is decided which places get a card, and on which side. Where a
 * card is drawn is not decided here: that is re-read from the map on every
 * frame (see `onFrame`), so cards are fixed to the globe, not trailing it.
 */
const CALLOUT_UPDATE_MS = 100;

/** How fast the world turns behind the closing card. */
const SPIN_DEG_PER_SEC = 5;
/** Up to here the world is still waiting for the first scroll. */
const IDLE_END = 0.02;

// The sky round the planet: a warm dusk for dark mode, a clear day for light.
const DUSK_SKY = {
  color: "rgb(22,32,44)",
  "high-color": "rgb(2,4,10)",
  "horizon-blend": 0.12,
  "space-color": "rgb(2,4,10)",
  "star-intensity": 0.35,
};
const DAY_SKY = {
  color: "rgb(105,184,238)",
  "high-color": "rgb(221,242,255)",
  "horizon-blend": 0.2,
  "space-color": "rgb(232,239,244)",
  "star-intensity": 0,
};
const DAYLIGHT_LIGHTS = [
  {
    id: "daylight-fill",
    type: "ambient",
    properties: { color: "#fff8e8", intensity: 0.7 },
  },
  {
    id: "daylight-sun",
    type: "directional",
    properties: {
      color: "#fff2cf",
      direction: [210, 40],
      intensity: 0.8,
      "cast-shadows": true,
      "shadow-intensity": 0.18,
    },
  },
] satisfies LightsSpecification[];

// NASA's static VIIRS composite gives geographic night-light patterns, not a
// live terminator; keep its own attribution attached to the raster source.
export const CITY_LIGHTS_RASTER_SOURCE = {
  type: "raster",
  tiles: [
    "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg",
  ],
  tileSize: 256,
  maxzoom: 8,
  attribution:
    "NASA Earth Observatory / NASA EOSDIS Global Imagery Browse Services (GIBS)",
} as const;

export const CITY_LIGHTS_RASTER_PAINT = {
  "raster-opacity": 0.48,
  "raster-fade-duration": 0,
  "raster-brightness-min": 0.02,
  "raster-brightness-max": 0.9,
  "raster-contrast": 0.35,
  "raster-saturation": -0.1,
} as const;

// Land and water in real colours, so the map is not just black and grey. These
// are paint changes on the basemap's own layers, so they cost nothing to draw.
const TINTS = {
  dark: {
    land: "#222d3c",
    water: "#0a101a",
    park: "#14251d",
    landuse: "#233044",
  },
  light: {
    land: "#a9ce8d",
    water: "#378fca",
    park: "#72b65f",
    landuse: "#91c779",
  },
} as const;

export function applyJourneyMapTheme(map: any, theme: "dark" | "light") {
  const t = TINTS[theme];
  const set = (id: string, prop: string, value: string) => {
    try {
      if (map.getLayer(id)) map.setPaintProperty(id, prop, value);
    } catch {
      // A layer that is not in this basemap.
    }
  };
  set("land", "background-color", t.land);
  set("water", "fill-color", t.water);
  set("national-park", "fill-color", t.park);
  set("landuse", "fill-color", t.landuse);
  map.setLights(theme === "light" ? DAYLIGHT_LIGHTS : null);
  try {
    map.setFog(theme === "light" ? DAY_SKY : DUSK_SKY);
  } catch {
    // The fallback basemap has no sky; nothing to set.
  }
}

export function closestVisibleEventLocation(
  map: any,
  locations: LandingEventLocation[],
): LandingEventLocation | null {
  const center = map.getCenter();
  const centerLat = (center.lat * Math.PI) / 180;
  const maxAngle = (78 * Math.PI) / 180;
  const minDot = Math.cos(maxAngle);
  let closest: LandingEventLocation | null = null;
  let closestDot = minDot;

  for (const location of locations) {
    const lat = (location.lat * Math.PI) / 180;
    const longitudeDelta = ((location.lng - center.lng) * Math.PI) / 180;
    const dot =
      Math.sin(centerLat) * Math.sin(lat) +
      Math.cos(centerLat) * Math.cos(lat) * Math.cos(longitudeDelta);
    if (dot > closestDot) {
      closest = location;
      closestDot = dot;
    }
  }
  return closest;
}

type ProjectedEventLocation = {
  location: LandingEventLocation;
  /** See `PositionedEventCallout.dot`. */
  dot: number;
  point: { x: number; y: number };
};

type EventCalloutRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type PositionedEventCallout = {
  location: LandingEventLocation;
  markerX: number;
  markerY: number;
  left: number;
  top: number;
  edgeX: number;
  edgeY: number;
  /** How face-on the place is to the camera: 1 at the centre, ~0.2 at the limb. */
  dot: number;
};

/** 1 at the middle of the visible disc, 0 at its edge, negative behind it. */
function eventLocationDot(map: any, location: LandingEventLocation): number {
  const center = map.getCenter();
  const centerLat = (center.lat * Math.PI) / 180;
  const lat = (location.lat * Math.PI) / 180;
  const longitudeDelta = ((location.lng - center.lng) * Math.PI) / 180;
  return (
    Math.sin(centerLat) * Math.sin(lat) +
    Math.cos(centerLat) * Math.cos(lat) * Math.cos(longitudeDelta)
  );
}

function projectVisibleEventLocations(
  map: any,
  locations: LandingEventLocation[],
  width: number,
  height: number,
): ProjectedEventLocation[] {
  const minDot = Math.cos((78 * Math.PI) / 180);

  return locations
    .map((location) => ({ location, dot: eventLocationDot(map, location) }))
    .filter(({ dot }) => dot > minDot)
    .sort((a, b) => b.dot - a.dot)
    .slice(0, MAX_EVENT_CALLOUT_CANDIDATES)
    .map(({ location, dot }) => ({
      location,
      dot,
      point: projectEventLocation(map, location),
    }))
    .filter(
      ({ point }) =>
        Number.isFinite(point.x) &&
        Number.isFinite(point.y) &&
        isEventCalloutInsideMap(point, width, height),
    );
}

/**
 * Cards already on screen keep their place in the queue and their side of the
 * pin; a new one needs the place to be well clear of the limb and then goes in
 * by event count. Ranking by distance from the centre instead meant the order
 * changed every frame the world turned, so cards swapped pins and hopped
 * between sides.
 */
function placeEventCallouts(
  candidates: ProjectedEventLocation[],
  width: number,
  height: number,
  avoid?: EventCalloutRect,
  previous: PositionedEventCallout[] = [],
): PositionedEventCallout[] {
  const shown = new Map(previous.map((card, i) => [card.location.key, i]));
  const points = candidates
    .filter(
      ({ location, dot }) =>
        shown.has(location.key) || dot >= EVENT_CALLOUT_ENTER_DOT,
    )
    .sort((a, b) => {
      const sa = shown.get(a.location.key);
      const sb = shown.get(b.location.key);
      if (sa !== undefined || sb !== undefined) {
        return (sa ?? Infinity) - (sb ?? Infinity);
      }
      return (
        b.location.events.length - a.location.events.length || b.dot - a.dot
      );
    });
  const size = calloutSize(width);
  const side = new Map(
    previous.map((card) => [
      card.location.key,
      { dx: card.left - card.markerX, dy: card.top - card.markerY },
    ]),
  );
  const markerSize = 12;
  const markers = points.map(({ point }) => ({
    left: point.x - markerSize / 2,
    top: point.y - markerSize / 2,
    right: point.x + markerSize / 2,
    bottom: point.y + markerSize / 2,
  }));
  const occupied: EventCalloutRect[] = avoid ? [avoid] : [];
  const cards: EventCalloutRect[] = [];
  const lines: CalloutLine[] = [];
  const placed: PositionedEventCallout[] = [];

  points.forEach(({ location, point, dot }, index) => {
    if (placed.length >= size.max) return;
    const blockers = [
      ...occupied,
      ...markers.filter((_, markerIndex) => markerIndex !== index),
    ];
    const placement = getEventCalloutPlacement(
      point,
      width,
      height,
      blockers,
      side.get(location.key),
      { cards, lines },
    );
    if (!placement) return;

    const callout = {
      location,
      markerX: point.x,
      markerY: point.y,
      dot,
      ...placement,
    };
    placed.push(callout);
    const rect = {
      left: placement.left,
      top: placement.top,
      right: placement.left + size.width,
      bottom: placement.top + size.height,
    };
    occupied.push(rect);
    cards.push(rect);
    lines.push([point.x, point.y, placement.edgeX, placement.edgeY]);
  });

  return placed;
}

export function getVisibleEventCalloutPlacements(
  map: any,
  locations: LandingEventLocation[],
  width: number,
  height: number,
  avoid?: EventCalloutRect,
  /** The cards shown a moment ago; they keep their place and side. */
  previous?: PositionedEventCallout[],
): PositionedEventCallout[] {
  return placeEventCallouts(
    projectVisibleEventLocations(map, locations, width, height),
    width,
    height,
    avoid,
    previous,
  );
}

export function projectEventLocation(
  map: any,
  location: LandingEventLocation,
): { x: number; y: number } {
  const point = map.project([location.lng, location.lat]);
  return { x: point.x, y: point.y };
}

export function isEventCalloutInsideMap(
  point: { x: number; y: number },
  width: number,
  height: number,
): boolean {
  return (
    width >= 240 &&
    height >= 120 &&
    point.x >= 0 &&
    point.x <= width &&
    point.y >= 0 &&
    point.y <= height
  );
}

const EVENT_CALLOUT_WIDTH = 208;
const EVENT_CALLOUT_HEIGHT = 80;
/** Below this the hero is a phone layout: smaller cards, and only two. */
const COMPACT_BELOW = 640;
/** The site header floats over the top of the map; cards stay under it. */
const EVENT_CALLOUT_TOP_INSET = 88;

/** Keep the card classes in `GlobeEventCalloutCard` in step with these. */
function calloutSize(viewportWidth: number) {
  return viewportWidth < COMPACT_BELOW
    ? { width: 160, height: 68, max: 2 }
    : {
        width: EVENT_CALLOUT_WIDTH,
        height: EVENT_CALLOUT_HEIGHT,
        max: MAX_EVENT_CALLOUTS,
      };
}
const MAX_EVENT_CALLOUT_CANDIDATES = 24;
/** Few enough to read, and to keep clear of one another on a turning globe. */
const MAX_EVENT_CALLOUTS = 4;
/** A place has to be this face-on before a new card is offered for it. */
const EVENT_CALLOUT_ENTER_DOT = 0.4;
/** Between these a card fades, so the limb never pops one in or out. */
const EVENT_CALLOUT_FADE_FROM_DOT = 0.22;

/** Farthest a card may sit from its pin, edge to edge. Further out it is
 * left off rather than strung across the globe on a long line. */
const EVENT_CALLOUT_MAX_DISTANCE = 220;

type CalloutLine = [x1: number, y1: number, x2: number, y2: number];

/** Liang-Barsky: does the segment cross (or sit inside) the rectangle? */
function lineHitsRect(
  [ax, ay, bx, by]: CalloutLine,
  rect: EventCalloutRect,
): boolean {
  const dx = bx - ax;
  const dy = by - ay;
  const p = [-dx, dx, -dy, dy];
  const q = [ax - rect.left, rect.right - ax, ay - rect.top, rect.bottom - ay];
  let t0 = 0;
  let t1 = 1;
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
      continue;
    }
    const t = q[i] / p[i];
    if (p[i] < 0) {
      if (t > t1) return false;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return false;
      if (t < t1) t1 = t;
    }
  }
  return true;
}

/**
 * The spot for a card: the one nearest its pin that is on screen, clear of
 * everything in `avoid`, and does not put its connector through another card
 * or another card through its connector. The side it had last time wins as
 * long as it is still good, so cards don't flip as the globe turns.
 */
export function getEventCalloutPlacement(
  point: { x: number; y: number },
  width: number,
  height: number,
  avoid?: EventCalloutRect | EventCalloutRect[],
  /** Where the card sat relative to the pin last time. */
  prefer?: { dx: number; dy: number },
  /** Cards and connectors already placed this frame. */
  placed?: { cards: EventCalloutRect[]; lines: CalloutLine[] },
): { left: number; top: number; edgeX: number; edgeY: number } | null {
  const { width: cardWidth, height: cardHeight } = calloutSize(width);
  const margin = 8;
  const gap = 16;
  const avoidRects = avoid ? (Array.isArray(avoid) ? avoid : [avoid]) : [];
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const candidates: { left: number; top: number }[] = [];
  if (prefer) {
    candidates.push({ left: point.x + prefer.dx, top: point.y + prefer.dy });
  }
  candidates.push(
    { left: point.x - cardWidth / 2, top: point.y - cardHeight - gap },
    { left: point.x + gap, top: point.y - cardHeight / 2 },
    { left: point.x - cardWidth / 2, top: point.y + gap },
    { left: point.x - cardWidth - gap, top: point.y - cardHeight / 2 },
  );
  for (const rect of avoidRects) {
    const top = clamp(
      point.y - cardHeight / 2,
      EVENT_CALLOUT_TOP_INSET,
      height - cardHeight - margin,
    );
    candidates.push(
      { left: rect.right + gap, top },
      { left: rect.left - cardWidth - gap, top },
    );
  }
  // Further out in eight directions, for when the near sides are taken.
  for (const ring of [gap + 40, gap + 80, gap + 120, gap + 160]) {
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const ux = Math.cos(angle);
      const uy = Math.sin(angle);
      const reach =
        ring + Math.abs(ux) * (cardWidth / 2) + Math.abs(uy) * (cardHeight / 2);
      candidates.push({
        left: point.x + ux * reach - cardWidth / 2,
        top: point.y + uy * reach - cardHeight / 2,
      });
    }
  }

  let best: { left: number; top: number; edgeX: number; edgeY: number } | null =
    null;
  let bestDistance = Infinity;
  candidates.forEach(({ left, top }, index) => {
    if (
      left < margin ||
      top < EVENT_CALLOUT_TOP_INSET ||
      left + cardWidth > width - margin ||
      top + cardHeight > height - margin
    ) {
      return;
    }
    const rect = {
      left,
      top,
      right: left + cardWidth,
      bottom: top + cardHeight,
    };
    const overlaps = (other: EventCalloutRect) =>
      rect.left < other.right &&
      rect.right > other.left &&
      rect.top < other.bottom &&
      rect.bottom > other.top;
    if (avoidRects.some(overlaps)) return;

    const edgeX = clamp(point.x, rect.left, rect.right);
    const edgeY = clamp(point.y, rect.top, rect.bottom);
    const distance = Math.hypot(edgeX - point.x, edgeY - point.y);
    if (distance > EVENT_CALLOUT_MAX_DISTANCE) return;

    const line: CalloutLine = [point.x, point.y, edgeX, edgeY];
    if (placed?.cards.some((card) => lineHitsRect(line, card))) return;
    if (placed?.lines.some((other) => lineHitsRect(other, rect))) return;

    // The remembered side wins outright; otherwise the nearest spot does.
    const remembered = prefer !== undefined && index === 0;
    if (remembered || distance < bestDistance) {
      best = { left, top, edgeX, edgeY };
      bestDistance = remembered ? -1 : distance;
    }
  });

  return best;
}

// ---------------------------------------------------------------------------
// The map, driven by scroll
// ---------------------------------------------------------------------------

function JourneyMap({
  venues,
  eventLocations,
  calloutLocations,
  stops,
  progress,
  onDrawn,
  onEventCalloutPointsChange,
  onFrame,
  spinPaused,
  inView,
}: {
  venues: LandingVenue[];
  eventLocations: LandingEventLocation[];
  /** One place per city, for the cards. `eventLocations` stays one per venue point, for the dots. */
  calloutLocations: LandingEventLocation[];
  stops: Stop[];
  progress: MotionValue<number>;
  /** Called once the map has drawn its first frame. */
  onDrawn: () => void;
  onEventCalloutPointsChange: (points: ProjectedEventLocation[]) => void;
  /** Run right after the camera moves, before the browser paints that frame. */
  onFrame: { current: ((map: any) => void) | null };
  /** True while a card is under the pointer: the world holds still so it can be clicked. */
  spinPaused: { current: boolean };
  /** False once the hero has scrolled out of sight: nothing is drawn for it then. */
  inView: { current: boolean };
}) {
  const mapRef = useRef<any>(null);
  const theme = useThemeStore((st) => st.theme);
  // The route has to read on both basemaps: lime on dark, deep green on light.
  const ink = theme === "light" ? "#3f6b00" : ACCENT;

  // The map follows the app's theme.
  useEffect(() => {
    const maps = useMapThemeStore.getState();
    if (maps.theme !== theme) maps.setTheme(theme);
    // This map has no theme button of its own, so nothing else would switch its
    // basemap when the app's theme changes.
    const map = mapRef.current;
    if (map && mapTheme.current !== theme) {
      mapTheme.current = theme;
      applyMapTheme(map, theme);
    }
  }, [theme]);

  // The theme the basemap was last set to.
  const mapTheme = useRef<"dark" | "light">(theme);
  const wideRef = useRef<{ lat: number; zoom: number } | null>(null);
  const lastProgress = useRef(0);
  const direction = useRef<1 | -1>(1);
  // Degrees the world has turned since the tour ended; zero while touring.
  const spin = useRef(0);
  // The map container's size. Read from the DOM once and on resize, not every
  // frame: asking for it right after the cards were moved forces a layout.
  const size = useRef({ w: 0, h: 0 });
  // The route trim last sent to the map, so an update that changes nothing is free.
  const sent = useRef({ trim: -1 });
  const planeEl = useRef<HTMLDivElement>(null);
  const eventFocusInitialized = useRef(false);
  const lastCalloutUpdate = useRef(0);
  const plane = useRef<{
    head: LngLat | null;
    shown: number;
    target: number;
    raf: number;
  }>({ head: null, shown: 0, target: 0, raf: 0 });

  const pts = useMemo(
    () => unwrap(stops.map((s): LngLat => [s.lng, s.lat])),
    [stops],
  );
  // A finished leg never changes, so build each one once.
  const legs = useMemo(
    () => pts.slice(0, -1).map((a, i) => arc(a, pts[i + 1], 1)),
    [pts],
  );
  // How far to pull out on each leg: the longer the flight, the further out.
  const outZoom = useMemo(
    () =>
      pts.slice(0, -1).map((a, i) => {
        const b = pts[i + 1];
        const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
        return Math.max(1.6, Math.min(4.6, 5.4 - dist * 0.04));
      }),
    [pts],
  );

  // The whole tour as one line, set on the map once. Scrolling only trims how
  // much of it shows (line-trim-offset), a main-thread paint change, instead of
  // re-sending a growing GeoJSON line to the map's worker every frame.
  const fullRoute = useMemo(
    () => legs.flatMap((leg, i) => (i === 0 ? leg : leg.slice(1))),
    [legs],
  );
  // Cumulative length along each leg's points, in the units the map measures
  // line progress in, so a trim lands exactly on the plane.
  const routeMetrics = useMemo(() => {
    const cum = legs.map((leg) => {
      const out = [0];
      for (let i = 1; i < leg.length; i++) {
        const [x0, y0] = mercator(leg[i - 1]);
        const [x1, y1] = mercator(leg[i]);
        out.push(out[i - 1] + Math.hypot(x1 - x0, y1 - y0));
      }
      return out;
    });
    const starts: number[] = [];
    let total = 0;
    for (const c of cum) {
      starts.push(total);
      total += c[c.length - 1];
    }
    return { cum, starts, total: total || 1 };
  }, [legs]);
  /** The share (0–1) of the whole route drawn when leg `k` is at arc parameter `t`. */
  const routeAt = useCallback(
    (k: number, t: number) => {
      const { cum, starts, total } = routeMetrics;
      const c = cum[k];
      if (!c) return 0;
      const s = clamp01(t) * (c.length - 1);
      const i = Math.min(c.length - 2, Math.floor(s));
      return (starts[k] + c[i] + (c[i + 1] - c[i]) * (s - i)) / total;
    },
    [routeMetrics],
  );

  // Runs on the map's own "render" event (see onReady), i.e. in the frame the
  // canvas is painted, so the plane and the camera always agree. Anything that
  // changes the plane asks for a repaint instead of drawing it directly.
  const drawPlane = useCallback(() => {
    const el = planeEl.current;
    if (!el) return;
    const map = mapRef.current;
    const pl = plane.current;
    if (!pl.head || !map) {
      el.style.opacity = "0";
      return;
    }
    // The copy of the point nearest the camera, so an unwrapped longitude
    // (beyond ±180, kept continuous along the tour) still lands on screen.
    const centerLng = map.getCenter().lng;
    let lng = pl.head[0];
    while (lng - centerLng > 180) lng -= 360;
    while (lng - centerLng < -180) lng += 360;
    const { x, y } = map.project([lng, pl.head[1]]);
    // Matches the old layer's icon-size: 0.7 at zoom 1, full size from zoom 6.
    const scale = 0.7 + 0.3 * clamp01((map.getZoom() - 1) / 5);
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${pl.shown}deg) scale(${scale})`;
    el.style.opacity = "1";
  }, []);

  // Turn the nose toward its target by the short way, a few frames at a time.
  // Held in a ref so the frame callback can schedule itself.
  const turnNose = useRef<() => void>(() => {});
  useEffect(() => {
    turnNose.current = () => {
      const pl = plane.current;
      pl.raf = 0;
      if (!pl.head) return;
      const diff = ((pl.target - pl.shown + 540) % 360) - 180;
      if (Math.abs(diff) < 0.5) {
        pl.shown = pl.target;
        mapRef.current?.triggerRepaint();
        return;
      }
      pl.shown += diff * 0.22;
      mapRef.current?.triggerRepaint();
      pl.raf = requestAnimationFrame(() => turnNose.current());
    };
  }, []);
  useEffect(
    () => () => {
      if (plane.current.raf) cancelAnimationFrame(plane.current.raf);
    },
    [],
  );

  const render = useCallback(
    (p: number) => {
      const dp = p - lastProgress.current;
      if (Math.abs(dp) > 1e-5) direction.current = dp > 0 ? 1 : -1;
      lastProgress.current = p;

      const map = mapRef.current;
      const wide = wideRef.current;
      if (!map || !wide || pts.length < 2) return;

      const first = pts[0];
      const last = pts[pts.length - 1];
      const wideAt = (lng: number): LngLat => [lng, wide.lat];

      if (p >= START && p < OUT_FROM) spin.current = 0;

      let center: LngLat;
      let zoom: number;
      // How much of the route is drawn (0–1), and the plane while in the air.
      let frac = 0;
      let flyHead: LngLat | null = null;
      let flyBack: LngLat | null = null;

      if (p <= START) {
        // The world, then down onto the first place.
        const t = smooth(clamp01((p - 0.02) / (START - 0.02)));
        // Turned by however far the idle spin got, eased out as the camera drops.
        const turned = wrapDeg(spin.current) * (1 - t);
        center = [
          lerp(wideAt(first[0])[0], first[0], t) + turned,
          lerp(wide.lat, first[1], t),
        ];
        zoom = lerp(wide.zoom, ZOOM_IN, t);
      } else if (p >= END) {
        // Out from the last place to the world again.
        const t = smooth(clamp01((p - OUT_FROM) / 0.06));
        // The idle spin only counts once the last card has gone, so the camera
        // stays on the last place for as long as its card is out, however far
        // the world has turned since.
        const w = clamp01((p - OUT_FROM - 0.03) / 0.03);
        center = [
          lerp(last[0], wideAt(last[0])[0], t) + wrapDeg(spin.current) * w,
          lerp(last[1], wide.lat, t),
        ];
        zoom = lerp(ZOOM_IN, wide.zoom, t);
        frac = 1;
      } else {
        const u = (p - START) / LEG;
        const k = Math.min(LEGS - 1, Math.floor(u));
        const f = u - k;
        const a = pts[k];
        const b = pts[k + 1];
        const out = outZoom[k];

        if (f < REST_END) {
          // resting at the place just reached
          center = a;
          zoom = ZOOM_IN;
          frac = routeAt(k, 0);
        } else if (f < OUT_END) {
          // pulling out, still over the place
          center = a;
          zoom = lerp(
            ZOOM_IN,
            out,
            smooth((f - REST_END) / (OUT_END - REST_END)),
          );
          frac = routeAt(k, 0);
        } else if (f < FLY_END) {
          // flying, with the camera on the plane
          const t = smooth((f - OUT_END) / (FLY_END - OUT_END));
          const along = arc(a, b, t);
          const head = along[along.length - 1];
          center = head;
          zoom = out;
          frac = routeAt(k, t);
          if (t < 0.995 && along.length > 3) {
            flyHead = head;
            flyBack = along[along.length - 4];
          }
        } else if (f < IN_END) {
          // coming in on the next place
          center = b;
          zoom = lerp(out, ZOOM_IN, smooth((f - FLY_END) / (IN_END - FLY_END)));
          frac = routeAt(k, 1);
        } else {
          // resting at the next place
          center = b;
          zoom = ZOOM_IN;
          frac = routeAt(k, 1);
        }
      }

      // While a pin is out, the place sits lower on screen so the pin has room
      // to grow upward from it.
      let amount = 0;
      for (let i = 0; i < STOPS; i++)
        amount = Math.max(amount, cardAmount(p, i));
      if (!size.current.w) {
        const box = map.getContainer() as HTMLElement;
        size.current = { w: box.clientWidth, h: box.clientHeight };
      }
      const { w, h } = size.current;
      // On a phone the headline and search fill the lower two thirds, so the
      // world is lifted into the strip above them while the hero is up, and
      // settles back to the middle as it fades.
      const lift =
        w < COMPACT_BELOW && h > w ? 0.4 * (1 - clamp01((p - 0.02) / 0.05)) : 0;
      map.jumpTo({
        center,
        zoom,
        pitch: 0,
        bearing: 0,
        padding: {
          top: h * pinPad(h, w) * amount,
          bottom: h * lift,
          left: 0,
          right: 0,
        },
      });

      const width = w;
      const height = h;
      if (p <= IDLE_END) {
        const now = performance.now();
        if (now - lastCalloutUpdate.current >= CALLOUT_UPDATE_MS) {
          lastCalloutUpdate.current = now;
          onEventCalloutPointsChange(
            projectVisibleEventLocations(map, calloutLocations, width, height),
          );
        }
        onFrame.current?.(map);
      } else {
        lastCalloutUpdate.current = 0;
        onEventCalloutPointsChange([]);
      }

      // Reveal the pre-built route up to the plane. A paint change, applied on
      // the main thread, so the line's head never trails the camera.
      const trimKey = Math.round(frac * 1e5);
      if (trimKey !== sent.current.trim && map.getLayer("journey-route")) {
        sent.current.trim = trimKey;
        const trim = [frac, 1];
        map.setPaintProperty("journey-route-halo", "line-trim-offset", trim);
        map.setPaintProperty("journey-route", "line-trim-offset", trim);
      }
      // The plane sits on the head of the line being drawn, nose along the
      // direction of travel (the line's own direction going forward, the
      // opposite going back), and is out of sight while resting at a place.
      const pl = plane.current;
      if (flyHead && flyBack) {
        const head = flyHead;
        const back = flyBack;
        const along =
          (Math.atan2(
            (head[0] - back[0]) * Math.cos((head[1] * Math.PI) / 180),
            head[1] - back[1],
          ) *
            180) /
          Math.PI;
        const target = direction.current > 0 ? along : along + 180;
        // A plane that has just appeared points straight away; one already in
        // the air turns.
        if (!pl.head) pl.shown = target;
        pl.head = head;
        pl.target = target;
        const diff = ((target - pl.shown + 540) % 360) - 180;
        if (Math.abs(diff) > 0.5) {
          pl.shown += diff * 0.22;
          if (!pl.raf) pl.raf = requestAnimationFrame(() => turnNose.current());
        } else {
          pl.shown = target;
        }
        map.triggerRepaint();
      } else if (pl.head) {
        pl.head = null;
        map.triggerRepaint();
      }
    },
    [
      pts,
      outZoom,
      routeAt,
      calloutLocations,
      onEventCalloutPointsChange,
      onFrame,
    ],
  );

  const addLayers = useCallback(
    (map: any) => {
      if (map.getSource("journey-venues")) return;
      map.addSource("journey-venues", {
        type: "geojson",
        data: pointsFC(venues, () => ({})),
      });
      map.addLayer({
        id: "journey-venues",
        type: "circle",
        source: "journey-venues",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            1,
            1.8,
            6,
            4,
            10,
            7,
          ],
          "circle-color": ink,
          "circle-opacity": 0.55,
        },
      });
      if (theme === "dark") {
        map.addSource("journey-city-lights", CITY_LIGHTS_RASTER_SOURCE);
        const firstLabelLayer = map
          .getStyle()
          ?.layers?.find(
            (layer: { type: string }) => layer.type === "symbol",
          )?.id;
        map.addLayer(
          {
            id: "journey-city-light-imagery",
            type: "raster",
            source: "journey-city-lights",
            paint: CITY_LIGHTS_RASTER_PAINT,
          },
          firstLabelLayer,
        );
      }
      map.addSource("journey-event-locations", {
        type: "geojson",
        data: eventLocationCollection(eventLocations),
      });
      map.addLayer({
        id: "journey-event-location-halo",
        type: "circle",
        source: "journey-event-locations",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 7, 5, 12],
          "circle-color": ink,
          "circle-opacity": 0.16,
        },
      });
      map.addLayer({
        id: "journey-event-locations",
        type: "circle",
        source: "journey-event-locations",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2.5, 5, 5],
          "circle-color": ink,
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 1.5,
        },
      });
      map.addLayer({
        id: "journey-event-location-labels",
        type: "symbol",
        source: "journey-event-locations",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 1, 8, 5, 11],
          "text-offset": [0, 1.4],
          "text-anchor": "top",
          "text-optional": true,
        },
        paint: {
          "text-color": theme === "light" ? "#18334a" : "#fff",
          "text-halo-color": theme === "light" ? "#fff" : "#090d18",
          "text-halo-width": 1.4,
        },
      });
      // The whole tour, once; `render` trims it to what has been flown.
      map.addSource("journey-route", {
        type: "geojson",
        data: lineFC(fullRoute),
        lineMetrics: true,
      });
      map.addLayer({
        id: "journey-route-halo",
        type: "line",
        source: "journey-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ink,
          "line-width": 9,
          "line-opacity": 0.18,
          "line-trim-offset": [0, 1],
        },
      });
      map.addLayer({
        id: "journey-route",
        type: "line",
        source: "journey-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ink,
          "line-width": 2.6,
          "line-trim-offset": [0, 1],
        },
      });
      map.addSource("journey-stops", {
        type: "geojson",
        data: pointsFC(stops, (s: Stop) => ({ name: s.name })),
      });
      map.addLayer({
        id: "journey-stops-ring",
        type: "circle",
        source: "journey-stops",
        paint: {
          "circle-radius": 15,
          "circle-color": "rgba(0,0,0,0)",
          "circle-stroke-width": 2,
          "circle-stroke-color": ink,
        },
      });
      map.addLayer({
        id: "journey-stops-dot",
        type: "circle",
        source: "journey-stops",
        paint: { "circle-radius": 5, "circle-color": ink },
      });
      // The plane is not a map layer: see PlaneGlyph and drawPlane.
    },
    [venues, eventLocations, stops, ink, theme, fullRoute],
  );

  useEffect(() => {
    const source = mapRef.current?.getSource("journey-event-locations");
    source?.setData(eventLocationCollection(eventLocations));
    if (
      !eventFocusInitialized.current &&
      eventLocations.length > 0 &&
      wideRef.current &&
      lastProgress.current <= IDLE_END &&
      pts.length > 0
    ) {
      eventFocusInitialized.current = true;
      spin.current = wrapDeg(eventLocations[0].lng - pts[0][0]);
      render(lastProgress.current);
    }
  }, [eventLocations, pts, render]);

  const setSky = useCallback(
    (map: any) => {
      applyJourneyMapTheme(map, theme);
    },
    [theme],
  );

  const onReady = useCallback(
    (map: any) => {
      mapRef.current = map;
      map.once("idle", onDrawn);
      // The plane is placed whenever the map paints, in that same frame.
      map.on("render", drawPlane);
      // The whole world, sized to the screen.
      const el = map.getContainer() as HTMLElement;
      size.current = { w: el.clientWidth, h: el.clientHeight };
      map.on("resize", () => {
        size.current = { w: el.clientWidth, h: el.clientHeight };
      });
      const px = Math.min(el.clientWidth, el.clientHeight * 1.4);
      wideRef.current = {
        lat: 24,
        zoom: Math.max(0.9, Math.log2(px / 512) + 0.8),
      };
      setSky(map);
      addLayers(map);
      render(progress.get());
    },
    [addLayers, render, progress, setSky, onDrawn, drawPlane],
  );

  // After a theme change the basemap reloads and drops our layers.
  const onStyle = useCallback(
    (map: any) => {
      sent.current = { trim: -1 };
      setSky(map);
      addLayers(map);
      render(progress.get());
    },
    [addLayers, render, progress, setSky],
  );

  // The scroll value can change several times between two frames; only the
  // latest matters, so draw once per frame instead of once per change. It is
  // drawn in motion's own frame (the render step), the same frame the spring
  // moved in and the cards are styled in, not on a separate animation frame
  // that would put the map one frame behind them.
  const pending = useRef<number | null>(null);
  const queued = useRef(false);
  const drawLatest = useRef<() => void>(() => {});
  useEffect(() => {
    drawLatest.current = () => {
      queued.current = false;
      if (pending.current !== null) render(pending.current);
    };
  }, [render]);
  const runLatest = useCallback(() => drawLatest.current(), []);
  const schedule = useCallback(
    (p: number) => {
      pending.current = p;
      if (queued.current) return;
      queued.current = true;
      frame.render(runLatest);
    },
    [runLatest],
  );
  useEffect(() => () => cancelFrame(runLatest), [runLatest]);

  // Before the first scroll, and again once the tour is over and the camera is
  // back out, the world keeps turning behind the card. Scrolling back up hands control to the tour again.
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    let last = 0;
    // 5 degrees a second is slow enough that 30 frames look the same as 60,
    // and on a phone that is half the GPU work for a full-screen canvas.
    const coarse =
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < COMPACT_BELOW;
    const gap = coarse ? 1000 / 30 : 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // `last` is when we last drew, so a skipped frame's time is not lost.
      if (last && now - last < gap - 2) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      // Scrolled past the hero: the tour is long over and nobody can see it.
      if (!inView.current) return;
      const p = progress.get();
      if (!mapRef.current || (p >= IDLE_END && p < OUT_FROM + 0.06)) return;
      if (spinPaused.current) return;
      spin.current -= dt * SPIN_DEG_PER_SEC;
      render(p);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, render, reduceMotion, spinPaused, inView]);
  useMotionValueEvent(progress, "change", schedule);

  return (
    <>
      <MapBoxView
        // Remount once real data is in, so the first camera matches it.
        key={venues.length > 0 ? "loaded" : "empty"}
        interactive={false}
        showNavigation={false}
        fadeDuration={0}
        showLoader={false}
        minZoom={0}
        zoom={1.4}
        center={[10, 24]}
        className="absolute inset-0 h-full w-full"
        onMapReady={onReady}
        onStyleLoad={onStyle}
      />
      <div
        ref={planeEl}
        className="pointer-events-none absolute left-0 top-0 z-1"
        style={{ opacity: 0, willChange: "transform" }}
      >
        <PlaneGlyph color={ink} />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// A place's card, shown while the camera rests on it
// ---------------------------------------------------------------------------

/** The scroll values around place `i` where its card is shown. */
function cardWindow(i: number) {
  const at = stopAt(i);
  // From the moment the camera has landed on the place, never before.
  const before = i === 0 ? 0 : LEG * (1 - IN_END);
  const after = i === STOPS - 1 ? HOLD : LEG * REST_END;
  return { at, from: at - before, to: at + after };
}

/** How far out (0 to 1) place `i`'s pin is at scroll `v`. */
function cardAmount(v: number, i: number) {
  const { from, to } = cardWindow(i);
  const fade = LEG * 0.09;
  // Out only once the camera has landed, back in before it pulls away.
  return clamp01(Math.min((v - from) / fade, (to - v) / fade));
}

/** How much of the screen height the camera is pushed down by while a pin is out. */
/**
 * How far down (as a share of the height) the camera pushes the place while a
 * pin is out. A tall card needs the room; on a short screen it has to be more,
 * or the card runs under the header.
 */
const HEADER_H = 104;
function pinPad(h: number, w: number) {
  const photo = Math.min(232, Math.max(112, h * 0.22));
  const card = photo + 235 + (w < 640 ? 60 : 0);
  const needed = HEADER_H + card + 44;
  return Math.min(0.72, Math.max(0.3, (2 * needed) / h - 1));
}

/** The size of the window, kept current. */
function useViewport() {
  const [size, setSize] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const read = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return size;
}

/**
 * A feature card: a link where a public page shows that feature, otherwise a
 * plain tile with no hover, so it never promises a page it doesn't open.
 */
function FeatureTile({
  href,
  className,
  linkClassName = "",
  style,
  children,
}: {
  href?: string;
  className: string;
  /** Hover styles, for the link version only. */
  linkClassName?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return href ? (
    <Link href={href} className={`${className} ${linkClassName}`} style={style}>
      {children}
    </Link>
  ) : (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export function StopCard({
  stop,
  index,
  progress,
}: {
  stop: Stop;
  index: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const vp = useViewport();
  const amount = useTransform(progress, (v) => cardAmount(v, index));
  // The place moves down the screen as the map is padded; follow it exactly.
  const top = useTransform(
    amount,
    (a) => `${(0.5 + (pinPad(vp.h, vp.w) * a) / 2) * 100}%`,
  );
  const opacity = useTransform(amount, (a) => Math.min(1, a * 2));
  // Grows out of the dot: from nothing, with a little overshoot-free ease.
  const scale = useTransform(amount, (a) =>
    reduce ? 1 : 1 - Math.pow(1 - a, 3),
  );
  const events = useTransform(opacity, (o) => (o > 0.6 ? "auto" : "none"));
  // Out of sight means out of the tab order too.
  const visibility = useTransform(opacity, (o) =>
    o > 0.01 ? "visible" : "hidden",
  );
  // Which photo is the big one, and whether the full-size view is open.
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [held, setHeld] = useState(false);
  // Whether the photos turn on their own. Touching the card, or one full pass
  // through the photos, ends it; the button brings it back.
  const [playing, setPlaying] = useState(true);
  const passed = useRef(0);
  useMotionValueEvent(opacity, "change", (o) => setShown(o > 0.6));
  const count = stop.photos.length;
  // The photos turn on their own while the card is out, once through, and
  // start over each time it comes back.
  useEffect(() => {
    if (!shown) {
      setActive(0);
      setPlaying(true);
      passed.current = 0;
      return;
    }
    if (reduce || !playing || held || open) return;
    const t = setInterval(() => {
      passed.current += 1;
      setActive((i) => (i + 1) % count);
      if (passed.current >= count) setPlaying(false);
    }, 3500);
    return () => clearInterval(t);
  }, [shown, playing, held, open, reduce, count]);
  const choose = (i: number) => {
    setPlaying(false);
    setActive(i);
  };
  // Swiping the photo, or tapping it to open it.
  const swipeFrom = useRef<number | null>(null);
  const suppress = useRef(false);

  return (
    <motion.article
      style={{ opacity, top, pointerEvents: events, visibility }}
      className="absolute left-1/2 z-20 w-[min(88vw,420px)] -translate-x-1/2"
    >
      {/* Its bottom edge is the dot, so scaling from there grows it out of it. */}
      <motion.div
        style={{ scale }}
        className="absolute bottom-0 left-1/2 flex w-full origin-bottom -translate-x-1/2 flex-col items-center pb-[18px]"
      >
        <div className="relative w-[min(88vw,360px)] sm:w-[420px] lg:w-[360px] xl:w-[420px]">
          {stop.features.length > 0 && (
            <>
              <svg
                aria-hidden
                viewBox="0 0 1260 500"
                className="pointer-events-none absolute left-1/2 top-0 z-0 hidden h-[500px] w-[1260px] -translate-x-1/2 overflow-visible xl:block"
              >
                {[
                  { startX: 420, startY: 150, endX: 300, endY: 105 },
                  { startX: 840, startY: 150, endX: 960, endY: 105 },
                  { startX: 420, startY: 350, endX: 300, endY: 395 },
                  { startX: 840, startY: 350, endX: 960, endY: 395 },
                ]
                  .slice(0, stop.features.length)
                  .map((line, cardIndex) => (
                    <line
                      key={stop.features[cardIndex].label}
                      x1={line.startX}
                      y1={line.startY}
                      x2={line.endX}
                      y2={line.endY}
                      stroke="rgba(204,255,0,0.72)"
                      strokeWidth="1.5"
                    />
                  ))}
              </svg>
              {stop.features.slice(0, 4).map((feature, cardIndex) => {
                const slot = [
                  { x: 0, y: 0 },
                  { x: 960, y: 0 },
                  { x: 0, y: 280 },
                  { x: 960, y: 280 },
                ][cardIndex];
                const image = feature.photo.src;
                return (
                  <FeatureTile
                    key={feature.label}
                    href={feature.href}
                    className="absolute z-10 hidden h-[220px] w-[300px] flex-col justify-end overflow-hidden rounded-2xl border border-accent/45 bg-surface text-white shadow-xl xl:flex"
                    linkClassName="transition-transform hover:scale-[1.03]"
                    style={{
                      left: `calc(50% - 630px + ${slot.x}px)`,
                      top: `${slot.y}px`,
                    }}
                  >
                    {image && (
                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10"
                    />
                    <span className="relative z-[1] p-4">
                      <span className="font-landing-mono block truncate text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                        {feature.label}
                      </span>
                      <span className="font-landing-display mt-1.5 line-clamp-2 block text-lg leading-tight">
                        {feature.title}
                      </span>
                    </span>
                  </FeatureTile>
                );
              })}
            </>
          )}
          <div className="relative z-[1] overflow-hidden rounded-2xl border border-accent/40 bg-surface text-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)]">
            <div
              className="relative h-[22svh] max-h-[14.5rem] min-h-28 select-none overflow-hidden"
              onPointerEnter={(e) => setHeld(e.pointerType === "mouse")}
              onPointerLeave={() => setHeld(false)}
            >
              {stop.photos.map((p, i) => (
                <img
                  key={p.src}
                  src={p.src}
                  alt={i === active ? (p.alt ?? "") : ""}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    i === active ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#000]/80 via-[#000]/5 to-transparent"
              />
              <button
                type="button"
                aria-label="View photos full size"
                onPointerDown={(e) => {
                  swipeFrom.current = e.clientX;
                  suppress.current = false;
                  setPlaying(false);
                }}
                onPointerUp={(e) => {
                  const from = swipeFrom.current;
                  swipeFrom.current = null;
                  if (from === null) return;
                  const dx = e.clientX - from;
                  if (Math.abs(dx) > 40) {
                    suppress.current = true;
                    setActive((i) => (i + (dx < 0 ? 1 : -1) + count) % count);
                  }
                }}
                onClick={() => {
                  if (suppress.current) {
                    suppress.current = false;
                    return;
                  }
                  setOpen(true);
                }}
                className="absolute inset-0 z-10 cursor-zoom-in"
              />
              <p className="font-landing-mono pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-[#000]/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#fff] backdrop-blur">
                Step {index + 1} of {STOPS}
              </p>
              <div className="pointer-events-auto absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded-full bg-[#000]/60 py-0.5 pl-1 pr-2 backdrop-blur">
                {!reduce && (
                  <button
                    type="button"
                    aria-label={playing ? "Pause photos" : "Play photos"}
                    onClick={() => {
                      // Playing again gives it another pass through the photos.
                      passed.current = 0;
                      setPlaying((p) => !p);
                    }}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center text-[9px] text-[#fff]"
                  >
                    {playing ? "❚❚" : "▶"}
                  </button>
                )}
                {stop.photos.map((p, i) => (
                  <button
                    key={p.src}
                    type="button"
                    aria-label={`Show photo ${i + 1}`}
                    onClick={() => choose(i)}
                    className="cursor-pointer p-1"
                  >
                    <span
                      className={`block h-1.5 rounded-full bg-[#fff] transition-all ${
                        i === active ? "w-5 opacity-100" : "w-1.5 opacity-50"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-4 bottom-3 z-20">
                {/* The step leads; the place is only where the tour shows it. */}
                <h3 className="font-landing-display max-w-full whitespace-normal break-words text-2xl leading-tight text-[#fff] sm:text-3xl">
                  {stop.kind}
                </h3>
                <p className="font-landing-mono mt-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#fff]/85">
                  {stop.name} · {stop.region}
                </p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed text-white/85">
                {stop.tagline}
              </p>
              {stop.features.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 xl:hidden">
                  {stop.features.slice(0, 4).map((feature) => {
                    const image = feature.photo.src;
                    return (
                      <FeatureTile
                        key={feature.label}
                        href={feature.href}
                        className="flex min-h-24 w-64 shrink-0 items-center gap-3 rounded-xl border border-accent/30 bg-white/5 p-3 text-left"
                        linkClassName="transition-colors hover:bg-white/10"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-accent/25 via-white/10 to-sky-400/20">
                          {image && (
                            <img
                              src={image}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <span className="min-w-0">
                          <span className="font-landing-mono block truncate text-[9px] font-bold uppercase tracking-[0.12em] text-accent">
                            {feature.label}
                          </span>
                          <span className="mt-0.5 line-clamp-1 block text-xs text-white/85">
                            {feature.title}
                          </span>
                        </span>
                      </FeatureTile>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href="/packages"
                  className="inline-flex rounded-full bg-accent px-5 py-2.5 text-xs font-extrabold text-black transition-transform hover:scale-[1.03]"
                >
                  See packages →
                </Link>
              </div>
              <a
                href={stop.photos[active].credit.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-landing-mono mt-4 line-clamp-2 text-[10px] uppercase leading-snug tracking-[0.1em] text-white/55 hover:text-white"
              >
                Photo · {stop.photos[active].credit.author} (
                {stop.photos[active].credit.license})
              </a>
            </div>
          </div>
        </div>
        {/* The pin's point, aimed at the dot. */}
        <div
          aria-hidden
          className="-mt-2 h-4 w-4 rotate-45 border-b border-r border-accent/40 bg-surface"
        />
      </motion.div>
      {open && (
        <Lightbox
          title={`${stop.name}, ${stop.region}`}
          photos={stop.photos}
          index={active}
          onIndex={setActive}
          onClose={() => setOpen(false)}
        />
      )}
    </motion.article>
  );
}

/**
 * The steps along the bottom, lighting up as the tour reaches each: named on
 * wide screens, dots on smaller ones. It shows once the tour has started, like
 * the tools across from it. A visual cue only: the card says "Step N of 5".
 */
function Rail({
  stops,
  progress,
  opacity,
}: {
  stops: Stop[];
  progress: MotionValue<number>;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none absolute bottom-24 left-4 z-20 flex items-center gap-2 sm:bottom-6 sm:left-6 xl:gap-4"
    >
      {stops.map((s, i) => (
        <RailStop key={s.key} label={s.kind} index={i} progress={progress} />
      ))}
    </motion.div>
  );
}

function RailStop({
  label,
  index,
  progress,
}: {
  label: string;
  index: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, (v) =>
    Math.abs(v - stopAt(index)) < LEG * 0.5 ? 1 : 0.4,
  );
  return (
    <motion.span
      style={{ opacity }}
      className="font-landing-mono flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      <span className="hidden xl:inline">{label}</span>
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// The hero
// ---------------------------------------------------------------------------

/** Whether this browser can draw the map at all. */
function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** 0 at the limb, 1 once the place is comfortably face-on. */
function limbFade(dot: number) {
  return clamp01(
    (dot - EVENT_CALLOUT_FADE_FROM_DOT) /
      (EVENT_CALLOUT_ENTER_DOT - EVENT_CALLOUT_FADE_FROM_DOT),
  );
}

type CalloutNode = { card?: HTMLElement; marker?: SVGGElement };
type CalloutNodes = Map<string, CalloutNode>;

/**
 * Puts a card and its marker at a place on screen. Written straight to the
 * elements, not through React, because it runs once per map frame.
 */
function placeCalloutNode(
  node: CalloutNode,
  x: number,
  y: number,
  dx: number,
  dy: number,
  opacity: number,
) {
  if (node.marker) {
    node.marker.style.transform = `translate(${x}px, ${y}px)`;
    node.marker.style.opacity = String(opacity);
  }
  if (node.card) {
    node.card.style.transform = `translate3d(${x + dx}px, ${y + dy}px, 0)`;
    node.card.style.opacity = String(opacity);
  }
}

/**
 * Registers an element so the per-frame loop can move it, and gives it its
 * first position so it never shows at the corner for a frame. Nothing about
 * position or opacity is in the element's React `style`, so a re-render never
 * writes a stale value over the one the loop just set.
 */
function useCalloutNode<T extends HTMLElement | SVGGElement>(
  nodes: { current: CalloutNodes },
  callout: PositionedEventCallout,
  kind: "card" | "marker",
) {
  const ref = useRef<T>(null);
  const key = callout.location.key;

  // Runs when the element mounts: the position it is given here is only the
  // first one, and the per-frame loop takes over from the next frame. Re-running
  // on every new `callout` would put an older position over the loop's.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const node = nodes.current.get(key) ?? {};
    if (kind === "card") node.card = el as HTMLElement;
    else node.marker = el as SVGGElement;
    nodes.current.set(key, node);
    const c = callout;
    placeCalloutNode(
      node,
      c.markerX,
      c.markerY,
      c.left - c.markerX,
      c.top - c.markerY,
      limbFade(c.dot),
    );
    return () => {
      const current = nodes.current.get(key);
      if (!current) return;
      delete current[kind];
      if (!current.card && !current.marker) nodes.current.delete(key);
    };
  }, [nodes, key, kind]);

  return ref;
}

function GlobeEventCallouts({
  callouts,
  nodes,
  onHoverChange,
}: {
  callouts: PositionedEventCallout[];
  nodes: { current: CalloutNodes };
  /** True while any card is hovered or focused. */
  onHoverChange: (hovered: boolean) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        {callouts.map((callout) => (
          <CalloutMarker
            key={callout.location.key}
            callout={callout}
            nodes={nodes}
          />
        ))}
      </svg>
      <AnimatePresence initial={false}>
        {callouts.map((callout, index) => (
          <GlobeEventCalloutCard
            key={callout.location.key}
            callout={callout}
            nodes={nodes}
            reduce={reduce}
            enterDelay={index * 0.12}
            onHoverChange={onHoverChange}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * The marker is the origin and the connector is drawn relative to it, so
 * moving the one element moves both.
 */
function CalloutMarker({
  callout,
  nodes,
}: {
  callout: PositionedEventCallout;
  nodes: { current: CalloutNodes };
}) {
  const ref = useCalloutNode<SVGGElement>(nodes, callout, "marker");
  return (
    <g ref={ref}>
      <line
        x1={0}
        y1={0}
        x2={callout.edgeX - callout.markerX}
        y2={callout.edgeY - callout.markerY}
        stroke="rgba(255,255,255,0.72)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle
        cx={0}
        cy={0}
        r="4"
        fill="var(--accent)"
        stroke="white"
        strokeWidth="1"
      />
    </g>
  );
}

function GlobeEventCalloutCard({
  callout,
  nodes,
  reduce,
  enterDelay,
  onHoverChange,
}: {
  callout: PositionedEventCallout;
  nodes: { current: CalloutNodes };
  reduce: boolean | null;
  enterDelay: number;
  onHoverChange: (hovered: boolean) => void;
}) {
  const { location } = callout;
  const cardRef = useCalloutNode<HTMLDivElement>(nodes, callout, "card");
  const [eventIndex, setEventIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const eventCount = location.events.length;
  const event = location.events[eventIndex % eventCount];
  const image = event.images?.find((item) => item.url)?.url;

  useEffect(() => {
    setEventIndex(0);
  }, [location.key]);

  // Stands still while it is being looked at, so the link under the pointer is
  // the one that was aimed at.
  useEffect(() => {
    if (eventCount < 2 || reduce || held) return;
    const timer = window.setInterval(
      () => setEventIndex((index) => (index + 1) % eventCount),
      4200,
    );
    return () => window.clearInterval(timer);
  }, [eventCount, location.key, reduce, held]);

  // Reported from an effect so a card that leaves while hovered still lets the
  // world turn again.
  useEffect(() => {
    if (!held) return;
    onHoverChange(true);
    return () => onHoverChange(false);
  }, [held, onHoverChange]);

  return (
    <div
      ref={cardRef}
      className="pointer-events-none absolute left-0 top-0 will-change-transform"
    >
      <motion.article
        initial={reduce ? false : { opacity: 0, scale: 0.9, y: 8 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
            delay: enterDelay,
          },
        }}
        exit={
          reduce
            ? undefined
            : { opacity: 0, scale: 0.94, y: 4, transition: { duration: 0.25 } }
        }
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
        className="pointer-events-auto w-40 rounded-lg border border-white/20 bg-surface/95 p-1.5 text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-md sm:w-52 sm:p-2"
      >
        <Link
          href={`/event/${event.id}`}
          className="group flex items-center gap-1.5 sm:gap-2"
        >
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-sky-400/40 via-emerald-400/20 to-accent/20 sm:h-10 sm:w-10">
            <AnimatePresence mode="popLayout" initial={false}>
              {image && (
                <motion.img
                  key={event.id}
                  src={image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </AnimatePresence>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-landing-mono truncate text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-[color:var(--accent-text)] sm:text-[11px]">
              {location.city}
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-landing-display mt-0.5 line-clamp-1 text-xs leading-tight sm:line-clamp-2 sm:text-[13px]"
              >
                {event.name}
              </motion.h2>
            </AnimatePresence>
            <p className="font-landing-mono mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/70">
              {eventCount} {eventCount === 1 ? "event" : "events"} ·{" "}
              <span className="text-white">View</span>{" "}
              <span aria-hidden>→</span>
            </p>
          </div>
        </Link>
      </motion.article>
    </div>
  );
}

/**
 * The hero. Where the browser can't draw the map, it is a plain headline and
 * search over a photo instead of a tour that has nothing to show.
 */
export default function JourneyHero() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => setWebgl(hasWebGL()), []);
  if (webgl === false) return <StaticHero />;
  return <TourHero />;
}

function StaticHero() {
  const user = useAuthStore((s) => s.user);
  const first = user?.name?.split(" ")[0];
  return (
    <section className="relative flex min-h-[85svh] items-center overflow-hidden bg-canvas px-6 py-32 sm:px-14">
      <img
        src={DESTINATIONS[0].photos[0].src}
        alt=""
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-canvas/80"
      />
      <div className="relative z-10 w-full">
        <Kicker>
          {first ? `Welcome back, ${first}` : "FoxPassport · Book any event"}
        </Kicker>
        <h1 className="font-landing-display mt-4 max-w-2xl text-[3.4rem] leading-[0.9] text-white sm:text-7xl lg:text-[6.2rem]">
          Book the <span style={{ color: "var(--accent-text)" }}>night</span>,
          anywhere.
        </h1>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70 sm:text-base">
          Concerts, weddings, festivals and private events: the venue, the gear
          and the crew in one booking.
        </p>
        <HeroSearch />
        <InstallAppButton className="mt-4" />
        <a
          href="#events"
          className="mt-6 inline-block text-sm font-bold text-white/70 underline underline-offset-4 hover:text-white"
        >
          Skip to events ↓
        </a>
      </div>
    </section>
  );
}

function TourHero() {
  const stage = useRef<HTMLDivElement>(null);
  const inView = useRef(true);
  useEffect(() => {
    const el = stage.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const openSignup = useAuthStore((s) => s.openSignup);
  const theme = useThemeStore((st) => st.theme);
  const venues = useVenues(80);
  const events = useEvents(300);
  const eventLocations = useMemo(
    () => buildEventLocations(events, venues),
    [events, venues],
  );
  const foxers = useFoxerTotal();
  const first = user?.name?.split(" ")[0];

  const { scrollYProgress: rawProgress } = useScroll({
    target: stage,
    offset: ["start start", "end end"],
  });

  // The wheel and touch move in jumps; a spring turns them into a glide, and
  // the camera, the route, the plane and the cards all follow the same value.
  const reduceMotion = useReducedMotion();
  // Soft enough that one wheel notch glides the plane rather than jumping it.
  const spring = useSpring(rawProgress, {
    stiffness: 70,
    damping: 22,
    mass: 0.9,
    restDelta: 0.0002,
  });
  const progress = reduceMotion ? rawProgress : spring;

  // Each destination, with whatever real venues are near it.
  const stops = useMemo<Stop[]>(() => buildStops(venues), [venues]);

  const intro = useTransform(progress, (v) => 1 - clamp01((v - 0.02) / 0.05));
  const outro = useTransform(progress, (v) => clamp01((v - 0.93) / 0.04));
  const outroEvents = useTransform(outro, (o) => (o > 0.5 ? "auto" : "none"));
  // Out of sight means out of the tab order too.
  const introVisibility = useTransform(intro, (o) =>
    o > 0.01 ? "visible" : "hidden",
  );
  const outroVisibility = useTransform(outro, (o) =>
    o > 0.01 ? "visible" : "hidden",
  );
  const [drawn, setDrawn] = useState(false);
  const [eventCallouts, setEventCallouts] = useState<PositionedEventCallout[]>(
    [],
  );
  const onDrawn = useCallback(() => setDrawn(true), []);
  const spinPaused = useRef(false);
  const calloutsRef = useRef<PositionedEventCallout[]>([]);
  const calloutNodes = useRef<CalloutNodes>(new Map());
  const onFrame = useRef<((map: any) => void) | null>(null);
  // Every frame, each shown card and its marker are put where the map says the
  // place is *now*. Doing this from React state meant a card sat wherever the
  // globe was up to a tenth of a second ago.
  useEffect(() => {
    onFrame.current = (map) => {
      for (const callout of calloutsRef.current) {
        const node = calloutNodes.current.get(callout.location.key);
        if (!node) continue;
        const { x, y } = projectEventLocation(map, callout.location);
        placeCalloutNode(
          node,
          x,
          y,
          callout.left - callout.markerX,
          callout.top - callout.markerY,
          limbFade(eventLocationDot(map, callout.location)),
        );
      }
    };
    return () => {
      onFrame.current = null;
    };
  }, []);
  const calloutLocations = useMemo(
    () => mergeLocationsByCity(eventLocations),
    [eventLocations],
  );
  const onCalloutHoverChange = useCallback((hovered: boolean) => {
    spinPaused.current = hovered;
  }, []);
  const onEventCalloutPointsChange = useCallback(
    (points: ProjectedEventLocation[]) => {
      const viewport = mapViewportRef.current;
      if (!viewport) return;
      const viewportRect = viewport.getBoundingClientRect();
      const contentRect =
        progress.get() < 0.07
          ? heroContentRef.current?.getBoundingClientRect()
          : null;
      const avoid = contentRect
        ? {
            left: contentRect.left - viewportRect.left,
            top: contentRect.top - viewportRect.top,
            right: contentRect.right - viewportRect.left,
            bottom: contentRect.bottom - viewportRect.top,
          }
        : undefined;
      const current = calloutsRef.current;
      const next = placeEventCallouts(
        points,
        viewport.clientWidth,
        viewport.clientHeight,
        avoid,
        current,
      );
      const unchanged =
        current.length === next.length &&
        current.every((callout, index) => {
          const updated = next[index];
          return (
            callout.location.key === updated.location.key &&
            // Where it sits relative to its pin; the pin's own position is
            // read from the map every frame, so it is not compared here.
            Math.abs(
              callout.left - callout.markerX - (updated.left - updated.markerX),
            ) < 1.5 &&
            Math.abs(
              callout.top - callout.markerY - (updated.top - updated.markerY),
            ) < 1.5
          );
        });
      if (unchanged) return;
      calloutsRef.current = next;
      setEventCallouts(next);
    },
    [progress],
  );
  const hint = useTransform(progress, (v) => 1 - clamp01(v / 0.03));
  const tools = useTransform(progress, (v) => clamp01((v - 0.04) / 0.03));
  const toolsEvents = useTransform(tools, (o) => (o > 0.5 ? "auto" : "none"));

  return (
    <section
      ref={stage}
      className="relative bg-canvas"
      style={{ height: `${STOPS * VH_PER_STOP + 50}vh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* The map is a picture; the cards carry the words. */}
        <div ref={mapViewportRef} aria-hidden className="absolute inset-0">
          <JourneyMap
            venues={venues}
            eventLocations={eventLocations}
            calloutLocations={calloutLocations}
            stops={stops}
            progress={progress}
            onDrawn={onDrawn}
            onEventCalloutPointsChange={onEventCalloutPointsChange}
            onFrame={onFrame}
            spinPaused={spinPaused}
            inView={inView}
          />
        </div>
        {theme === "dark" && (
          <a
            href="https://earthdata.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="font-landing-mono absolute right-4 top-[4.5rem] z-20 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 backdrop-blur-sm sm:right-6"
          >
            NASA VIIRS night lights
          </a>
        )}
        <GlobeEventCallouts
          callouts={eventCallouts}
          nodes={calloutNodes}
          onHoverChange={onCalloutHoverChange}
        />
        {/* Shown until the map has drawn, so the first screen is never empty. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[5] bg-canvas transition-opacity duration-700 ${
            drawn ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src={stops[0]?.photos[0].src}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover opacity-35 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-canvas/70" />
        </div>

        {/* keeps the headline readable against the map */}
        <motion.div
          aria-hidden
          style={{ opacity: intro }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/95 via-canvas/50 via-45% to-transparent to-85% sm:hidden"
        />
        {/* Wide screens: a pool of canvas behind the text block rather than a
            band down the whole left side, so the place names under the
            headline and the search bar recede and the globe to the right of
            them is left alone. */}
        <motion.div
          aria-hidden
          style={{
            opacity: intro,
            background:
              "radial-gradient(ellipse 48% 56% at 17% 54%, color-mix(in srgb, var(--canvas) 86%, transparent) 0%, color-mix(in srgb, var(--canvas) 80%, transparent) 50%, color-mix(in srgb, var(--canvas) 38%, transparent) 78%, transparent 100%)",
          }}
          className="pointer-events-none absolute inset-0 hidden sm:block"
        />

        <motion.div
          style={{ opacity: intro, visibility: introVisibility }}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-28 sm:justify-center-safe sm:px-14 sm:pb-8 sm:pt-28"
        >
          <div ref={heroContentRef} className="w-fit max-w-full">
            <Kicker>
              {first
                ? `Welcome back, ${first}`
                : "FoxPassport · Book any event"}
            </Kicker>
            <h1 className="font-landing-display mt-4 max-w-2xl text-[3.4rem] leading-[0.9] text-white sm:text-7xl lg:text-[min(6.2rem,10.5svh)]">
              <MaskLines
                lines={[
                  "Book the",
                  <>
                    <span style={{ color: "var(--accent-text)" }}>night</span>,
                  </>,
                  "anywhere.",
                ]}
              />
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75 sm:hidden">
              The venue, the gear and the crew for any night, in one booking.
            </p>
            <p className="mt-5 hidden max-w-sm text-base leading-relaxed text-white/70 sm:block">
              Concerts, weddings, festivals and private events: the venue, the
              gear and the crew in one booking.
              {venues.length > 0
                ? ` ${venues.length} venues are on the map so far.`
                : ""}{" "}
              Scroll to see how FoxPassport works.
            </p>
            <HeroSearch />
            {/* One row, so the skip link costs no height on a short phone. */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <InstallAppButton />
              <a
                href="#events"
                className="pointer-events-auto text-sm font-bold text-white/70 underline underline-offset-4 hover:text-white"
              >
                Skip to events ↓
              </a>
            </div>
          </div>
        </motion.div>

        {stops.map((s, i) => (
          <StopCard
            key={s.key}
            stop={s}
            index={i}
            progress={progress}
          />
        ))}

        <motion.div
          style={{
            opacity: outro,
            pointerEvents: outroEvents,
            visibility: outroVisibility,
          }}
          className="absolute inset-x-4 top-1/2 z-30 mx-auto max-w-lg -translate-y-1/2 rounded-2xl border border-white/10 bg-canvas/90 p-8 text-center shadow-2xl backdrop-blur-md sm:p-10"
        >
          <h2 className="font-landing-display text-4xl leading-[0.95] text-white sm:text-5xl">
            Your night
            <br />
            is next.
          </h2>
          <div className="mt-6 flex items-center justify-center gap-3">
            {user ? (
              <Link
                href="/packages"
                className="rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-black"
              >
                Find an event
              </Link>
            ) : (
              <button
                type="button"
                onClick={openSignup}
                className="cursor-pointer rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-black"
              >
                Create a free account
              </button>
            )}
            <Link
              href="/venues/map"
              className="px-2 py-3 text-sm font-bold text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              Open the full map
            </Link>
          </div>
          {foxers > 0 && (
            <p className="font-landing-mono mt-5 text-[11px] uppercase tracking-[0.22em] text-white/50">
              <CountUp to={foxers} className="text-white" /> verified Foxers
            </p>
          )}
        </motion.div>

        <Rail stops={stops} progress={progress} opacity={tools} />

        {/* Always within reach once the headline search has scrolled away. */}
        <motion.div
          style={{ opacity: tools, pointerEvents: toolsEvents }}
          className="absolute bottom-24 right-4 z-30 flex items-center gap-2 sm:bottom-6 sm:right-6"
        >
          <a
            href="#events"
            className="rounded-full border border-white/15 bg-canvas/80 px-4 py-2.5 text-xs font-bold text-white/80 backdrop-blur hover:text-white"
          >
            Skip to events ↓
          </a>
          {/* The same results as the hero search, which has its own search bar. */}
          <Link
            href="/packages"
            className="rounded-full bg-accent px-5 py-2.5 text-xs font-extrabold text-black shadow-xl"
          >
            Find events
          </Link>
        </motion.div>

        <motion.p
          style={{ opacity: hint }}
          className="font-landing-mono pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 xl:left-auto xl:right-6 xl:translate-x-0 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50"
        >
          Scroll to explore ↓
        </motion.p>
      </div>
    </section>
  );
}
