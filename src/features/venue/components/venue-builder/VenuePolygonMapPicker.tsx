"use client";

import React, { useEffect, useRef, useState } from "react";
import { config } from "@/shared/lib/config";
import {
  getEffectiveMapboxToken,
  getMapStyle,
  setupMapboxFallback,
} from "@/shared/lib/mapbox";
import {
  fetchReferenceBoundaries,
  ReferenceBoundary,
} from "@/features/venue/api/venues";
import {
  LngLat,
  ringSelfIntersects,
  isDegenerate,
  approximateAreaKm2,
  polygonsOverlap,
  nearestPointOnSegment,
} from "@/shared/lib/polygonGeo";
import {
  createPinElement,
  getCategoryColor,
  categoryColorExpression,
} from "@/shared/components/ui/VenuesMap";
import "mapbox-gl/dist/mapbox-gl.css";

const OUTLINE_SOURCE_ID = "venue-boundary-outline";
const FILL_SOURCE_ID = "venue-boundary-fill";
const REFERENCE_SOURCE_ID = "venue-boundary-reference";
const DEFAULT_CENTER: LngLat = [120.9842, 14.5995]; // Manila
const CLOSE_HIT_RADIUS_PX = 16;
const EDGE_HIT_RADIUS_PX = 12;
const SNAP_RADIUS_PX = 10;
const DOUBLE_CLICK_WINDOW_MS = 250;
const MIN_VERTICES = 3;
const MAX_HISTORY = 100;
const VALID_COLOR = "#ccff00";
const INVALID_COLOR = "#ff5d5d";

interface VenuePolygonMapPickerProps {
  boundary: LngLat[] | null;
  onChange: (boundary: LngLat[] | null) => void;
  /** Recenters the map without touching the drawn shape — e.g. after an
   * address-autocomplete pick, so the host can find where to draw. */
  focusLat?: number | null;
  focusLng?: number | null;
  /** Omits this venue's own boundary from the reference layer when editing
   * an existing venue (it would otherwise "overlap" itself). */
  excludeVenueId?: string;
  className?: string;
}

function stripClosingPoint(ring: LngLat[]): LngLat[] {
  if (ring.length < 2) return ring;
  const [first] = ring;
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return ring.slice(0, -1);
  return ring;
}

function polygonFeature(ring: LngLat[]) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Polygon" as const,
      coordinates: ring.length >= 3 ? [[...ring, ring[0]]] : [[]],
    },
  };
}

// Small circular drag handles instead of Mapbox's default teardrop pin — a
// pin reads as "a place"; a dot reads as "a point you can move." The start
// vertex gets an inverted fill so it's findable as the "click here to close"
// target without a second, louder color competing with the shape itself.
//
// Mapbox writes its own positioning `transform` directly onto the element
// passed as `element` (it recalculates that on every camera move/drag, which
// is what keeps the dot glued to the map with zero added latency). Applying
// the hover-scale transform to that same element clobbers Mapbox's
// positioning and the dot snaps to the container's (0,0) corner — so the
// hover effect lives on an inner wrapper instead, leaving the outer root
// untouched.
//
// While drawing, every dot stays visible — there's nothing else showing the
// host where their points are yet. Once the shape is closed, the outline
// itself carries that information, so dots default to invisible and only
// fade in on hover: the shape reads as one clean seamless line at rest, and
// a corner is still discoverable (and draggable) the moment you reach for it.
function createVertexElement(
  isStart: boolean,
  restingHidden: boolean,
): {
  root: HTMLDivElement;
  dot: HTMLDivElement;
} {
  const size = isStart ? 14 : 10;

  const root = document.createElement("div");
  root.style.cssText = `width: ${size}px; height: ${size}px;`;

  const dot = document.createElement("div");
  dot.style.cssText = `
    width: 100%;
    height: 100%;
    border-radius: 50%;
    cursor: grab;
    box-sizing: border-box;
    border: 2px solid ${isStart ? VALID_COLOR : "#ffffff"};
    background: ${isStart ? "#0b0d14" : VALID_COLOR};
    box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.5);
    opacity: ${restingHidden ? 0 : 1};
    transition: transform 120ms ease, opacity 120ms ease;
  `;
  root.appendChild(dot);

  root.addEventListener("mouseenter", () => {
    dot.style.transform = "scale(1.35)";
    dot.style.opacity = "1";
  });
  root.addEventListener("mouseleave", () => {
    dot.style.transform = "scale(1)";
    dot.style.opacity = restingHidden ? "0" : "1";
  });

  return { root, dot };
}

interface Validity {
  selfIntersects: boolean;
  tooSmall: boolean;
  overlapsName: string | null;
}

export function VenuePolygonMapPicker({
  boundary,
  onChange,
  focusLat,
  focusLng,
  excludeVenueId,
  className = "h-96 w-full rounded-2xl overflow-hidden",
}: VenuePolygonMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const referenceRef = useRef<ReferenceBoundary[]>([]);
  const referenceMarkersRef = useRef<any[]>([]);

  const initialVertices = boundary ? stripClosingPoint(boundary) : [];
  const initialClosed = initialVertices.length >= MIN_VERTICES;

  const verticesRef = useRef<LngLat[]>(initialVertices);
  const closedRef = useRef(initialClosed);
  // Mirrored into state only to re-render the counter/hint/warning text; the
  // map itself is driven entirely off the refs above.
  const [vertexCount, setVertexCount] = useState(initialVertices.length);
  const [closed, setClosed] = useState(initialClosed);
  const [areaKm2, setAreaKm2] = useState(0);
  const [validity, setValidity] = useState<Validity>({
    selfIntersects: false,
    tooSmall: false,
    overlapsName: null,
  });
  // Full undo history — every mutation (add/move/delete/insert a point,
  // close the shape, clear it) pushes a snapshot here first, so Undo works
  // the same way at every stage instead of only "remove the last placed
  // point while still drawing."
  const historyRef = useRef<{ vertices: LngLat[]; closed: boolean }[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    let alive = true;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (!alive || !containerRef.current) return;

      mapboxgl.accessToken = getEffectiveMapboxToken();
      const initCenter = verticesRef.current[0] ?? DEFAULT_CENTER;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: getMapStyle() as any,
        center: initCenter,
        zoom: 13,
        attributionControl: false,
      });
      mapRef.current = map;
      setupMapboxFallback(map);
      map.doubleClickZoom.disable(); // repurposed: double-click closes the shape

      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right",
      );

      // Unconditional: an undo (or Clear) that reopens or empties a
      // previously-closed shape must tell the parent the boundary is gone
      // too, not just leave it holding the last-closed shape while the map
      // visibly shows something incomplete.
      const commit = () => {
        onChange(closedRef.current ? [...verticesRef.current] : null);
      };

      // Snapshot the CURRENT state before a mutation is applied, so undo can
      // restore it. Called at the start of every mutating action.
      const pushHistory = () => {
        historyRef.current.push({
          vertices: [...verticesRef.current],
          closed: closedRef.current,
        });
        if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
        setCanUndo(true);
      };

      const renderReferenceLayer = () => {
        if (!map.isStyleLoaded()) return;
        const features = referenceRef.current
          .filter((v) => Array.isArray(v.boundary) && v.boundary.length >= 3)
          .map((v) => ({
            ...polygonFeature(v.boundary as LngLat[]),
            properties: { name: v.name, category: v.category ?? "other" },
          }));
        const data = { type: "FeatureCollection" as const, features };

        const source: any = map.getSource(REFERENCE_SOURCE_ID);
        if (source) {
          source.setData(data);
        } else {
          map.addSource(REFERENCE_SOURCE_ID, { type: "geojson", data });
          // Inserted before the editable-shape sources (added later, on
          // first redraw) so the shape being drawn always renders on top.
          // Dashed line is what marks these as read-only reference shapes,
          // not this venue's own (solid-line) one — color now carries type
          // instead of "is this mine," same as every other map.
          map.addLayer({
            id: `${REFERENCE_SOURCE_ID}-fill`,
            type: "fill",
            source: REFERENCE_SOURCE_ID,
            paint: {
              "fill-color": categoryColorExpression() as any,
              "fill-opacity": 0.1,
            },
          });
          map.addLayer({
            id: `${REFERENCE_SOURCE_ID}-line`,
            type: "line",
            source: REFERENCE_SOURCE_ID,
            paint: {
              "line-color": categoryColorExpression() as any,
              "line-width": 1.5,
              "line-opacity": 0.7,
              "line-dasharray": [2, 2],
            },
          });
        }

        // Other venues that only have a pin (no drawn boundary yet) — shown
        // too, so "show all venues" actually means all of them, not just
        // the ones with a shape. Same category-colored, photo-in-a-circle
        // pin design as everywhere else, so this venue's own type is
        // findable among the rest at a glance.
        referenceMarkersRef.current.forEach((m) => m.remove());
        referenceMarkersRef.current = referenceRef.current
          .filter(
            (v) =>
              !(Array.isArray(v.boundary) && v.boundary.length >= 3) &&
              v.lat != null &&
              v.lng != null,
          )
          .map((v) => {
            const marker = new mapboxgl.Marker({
              element: createPinElement(getCategoryColor(v.category), v.image),
              anchor: "bottom",
            })
              .setLngLat([v.lng as number, v.lat as number])
              .addTo(map);
            marker.getElement().title = v.name;
            return marker;
          });
      };

      const computeValidity = (verts: LngLat[]): Validity => {
        if (!closedRef.current || verts.length < MIN_VERTICES) {
          return { selfIntersects: false, tooSmall: false, overlapsName: null };
        }
        const selfIntersects = ringSelfIntersects(verts);
        const tooSmall = isDegenerate(verts);
        let overlapsName: string | null = null;
        if (!selfIntersects && !tooSmall) {
          const hit = referenceRef.current.find(
            (v) =>
              Array.isArray(v.boundary) &&
              v.boundary.length >= 3 &&
              polygonsOverlap(verts, v.boundary),
          );
          overlapsName = hit?.name ?? null;
        }
        return { selfIntersects, tooSmall, overlapsName };
      };

      const redraw = () => {
        if (!map.isStyleLoaded()) return;

        const verts = verticesRef.current;
        const lineCoords =
          verts.length < 2
            ? []
            : closedRef.current
              ? [...verts, verts[0]]
              : verts;

        const lineData = {
          type: "Feature" as const,
          properties: {},
          geometry: { type: "LineString" as const, coordinates: lineCoords },
        };
        const fillData = polygonFeature(closedRef.current ? verts : []);

        const lineSource: any = map.getSource(OUTLINE_SOURCE_ID);
        const fillSource: any = map.getSource(FILL_SOURCE_ID);

        if (lineSource && fillSource) {
          lineSource.setData(lineData);
          fillSource.setData(fillData);
        } else {
          map.addSource(FILL_SOURCE_ID, { type: "geojson", data: fillData });
          map.addLayer({
            id: `${FILL_SOURCE_ID}-layer`,
            type: "fill",
            source: FILL_SOURCE_ID,
            paint: { "fill-color": VALID_COLOR, "fill-opacity": 0.08 },
          });
          map.addSource(OUTLINE_SOURCE_ID, {
            type: "geojson",
            data: lineData,
          });
          // A dark halo drawn under the bright outline keeps the line
          // legible over street labels and light basemap features, instead
          // of a single thin stroke fighting the map for contrast.
          map.addLayer({
            id: `${OUTLINE_SOURCE_ID}-halo`,
            type: "line",
            source: OUTLINE_SOURCE_ID,
            paint: {
              "line-color": "#0b0d14",
              "line-width": 5,
              "line-opacity": 0.6,
            },
            layout: { "line-join": "round", "line-cap": "round" },
          });
          map.addLayer({
            id: `${OUTLINE_SOURCE_ID}-layer`,
            type: "line",
            source: OUTLINE_SOURCE_ID,
            paint: { "line-color": VALID_COLOR, "line-width": 2 },
            layout: { "line-join": "round", "line-cap": "round" },
          });
        }

        const v = computeValidity(verts);
        setValidity(v);
        setAreaKm2(closedRef.current ? approximateAreaKm2(verts) : 0);

        const color =
          v.selfIntersects || v.tooSmall || v.overlapsName
            ? INVALID_COLOR
            : VALID_COLOR;
        map.setPaintProperty(`${FILL_SOURCE_ID}-layer`, "fill-color", color);
        map.setPaintProperty(`${OUTLINE_SOURCE_ID}-layer`, "line-color", color);
      };

      // Every own vertex plus every reference-venue vertex, as candidates a
      // new/dragged point can snap to (e.g. to share an edge with a
      // neighboring venue). `skipOwnIndex` excludes the vertex currently
      // being moved so it doesn't just "snap" to its own start position.
      const findSnapTarget = (
        candidate: LngLat,
        skipOwnIndex?: number,
      ): LngLat | null => {
        const candidateScreen = map.project(candidate);
        let closest: { point: LngLat; distSq: number } | null = null;

        const consider = (pt: LngLat) => {
          const screen = map.project(pt);
          const dx = screen.x - candidateScreen.x;
          const dy = screen.y - candidateScreen.y;
          const distSq = dx * dx + dy * dy;
          if (distSq <= SNAP_RADIUS_PX * SNAP_RADIUS_PX) {
            if (!closest || distSq < closest.distSq)
              closest = { point: pt, distSq };
          }
        };

        verticesRef.current.forEach((pt, i) => {
          if (i !== skipOwnIndex) consider(pt);
        });
        referenceRef.current.forEach((ref) => {
          (ref.boundary ?? []).forEach((pt) => consider(pt as LngLat));
        });

        return closest ? (closest as { point: LngLat }).point : null;
      };

      const rebuildMarkers = () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = verticesRef.current.map((v, idx) => {
          const { root } = createVertexElement(idx === 0, closedRef.current);
          const marker = new mapboxgl.Marker({ element: root, draggable: true })
            .setLngLat(v)
            .addTo(map);

          // Snapshot the pre-drag position once, when the gesture starts —
          // not on every "drag" frame, so Undo restores to before the whole
          // drag rather than one pixel back.
          marker.on("dragstart", () => {
            pushHistory();
          });

          // "drag" fires every frame while the pointer moves — redrawing
          // here is what makes the outline track the vertex live instead of
          // only snapping into place once the drag is released. "dragend"
          // still commits the final position upstream (onChange), which
          // "drag" deliberately skips to avoid firing a store update on
          // every frame.
          marker.on("drag", () => {
            const pos = marker.getLngLat();
            verticesRef.current[idx] = [pos.lng, pos.lat];
            redraw();
          });
          marker.on("dragend", () => {
            const pos = marker.getLngLat();
            const snapped = findSnapTarget([pos.lng, pos.lat], idx);
            const final = snapped ?? [pos.lng, pos.lat];
            verticesRef.current[idx] = final;
            marker.setLngLat(final);
            redraw();
            commit();
          });

          // Deleting a vertex from a finished shape — the only way to
          // remove a point without clearing and redrawing from scratch.
          // Stays above MIN_VERTICES so the shape can't collapse to a line.
          root.addEventListener("dblclick", (e) => {
            e.stopPropagation();
            if (!closedRef.current) return;
            if (verticesRef.current.length <= MIN_VERTICES) return;
            pushHistory();
            verticesRef.current.splice(idx, 1);
            setVertexCount(verticesRef.current.length);
            rebuildMarkers();
            redraw();
            commit();
          });

          return marker;
        });
      };

      const addVertex = (point: LngLat) => {
        pushHistory();
        const snapped = findSnapTarget(point) ?? point;
        verticesRef.current.push(snapped);
        setVertexCount(verticesRef.current.length);
        rebuildMarkers();
        redraw();
      };

      const closeShape = () => {
        pushHistory();
        closedRef.current = true;
        setClosed(true);
        // Rebuilds every dot so it picks up `restingHidden: true` — they
        // were created while still drawing (visible by default) and won't
        // pick up the closed-shape hidden style on their own.
        rebuildMarkers();
        redraw();
        commit();
      };

      // Restores the last snapshot pushed by `pushHistory` — works at every
      // stage: undoes the last placed point while drawing, a drag, a
      // delete, an edge insertion, a close, or a full clear.
      const undo = () => {
        const prev = historyRef.current.pop();
        if (!prev) return;
        setCanUndo(historyRef.current.length > 0);

        verticesRef.current = prev.vertices;
        closedRef.current = prev.closed;
        setVertexCount(prev.vertices.length);
        setClosed(prev.closed);
        rebuildMarkers();
        redraw();
        commit();
      };

      // Click near an existing edge of a *closed* shape inserts a new
      // vertex there, projected onto the edge — the only way to add detail
      // to a side after closing, short of clearing and redrawing.
      const tryInsertOnEdge = (clicked: LngLat): boolean => {
        const verts = verticesRef.current;
        let best: { index: number; point: LngLat; distPx: number } | null =
          null;
        const clickedScreen = map.project(clicked);

        for (let i = 0; i < verts.length; i++) {
          const a = verts[i];
          const b = verts[(i + 1) % verts.length];
          const nearest = nearestPointOnSegment(clicked, a, b);
          const nearestScreen = map.project(nearest);
          const dx = nearestScreen.x - clickedScreen.x;
          const dy = nearestScreen.y - clickedScreen.y;
          const distPx = Math.sqrt(dx * dx + dy * dy);
          if (distPx <= EDGE_HIT_RADIUS_PX && (!best || distPx < best.distPx)) {
            best = { index: i + 1, point: nearest, distPx };
          }
        }

        if (!best) return false;
        pushHistory();
        verticesRef.current.splice(best.index, 0, best.point);
        setVertexCount(verticesRef.current.length);
        rebuildMarkers();
        redraw();
        commit();
        return true;
      };

      map.on("load", () => {
        rebuildMarkers();
        redraw();
        if (referenceRef.current.length > 0) renderReferenceLayer();
      });

      // Single click is deferred briefly so a following second click can be
      // recognized as a double-click (which closes the shape) instead of
      // both clicks separately placing/acting — mapbox-gl always fires
      // "click" "click" then "dblclick" for a double-click, so without this
      // debounce a double-click-to-close would also drop two stray vertices.
      let pendingClick: ReturnType<typeof setTimeout> | null = null;

      map.on("click", (e: any) => {
        const clicked: LngLat = [e.lngLat.lng, e.lngLat.lat];

        if (closedRef.current) {
          tryInsertOnEdge(clicked);
          return;
        }

        if (pendingClick) {
          clearTimeout(pendingClick);
          pendingClick = null;
          return; // second click of a double-click; dblclick handler owns it
        }

        pendingClick = setTimeout(() => {
          pendingClick = null;

          if (verticesRef.current.length >= MIN_VERTICES) {
            const firstScreen = map.project(verticesRef.current[0]);
            const clickScreen = map.project(clicked);
            const dx = firstScreen.x - clickScreen.x;
            const dy = firstScreen.y - clickScreen.y;
            if (Math.sqrt(dx * dx + dy * dy) <= CLOSE_HIT_RADIUS_PX) {
              closeShape();
              return;
            }
          }
          addVertex(clicked);
        }, DOUBLE_CLICK_WINDOW_MS);
      });

      map.on("dblclick", () => {
        if (closedRef.current) return;
        if (pendingClick) {
          clearTimeout(pendingClick);
          pendingClick = null;
        }
        if (verticesRef.current.length >= MIN_VERTICES) closeShape();
      });

      map.on("contextmenu", (e: any) => {
        e.originalEvent?.preventDefault?.();
        undo();
      });

      (map as any).__reset = () => {
        if (verticesRef.current.length === 0) return;
        pushHistory();
        verticesRef.current = [];
        closedRef.current = false;
        setVertexCount(0);
        setClosed(false);
        rebuildMarkers();
        redraw();
        commit();
      };

      (map as any).__undo = undo;

      (map as any).__fitToShape = () => {
        const verts = verticesRef.current;
        if (verts.length === 0) return;
        let minLng = verts[0][0];
        let maxLng = verts[0][0];
        let minLat = verts[0][1];
        let maxLat = verts[0][1];
        for (const [lng, lat] of verts) {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
        map.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 60, duration: 500, maxZoom: 17 },
        );
      };

      (map as any).__renderReferenceLayer = renderReferenceLayer;

      if (containerRef.current && "ResizeObserver" in window) {
        const observer = new ResizeObserver(() => map.resize());
        observer.observe(containerRef.current);
        (map as any).__resizeObserver = observer;
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") undo();
      };
      document.addEventListener("keydown", handleKeyDown);
      (map as any).__cleanupKeydown = () =>
        document.removeEventListener("keydown", handleKeyDown);
    });

    return () => {
      alive = false;
      mapRef.current?.__resizeObserver?.disconnect();
      markersRef.current.forEach((m) => m.remove());
      referenceMarkersRef.current.forEach((m) => m.remove());
      mapRef.current?.__cleanupKeydown?.();
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = [];
      referenceMarkersRef.current = [];
    };
    // Map is built once; the `boundary` prop only seeds the initial ref
    // above, further external boundary changes aren't expected mid-edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reference layer: every other live venue's shape, fetched once so the
  // host can see what they'd overlap before they draw, not just find out
  // from the Publish rejection.
  useEffect(() => {
    let cancelled = false;
    fetchReferenceBoundaries(excludeVenueId)
      .then((boundaries) => {
        if (cancelled) return;
        referenceRef.current = boundaries;
        const map = mapRef.current;
        if (map?.__renderReferenceLayer) map.__renderReferenceLayer();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [excludeVenueId]);

  // Recenter (without altering the drawn shape) when an address search picks
  // a city elsewhere on the map.
  useEffect(() => {
    if (focusLat == null || focusLng == null) return;
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [focusLng, focusLat], zoom: 13, duration: 800 });
  }, [focusLat, focusLng]);

  const handleReset = () => mapRef.current?.__reset?.();
  const handleUndo = () => mapRef.current?.__undo?.();
  const handleFitToShape = () => mapRef.current?.__fitToShape?.();

  const warning = validity.selfIntersects
    ? "This shape crosses itself — drag a point until the outline stops overlapping."
    : validity.tooSmall
      ? "This shape is too small or too thin to be a real service area."
      : validity.overlapsName
        ? `This overlaps an existing venue: "${validity.overlapsName}".`
        : null;

  return (
    <div className="space-y-3">
      <div ref={containerRef} className={className} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] text-white/40">
            {closed
              ? "Drag a point to reshape, double-click a point to remove it, click an edge to add one. Undo (or Esc / right-click) reverts the last change."
              : vertexCount === 0
                ? "Click the map to start drawing your venue's service area. Double-click to close early."
                : vertexCount < MIN_VERTICES
                  ? `${vertexCount} point${vertexCount === 1 ? "" : "s"} placed — add ${MIN_VERTICES - vertexCount} more. Esc / right-click undoes a point.`
                  : "Click the dark starting point (or double-click) to close the shape."}
          </p>
          {closed && !warning && (
            <p className="text-[11px] text-[#ccff00]/70">
              ~
              {areaKm2 < 1
                ? `${Math.round(areaKm2 * 1_000_000).toLocaleString()} m²`
                : `${areaKm2.toFixed(2)} km²`}
            </p>
          )}
          {warning && (
            <p className="text-[11px] text-[#ff5d5d] font-semibold">
              {warning}
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {canUndo && (
            <button
              type="button"
              onClick={handleUndo}
              className="text-[10px] font-bold uppercase tracking-wider text-white/50 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30"
            >
              Undo
            </button>
          )}
          {vertexCount > 0 && (
            <button
              type="button"
              onClick={handleFitToShape}
              className="text-[10px] font-bold uppercase tracking-wider text-white/50 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30"
            >
              Fit View
            </button>
          )}
          {vertexCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] font-bold uppercase tracking-wider text-white/50 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30"
            >
              Clear Shape
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
