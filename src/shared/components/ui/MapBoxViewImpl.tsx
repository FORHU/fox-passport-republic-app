"use client";

import React, { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  getEffectiveMapboxToken,
  getMapStyle,
  setupMapboxFallback,
} from "@/shared/lib/mapbox";

export interface MapMarkerItem {
  id: string | number;
  lng: number;
  lat: number;
  element?: HTMLElement;
  popupHtml?: string;
  title?: string;
  draggable?: boolean;
  onDragEnd?: (lngLat: [number, number]) => void;
  onClick?: () => void;
}

export interface MapBoxViewProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  interactive?: boolean;
  doubleClickZoom?: boolean;
  showNavigation?: boolean;
  showGeolocate?: boolean;
  markers?: MapMarkerItem[];
  className?: string;
  style?: React.CSSProperties;
  onMapReady?: (map: any, mapboxgl: any) => void;
  onClick?: (lngLat: [number, number], mapEvent: any) => void;
  onDblClick?: (lngLat: [number, number], mapEvent: any) => void;
  onMoveEnd?: (center: [number, number], zoom: number) => void;
  children?: React.ReactNode;
}

const DEFAULT_CENTER: [number, number] = [120.9842, 14.5995]; // Manila

export function MapBoxViewImpl({
  center = DEFAULT_CENTER,
  zoom = 12,
  minZoom = 1,
  maxZoom = 20,
  interactive = true,
  doubleClickZoom = true,
  showNavigation = true,
  showGeolocate = false,
  markers = [],
  className = "w-full h-full min-h-[300px]",
  style,
  onMapReady,
  onClick,
  onDblClick,
  onMoveEnd,
  children,
}: MapBoxViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const mapboxglRef = useRef<any>(null);
  const markerInstancesRef = useRef<Map<string | number, any>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // Keep latest callbacks in refs to avoid re-binding map event listeners
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const onDblClickRef = useRef(onDblClick);
  onDblClickRef.current = onDblClick;
  const onMoveEndRef = useRef(onMoveEnd);
  onMoveEndRef.current = onMoveEnd;
  const onMapReadyRef = useRef(onMapReady);
  onMapReadyRef.current = onMapReady;

  // Capture initial map options in a ref so the mount effect only runs once
  // without needing reactive props in the dependency array.
  const initialOptionsRef = useRef({
    center,
    zoom,
    minZoom,
    maxZoom,
    interactive,
    doubleClickZoom,
    showNavigation,
    showGeolocate,
  });

  // Mount Map
  useEffect(() => {
    if (!containerRef.current) return;
    let isCancelled = false;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (isCancelled || !containerRef.current) return;

      const {
        center: initCenter,
        zoom: initZoom,
        minZoom: initMinZoom,
        maxZoom: initMaxZoom,
        interactive: initInteractive,
        doubleClickZoom: initDoubleClickZoom,
        showNavigation: initShowNavigation,
        showGeolocate: initShowGeolocate,
      } = initialOptionsRef.current;

      mapboxglRef.current = mapboxgl;
      mapboxgl.accessToken = getEffectiveMapboxToken();

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: getMapStyle() as any,
        center: initCenter,
        zoom: initZoom,
        minZoom: initMinZoom,
        maxZoom: initMaxZoom,
        interactive: initInteractive,
        attributionControl: false,
      });

      mapRef.current = map;
      setupMapboxFallback(map);

      if (!initDoubleClickZoom) {
        map.doubleClickZoom.disable();
      }

      if (initShowNavigation) {
        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          "top-right",
        );
      }

      if (initShowGeolocate) {
        const geolocate = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
          showUserLocation: true,
        });
        map.addControl(geolocate, "top-right");
      }

      // Event Listeners
      map.on("click", (e: any) => {
        if (onClickRef.current) {
          onClickRef.current([e.lngLat.lng, e.lngLat.lat], e);
        }
      });

      map.on("dblclick", (e: any) => {
        if (onDblClickRef.current) {
          onDblClickRef.current([e.lngLat.lng, e.lngLat.lat], e);
        }
      });

      map.on("moveend", () => {
        if (onMoveEndRef.current && map) {
          const c = map.getCenter();
          onMoveEndRef.current([c.lng, c.lat], map.getZoom());
        }
      });

      const handleReady = () => {
        if (isCancelled) return;
        setIsLoaded(true);
        if (onMapReadyRef.current) {
          onMapReadyRef.current(map, mapboxgl);
        }
      };

      if (map.isStyleLoaded()) {
        handleReady();
      } else {
        map.on("load", handleReady);
        map.on("style.load", handleReady);
      }

      // Automatic container resize observation
      const resizeObserver = new ResizeObserver(() => {
        if (map && !isCancelled) {
          map.resize();
        }
      });
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    });

    const markerInstances = markerInstancesRef.current;

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerInstances.clear();
      setIsLoaded(false);
    };
  }, []); // Mount once

  // Sync Markers
  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxglRef.current;
    if (!map || !mapboxgl || !isLoaded) return;

    const currentIds = new Set(markers.map((m) => m.id));

    // Remove markers no longer in list
    markerInstancesRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markerInstancesRef.current.delete(id);
      }
    });

    // Add or update markers
    markers.forEach((item) => {
      let marker = markerInstancesRef.current.get(item.id);

      if (!marker) {
        const markerOpts: any = {
          anchor: "bottom",
          draggable: !!item.draggable,
        };
        if (item.element) {
          markerOpts.element = item.element;
        }

        marker = new mapboxgl.Marker(markerOpts)
          .setLngLat([item.lng, item.lat])
          .addTo(map);

        if (item.popupHtml) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            item.popupHtml,
          );
          marker.setPopup(popup);
        }

        if (item.title && !item.element) {
          marker.getElement().title = item.title;
        }

        if (item.draggable && item.onDragEnd) {
          marker.on("dragend", () => {
            const pos = marker.getLngLat();
            item.onDragEnd?.([pos.lng, pos.lat]);
          });
        }

        if (item.onClick) {
          marker.getElement().addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            item.onClick?.();
          });
        }

        markerInstancesRef.current.set(item.id, marker);
      } else {
        // Update existing marker position
        marker.setLngLat([item.lng, item.lat]);
      }
    });
  }, [markers, isLoaded]);

  // Sync Center and Zoom on prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;
    const current = map.getCenter();
    const diffLng = Math.abs(current.lng - center[0]);
    const diffLat = Math.abs(current.lat - center[1]);
    if (diffLng > 0.0001 || diffLat > 0.0001) {
      map.easeTo({ center, duration: 600 });
    }
  }, [center, isLoaded]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#0f111a] border border-white/10 ${className}`}
      style={style}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading Skeleton / Spinner */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#0f111a] flex flex-col items-center justify-center gap-3 z-10 animate-in fade-in">
          <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/40 font-mono">
            Loading Map View...
          </span>
        </div>
      )}

      {/* Overlay Children (Controls, Legend, Search Pills, Draw Tools) */}
      {isLoaded && children}
    </div>
  );
}

export default MapBoxViewImpl;
