"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
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
import { destinationEventCards, HeroSearch } from "./booking";

const ACCENT = "#ccff00";
const STOPS = DESTINATIONS.length;
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

function planeFC(at: LngLat | null, bearing: number) {
  return {
    type: "FeatureCollection" as const,
    features: at
      ? [
          {
            type: "Feature" as const,
            properties: { bearing },
            geometry: { type: "Point" as const, coordinates: at },
          },
        ]
      : [],
  };
}

/**
 * The plane, drawn once to a canvas and handed to the map as an image, so it is
 * a layer of the map itself: painted in the same frame as the route line and
 * never drifting off the end of it.
 */
function planeImage(color: string) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d")!;
  const fuselage = new Path2D(
    "M64 4 C70 4 72 14 72 26 L72 96 C72 106 68 114 64 120 C60 114 56 106 56 96 L56 26 C56 14 58 4 64 4 Z",
  );
  const wings = new Path2D(
    "M72 46 L120 82 L120 91 L72 74 Z M56 46 L8 82 L8 91 L56 74 Z",
  );
  const tail = new Path2D(
    "M70 100 L96 114 L96 120 L70 112 Z M58 100 L32 114 L32 120 L58 112 Z",
  );
  g.shadowColor = "rgba(0,0,0,0.55)";
  g.shadowBlur = 7;
  g.shadowOffsetY = 4;
  g.lineJoin = "round";
  g.lineWidth = 5;
  g.strokeStyle = "rgba(0,0,0,0.9)";
  for (const part of [wings, tail, fuselage]) g.stroke(part);
  g.shadowColor = "transparent";
  g.fillStyle = color;
  for (const part of [wings, tail, fuselage]) g.fill(part);
  g.fillStyle = "rgba(0,0,0,0.38)";
  for (const [x, y] of [
    [90, 76],
    [38, 76],
  ]) {
    g.beginPath();
    g.ellipse(x, y, 4.6, 10, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.beginPath();
  g.ellipse(64, 20, 5, 7, 0, 0, Math.PI * 2);
  g.fill();
  return g.getImageData(0, 0, size, size);
}

/** An angle as the equivalent one between -180 and 180 degrees. */
const wrapDeg = (d: number) => (((d % 360) + 540) % 360) - 180;

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
};

function projectVisibleEventLocations(
  map: any,
  locations: LandingEventLocation[],
  width: number,
  height: number,
): ProjectedEventLocation[] {
  const center = map.getCenter();
  const centerLat = (center.lat * Math.PI) / 180;
  const minDot = Math.cos((78 * Math.PI) / 180);

  return locations
    .map((location) => {
      const lat = (location.lat * Math.PI) / 180;
      const longitudeDelta = ((location.lng - center.lng) * Math.PI) / 180;
      const dot =
        Math.sin(centerLat) * Math.sin(lat) +
        Math.cos(centerLat) * Math.cos(lat) * Math.cos(longitudeDelta);
      return { location, dot };
    })
    .filter(({ dot }) => dot > minDot)
    .sort((a, b) => b.dot - a.dot)
    .map(({ location }) => ({
      location,
      point: projectEventLocation(map, location),
    }))
    .filter(
      ({ point }) =>
        Number.isFinite(point.x) &&
        Number.isFinite(point.y) &&
        isEventCalloutInsideMap(point, width, height),
    );
}

function placeEventCallouts(
  points: ProjectedEventLocation[],
  width: number,
  height: number,
  avoid?: EventCalloutRect,
): PositionedEventCallout[] {
  const markerSize = 12;
  const markers = points.map(({ point }) => ({
    left: point.x - markerSize / 2,
    top: point.y - markerSize / 2,
    right: point.x + markerSize / 2,
    bottom: point.y + markerSize / 2,
  }));
  const occupied: EventCalloutRect[] = avoid ? [avoid] : [];
  const placed: PositionedEventCallout[] = [];

  points.forEach(({ location, point }, index) => {
    const blockers = [
      ...occupied,
      ...markers.filter((_, markerIndex) => markerIndex !== index),
    ];
    const placement = getEventCalloutPlacement(
      point,
      width,
      height,
      blockers,
    );
    if (!placement) return;

    const callout = { location, markerX: point.x, markerY: point.y, ...placement };
    placed.push(callout);
    occupied.push({
      left: placement.left,
      top: placement.top,
      right: placement.left + EVENT_CALLOUT_WIDTH,
      bottom: placement.top + EVENT_CALLOUT_HEIGHT,
    });
  });

  return placed;
}

export function getVisibleEventCalloutPlacements(
  map: any,
  locations: LandingEventLocation[],
  width: number,
  height: number,
  avoid?: EventCalloutRect,
): PositionedEventCallout[] {
  return placeEventCallouts(
    projectVisibleEventLocations(map, locations, width, height),
    width,
    height,
    avoid,
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

const EVENT_CALLOUT_WIDTH = 224;
const EVENT_CALLOUT_HEIGHT = 96;

export function getEventCalloutPlacement(
  point: { x: number; y: number },
  width: number,
  height: number,
  avoid?: EventCalloutRect | EventCalloutRect[],
): { left: number; top: number; edgeX: number; edgeY: number } | null {
  const cardWidth = EVENT_CALLOUT_WIDTH;
  const cardHeight = EVENT_CALLOUT_HEIGHT;
  const margin = 8;
  const gap = 16;
  const avoidRects = avoid ? (Array.isArray(avoid) ? avoid : [avoid]) : [];
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));
  const candidates = [
    { left: point.x - cardWidth / 2, top: point.y - cardHeight - gap },
    { left: point.x + gap, top: point.y - cardHeight / 2 },
    { left: point.x - cardWidth / 2, top: point.y + gap },
    { left: point.x - cardWidth - gap, top: point.y - cardHeight / 2 },
  ];

  for (const rect of avoidRects) {
    candidates.push(
      {
        left: rect.right + gap,
        top: clamp(
          point.y - cardHeight / 2,
          margin,
          height - cardHeight - margin,
        ),
      },
      {
        left: rect.left - cardWidth - gap,
        top: clamp(
          point.y - cardHeight / 2,
          margin,
          height - cardHeight - margin,
        ),
      },
    );
  }

  const placement = candidates.find(({ left, top }) => {
    if (
      left < margin ||
      top < margin ||
      left + cardWidth > width - margin ||
      top + cardHeight > height - margin
    ) {
      return false;
    }
    return !avoidRects.some(
      (rect) =>
        left < rect.right &&
        left + cardWidth > rect.left &&
        top < rect.bottom &&
        top + cardHeight > rect.top,
    );
  });
  if (!placement) return null;

  return {
    ...placement,
    edgeX: clamp(point.x, placement.left, placement.left + cardWidth),
    edgeY: clamp(point.y, placement.top, placement.top + cardHeight),
  };
}

// ---------------------------------------------------------------------------
// The map, driven by scroll
// ---------------------------------------------------------------------------

function JourneyMap({
  venues,
  eventLocations,
  stops,
  progress,
  onDrawn,
  onEventCalloutPointsChange,
}: {
  venues: LandingVenue[];
  eventLocations: LandingEventLocation[];
  stops: Stop[];
  progress: MotionValue<number>;
  /** Called once the map has drawn its first frame. */
  onDrawn: () => void;
  onEventCalloutPointsChange: (points: ProjectedEventLocation[]) => void;
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
  // What was last sent to the map, so an update that changes nothing is free.
  const sent = useRef({ route: "", plane: "" });
  const eventFocusInitialized = useRef(false);
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

  const drawPlane = useCallback(() => {
    const source = mapRef.current?.getSource("journey-plane");
    if (!source) return;
    const pl = plane.current;
    const key = pl.head
      ? `${pl.head[0].toFixed(4)},${pl.head[1].toFixed(4)},${pl.shown.toFixed(1)}`
      : "";
    if (key === sent.current.plane) return;
    sent.current.plane = key;
    source.setData(planeFC(pl.head, pl.shown));
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
        drawPlane();
        return;
      }
      pl.shown += diff * 0.22;
      drawPlane();
      pl.raf = requestAnimationFrame(() => turnNose.current());
    };
  }, [drawPlane]);
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
      const done: LngLat[] = [];
      let flying = false;

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
        for (const leg of legs) done.push(...leg);
      } else {
        const u = (p - START) / LEG;
        const k = Math.min(LEGS - 1, Math.floor(u));
        const f = u - k;
        const a = pts[k];
        const b = pts[k + 1];
        const out = outZoom[k];

        for (let i = 0; i < k; i++) done.push(...legs[i]);

        if (f < REST_END) {
          // resting at the place just reached
          center = a;
          zoom = ZOOM_IN;
        } else if (f < OUT_END) {
          // pulling out, still over the place
          center = a;
          zoom = lerp(
            ZOOM_IN,
            out,
            smooth((f - REST_END) / (OUT_END - REST_END)),
          );
        } else if (f < FLY_END) {
          // flying, with the camera on the plane
          const t = smooth((f - OUT_END) / (FLY_END - OUT_END));
          const along = arc(a, b, t);
          done.push(...along);
          flying = t < 0.995;
          center = along[along.length - 1];
          zoom = out;
        } else if (f < IN_END) {
          // coming in on the next place
          done.push(...legs[k]);
          center = b;
          zoom = lerp(out, ZOOM_IN, smooth((f - FLY_END) / (IN_END - FLY_END)));
        } else {
          // resting at the next place
          done.push(...legs[k]);
          center = b;
          zoom = ZOOM_IN;
        }
      }

      // While a pin is out, the place sits lower on screen so the pin has room
      // to grow upward from it.
      let amount = 0;
      for (let i = 0; i < STOPS; i++)
        amount = Math.max(amount, cardAmount(p, i));
      const box = map.getContainer() as HTMLElement;
      const h = box.clientHeight;
      const w = box.clientWidth;
      map.jumpTo({
        center,
        zoom,
        pitch: 0,
        bearing: 0,
        padding: {
          top: h * pinPad(h, w) * amount,
          bottom: 0,
          left: 0,
          right: 0,
        },
      });

      const { width, height } = map.getContainer().getBoundingClientRect();
      onEventCalloutPointsChange(
        p <= IDLE_END
          ? projectVisibleEventLocations(map, eventLocations, width, height)
          : [],
      );

      const route = map.getSource("journey-route");
      const key = `${done.length}:${done[done.length - 1]?.join(",") ?? ""}`;
      if (route && key !== sent.current.route) {
        sent.current.route = key;
        route.setData(lineFC(done));
      }

      // The plane sits on the head of the line being drawn, nose along the
      // direction of travel (the line's own direction going forward, the
      // opposite going back), and is out of sight while resting at a place.
      const pl = plane.current;
      const n = done.length;
      if (flying && n > 3) {
        const head = done[n - 1];
        const back = done[n - 4];
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
        drawPlane();
      } else if (pl.head) {
        pl.head = null;
        drawPlane();
      }
    },
    [
      pts,
      legs,
      outZoom,
      drawPlane,
      eventLocations,
      onEventCalloutPointsChange,
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
            paint: {
              "raster-opacity": 0.58,
              "raster-fade-duration": 0,
              "raster-brightness-min": 0.02,
              "raster-brightness-max": 0.82,
            },
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
      map.addSource("journey-route", { type: "geojson", data: lineFC([]) });
      map.addLayer({
        id: "journey-route-halo",
        type: "line",
        source: "journey-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ink, "line-width": 9, "line-opacity": 0.18 },
      });
      map.addLayer({
        id: "journey-route",
        type: "line",
        source: "journey-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ink, "line-width": 2.6 },
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
      // Last, so it is drawn over everything else.
      if (!map.hasImage("journey-plane")) {
        map.addImage("journey-plane", planeImage(ink), { pixelRatio: 2 });
      }
      map.addSource("journey-plane", {
        type: "geojson",
        data: planeFC(null, 0),
      });
      map.addLayer({
        id: "journey-plane",
        type: "symbol",
        source: "journey-plane",
        layout: {
          "icon-image": "journey-plane",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "icon-rotate": ["get", "bearing"],
          "icon-rotation-alignment": "map",
          "icon-size": ["interpolate", ["linear"], ["zoom"], 1, 0.7, 6, 1],
        },
      });
    },
    [venues, eventLocations, stops, ink, theme],
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
      // The whole world, sized to the screen.
      const el = map.getContainer() as HTMLElement;
      const px = Math.min(el.clientWidth, el.clientHeight * 1.4);
      wideRef.current = {
        lat: 24,
        zoom: Math.max(0.9, Math.log2(px / 512) + 0.8),
      };
      setSky(map);
      addLayers(map);
      render(progress.get());
    },
    [addLayers, render, progress, setSky, onDrawn],
  );

  // After a theme change the basemap reloads and drops our layers.
  const onStyle = useCallback(
    (map: any) => {
      sent.current = { route: "", plane: "" };
      setSky(map);
      addLayers(map);
      render(progress.get());
    },
    [addLayers, render, progress, setSky],
  );

  // The scroll value can change several times between two frames; only the
  // latest matters, so draw once per frame instead of once per change.
  const pending = useRef<number | null>(null);
  const frame = useRef(0);
  const schedule = useCallback(
    (p: number) => {
      pending.current = p;
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        if (pending.current !== null) render(pending.current);
      });
    },
    [render],
  );
  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );

  // Before the first scroll, and again once the tour is over and the camera is
  // back out, the world keeps turning behind the card. Scrolling back up hands control to the tour again.
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      const p = progress.get();
      if (!mapRef.current || (p >= IDLE_END && p < OUT_FROM + 0.06)) return;
      spin.current -= dt * SPIN_DEG_PER_SEC;
      render(p);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, render, reduceMotion]);
  useMotionValueEvent(progress, "change", schedule);

  return (
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

function StopCard({
  stop,
  index,
  progress,
  eventCards,
}: {
  stop: Stop;
  index: number;
  progress: MotionValue<number>;
  eventCards: ReturnType<typeof destinationEventCards>;
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
          {eventCards.length > 0 && (
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
                  .slice(0, eventCards.length)
                  .map((line, cardIndex) => (
                    <line
                      key={eventCards[cardIndex].kind}
                      x1={line.startX}
                      y1={line.startY}
                      x2={line.endX}
                      y2={line.endY}
                      stroke="rgba(204,255,0,0.72)"
                      strokeWidth="1.5"
                    />
                  ))}
              </svg>
              {eventCards.map((card, cardIndex) => {
                const slot = [
                  { x: 0, y: 0 },
                  { x: 960, y: 0 },
                  { x: 0, y: 280 },
                  { x: 960, y: 280 },
                ][cardIndex];
                return (
                  <Link
                    key={card.kind}
                    href={
                      card.event
                        ? `/event/${card.event.id}`
                        : `/search?category=${card.kind}&city=${encodeURIComponent(stop.name)}`
                    }
                    className="absolute z-10 hidden h-[220px] w-[300px] flex-col justify-end overflow-hidden rounded-2xl border border-accent/45 bg-surface text-white shadow-xl transition-transform hover:scale-[1.03] xl:flex"
                    style={{
                      left: `calc(50% - 630px + ${slot.x}px)`,
                      top: `${slot.y}px`,
                    }}
                  >
                    <img
                      src={card.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10"
                    />
                    <span className="relative z-[1] p-4">
                      <span className="font-landing-mono block truncate text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                        {card.label}
                      </span>
                      <span className="font-landing-display mt-1.5 line-clamp-2 block text-lg leading-tight">
                        {card.event?.name ??
                          `Browse ${card.label.toLowerCase()} in ${stop.name}`}
                      </span>
                    </span>
                  </Link>
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
                  alt={i === active ? `${stop.name}, ${stop.region}` : ""}
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
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(STOPS).padStart(2, "0")}
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
                <h3 className="font-landing-display max-w-full whitespace-normal break-words text-2xl leading-tight text-[#fff] sm:text-3xl lg:text-4xl">
                  {stop.name}
                </h3>
                <p className="font-landing-mono mt-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#fff]/85">
                  {stop.region}
                </p>
              </div>
            </div>
            <div className="p-5">
              <p className="font-landing-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                {stop.kind}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                {stop.tagline}
              </p>
              {eventCards.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 xl:hidden">
                  {eventCards.map((card) => (
                    <Link
                      key={card.kind}
                      href={
                        card.event
                          ? `/event/${card.event.id}`
                          : `/search?category=${card.kind}&city=${encodeURIComponent(stop.name)}`
                      }
                      className="flex min-h-24 w-64 shrink-0 items-center gap-3 rounded-xl border border-accent/30 bg-white/5 p-3 text-left"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-accent/25 via-white/10 to-sky-400/20">
                        <img
                          src={card.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="min-w-0">
                        <span className="font-landing-mono block truncate text-[9px] font-bold uppercase tracking-[0.12em] text-accent">
                          {card.label}
                        </span>
                        <span className="mt-0.5 line-clamp-1 block text-xs text-white/85">
                          {card.event?.name ??
                            `Browse ${card.label.toLowerCase()} events`}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href={`/search?category=${stop.category}`}
                  className="inline-flex rounded-full bg-accent px-5 py-2.5 text-xs font-extrabold text-black transition-transform hover:scale-[1.03]"
                >
                  Find events like these →
                </Link>
                {stop.count > 0 && (
                  <span className="font-landing-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                    {stop.count} {stop.count === 1 ? "venue" : "venues"} nearby
                  </span>
                )}
              </div>
              <a
                href={stop.photos[active].credit.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-landing-mono mt-4 line-clamp-2 text-[10px] uppercase leading-snug tracking-[0.1em] text-white/55 hover:text-white"
              >
                {stop.photos[active].subject === "city"
                  ? `${stop.name} city view`
                  : "Past event photo"}{" "}
                · {stop.photos[active].credit.author} (
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

/** The places along the bottom, lighting up as the tour reaches each. */
function Rail({
  stops,
  progress,
}: {
  stops: Stop[];
  progress: MotionValue<number>;
}) {
  return (
    <div className="absolute bottom-6 left-6 z-20 hidden items-center gap-4 xl:flex">
      {stops.map((s, i) => (
        <RailStop key={s.key} label={s.name} index={i} progress={progress} />
      ))}
    </div>
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
      {label}
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

function GlobeEventCallouts({
  callouts,
}: {
  callouts: PositionedEventCallout[];
}) {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
        {callouts.map((callout) => (
          <g key={callout.location.key}>
            <line
              x1={callout.markerX}
              y1={callout.markerY}
              x2={callout.edgeX}
              y2={callout.edgeY}
              stroke="rgba(255,255,255,0.72)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={callout.markerX}
              cy={callout.markerY}
              r="4"
              fill="var(--accent)"
              stroke="white"
              strokeWidth="1"
            />
          </g>
        ))}
      </svg>
      <AnimatePresence initial={false}>
        {callouts.map((callout) => (
          <GlobeEventCalloutCard
            key={callout.location.key}
            callout={callout}
            reduce={reduce}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function GlobeEventCalloutCard({
  callout,
  reduce,
}: {
  callout: PositionedEventCallout;
  reduce: boolean | null;
}) {
  const { location } = callout;
  const [eventIndex, setEventIndex] = useState(0);
  const eventCount = location.events.length;
  const event = location.events[eventIndex % eventCount];
  const image = event.images?.find((item) => item.url)?.url;

  useEffect(() => {
    setEventIndex(0);
  }, [location.key]);

  useEffect(() => {
    if (eventCount < 2 || reduce) return;
    const timer = window.setInterval(
      () => setEventIndex((index) => (index + 1) % eventCount),
      4200,
    );
    return () => window.clearInterval(timer);
  }, [eventCount, location.key, reduce]);

  return (
    <motion.article
      key={`${location.key}:${event.id}`}
      initial={reduce ? false : { opacity: 0, scale: 0.76, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.88, y: 8 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto absolute w-[min(224px,calc(100vw-1.5rem))] rounded-xl border border-white/20 bg-surface/95 p-2 text-white shadow-[0_12px_36px_rgba(0,0,0,0.3)] backdrop-blur-md"
      style={{ left: callout.left, top: callout.top }}
      aria-live="polite"
    >
      <Link
        href={`/event/${event.id}`}
        className="group flex items-center gap-2"
      >
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-sky-400/40 via-emerald-400/20 to-accent/20">
          {image && (
            <img
              src={image}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-landing-mono truncate text-[9px] font-bold uppercase tracking-[0.12em] text-[color:var(--accent-text)]">
            {location.city} · {location.events.length}{" "}
            {location.events.length === 1 ? "event" : "events"}
          </p>
          <h2 className="font-landing-display mt-0.5 line-clamp-2 text-sm leading-tight">
            {event.name}
          </h2>
          <p className="font-landing-mono mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/65">
            View event <span aria-hidden>→</span>
          </p>
        </div>
      </Link>
    </motion.article>
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
  const spring = useSpring(rawProgress, {
    stiffness: 110,
    damping: 26,
    mass: 0.6,
    restDelta: 0.0002,
  });
  const progress = reduceMotion ? rawProgress : spring;

  // Each destination, with whatever real venues are near it.
  const stops = useMemo<Stop[]>(() => buildStops(venues), [venues]);
  const destinationEvents = useMemo(
    () =>
      new Map(
        stops.map((stop) => [
          stop.key,
          destinationEventCards(stop, eventLocations),
        ]),
      ),
    [stops, eventLocations, events],
  );

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
  const [eventCallouts, setEventCallouts] = useState<PositionedEventCallout[]>([]);
  const onDrawn = useCallback(() => setDrawn(true), []);
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
      const next = placeEventCallouts(
        points,
        viewport.clientWidth,
        viewport.clientHeight,
        avoid,
      );
      setEventCallouts((current) => {
        if (
          current.length === next.length &&
          current.every((callout, index) => {
            const updated = next[index];
            return (
              callout.location.key === updated.location.key &&
              Math.abs(callout.left - updated.left) < 1.5 &&
              Math.abs(callout.top - updated.top) < 1.5 &&
              Math.abs(callout.markerX - updated.markerX) < 1.5 &&
              Math.abs(callout.markerY - updated.markerY) < 1.5
            );
          })
        ) {
          return current;
        }
        return next;
      });
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
      style={{ height: `${STOPS * 100 + 50}vh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* The map is a picture; the cards carry the words. */}
        <div ref={mapViewportRef} aria-hidden className="absolute inset-0">
          <JourneyMap
            venues={venues}
            eventLocations={eventLocations}
            stops={stops}
            progress={progress}
            onDrawn={onDrawn}
            onEventCalloutPointsChange={onEventCalloutPointsChange}
          />
        </div>
        {theme === "dark" && (
          <a
            href="https://earthdata.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="font-landing-mono absolute right-4 top-[4.5rem] z-20 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white/55 backdrop-blur-sm sm:right-6"
          >
            NASA VIIRS night lights
          </a>
        )}
        <GlobeEventCallouts callouts={eventCallouts} />
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/95 via-canvas/45 to-transparent sm:bg-gradient-to-r sm:from-canvas/80 sm:via-canvas/20 sm:to-transparent"
        />

        <motion.div
          style={{ opacity: intro, visibility: introVisibility }}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-28 sm:justify-center sm:px-14 sm:pb-0"
        >
          <div ref={heroContentRef} className="w-fit max-w-full">
            <Kicker>
              {first
                ? `Welcome back, ${first}`
                : "FoxPassport · Book any event"}
            </Kicker>
            <h1 className="font-landing-display mt-4 max-w-2xl text-[3.4rem] leading-[0.9] text-white sm:text-7xl lg:text-[6.2rem]">
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
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70 sm:text-base">
              Concerts, weddings, festivals and private events: the venue, the
              gear and the crew in one booking.
              {venues.length > 0
                ? ` ${venues.length} venues are on the map so far.`
                : ""}{" "}
              Scroll to see the kinds of nights people plan.
            </p>
            <HeroSearch />
          </div>
        </motion.div>

        {stops.map((s, i) => (
          <StopCard
            key={s.key}
            stop={s}
            index={i}
            progress={progress}
            eventCards={destinationEvents.get(s.key) ?? []}
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
                href="/search"
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

        <Rail stops={stops} progress={progress} />

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
          <Link
            href="/search"
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
