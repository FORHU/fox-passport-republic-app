"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useUserLocation } from "@/shared/hooks/useUserLocation";
import {
  PartnerInvestment,
  fetchInvestmentsOnMap,
  InventoryCategory,
} from "@/shared/api/investments";
import Link from "next/link";
import { toast } from "sonner";
import {
  getEffectiveMapboxToken,
  getMapStyle,
  setupMapboxFallback,
} from "@/shared/lib/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const CATEGORY_ICONS: Record<string, string> = {
  furniture_seating: "chair",
  tables_staging: "table_restaurant",
  audio_visual: "speaker",
  lighting_rigging: "light",
  power_climate: "bolt",
  decor_props: "celebration",
  other: "inventory_2",
};

interface PartnerInventoryMapProps {
  className?: string;
  selectedCategory?: InventoryCategory;
  onSelectInvestment?: (inv: PartnerInvestment) => void;
  // Small inline embeds (e.g. the Republic sidebar card) sit inside a page
  // that keeps scrolling past the map, so a click-and-drag gesture aimed at
  // the page needs to fall through instead of panning the map — set this to
  // false there. The dedicated /republic/investments map page is the map,
  // so it keeps free dragging (the default).
  dragPan?: boolean;
}

export default function PartnerInventoryMap({
  className = "h-[550px] w-full rounded-3xl overflow-hidden",
  selectedCategory,
  onSelectInvestment,
  dragPan = true,
}: PartnerInventoryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const { coords, country, countryCode, city, locateMe } = useUserLocation();
  const [investments, setInvestments] = useState<PartnerInvestment[]>([]);
  const [selectedPin, setSelectedPin] = useState<PartnerInvestment | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState<string>(
    selectedCategory || "all",
  );
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollCatLeft, setCanScrollCatLeft] = useState(false);
  const [canScrollCatRight, setCanScrollCatRight] = useState(false);
  // Captured once for the map's initial center — later `coords` updates
  // (geolocation resolving, "Fly to My Location") are applied via setCenter
  // in the effect below instead of tearing down and recreating the map.
  const initialCoordsRef = useRef(coords);
  const dragPanRef = useRef(dragPan);

  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const updateCategoryScrollState = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setCanScrollCatLeft(el.scrollLeft > 4);
    setCanScrollCatRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    updateCategoryScrollState();
    el.addEventListener("scroll", updateCategoryScrollState, {
      passive: true,
    });
    const resizeObserver = new ResizeObserver(updateCategoryScrollState);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener("scroll", updateCategoryScrollState);
      resizeObserver.disconnect();
    };
  }, [updateCategoryScrollState]);

  // Drag-to-scroll for the category row: overflow-x-auto already scrolls
  // via touch/trackpad, but a mouse click-drag does nothing on a plain
  // scroll container, so it just looks stuck past the card edge. This
  // makes a mouse drag pan it directly, like a native slider/carousel.
  //
  // Deliberately NOT using setPointerCapture here: capturing the pointer
  // on the row re-targets the *click* event to the row itself instead of
  // whatever pill is under the cursor, so pill buttons stop receiving
  // clicks entirely (confirmed while testing this - even a plain, no-drag
  // click stopped selecting a category). Plain window-level mousemove/
  // mouseup listeners get the same drag tracking without stealing clicks.
  const dragStateRef = useRef<{ startX: number; startScrollLeft: number } | null>(
    null,
  );
  const didDragRef = useRef(false);
  const [isDraggingCategories, setIsDraggingCategories] = useState(false);

  const handleCategoryMouseDown = (e: React.MouseEvent) => {
    const el = categoryScrollRef.current;
    if (!el) return;
    dragStateRef.current = { startX: e.clientX, startScrollLeft: el.scrollLeft };
    didDragRef.current = false;
    setIsDraggingCategories(true);
  };

  useEffect(() => {
    if (!isDraggingCategories) return;

    const handleMove = (e: MouseEvent) => {
      const el = categoryScrollRef.current;
      const drag = dragStateRef.current;
      if (!el || !drag) return;
      const delta = e.clientX - drag.startX;
      if (Math.abs(delta) > 4) didDragRef.current = true;
      el.scrollLeft = drag.startScrollLeft - delta;
    };

    const handleUp = () => {
      dragStateRef.current = null;
      setIsDraggingCategories(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDraggingCategories]);

  // Dragging past the pill-click threshold shouldn't also select that
  // category - swallow the click that follows the drag once.
  const handleCategoryClickCapture = (e: React.MouseEvent) => {
    if (didDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
      didDragRef.current = false;
    }
  };

  // Fetch map pins
  useEffect(() => {
    let alive = true;
    setLoading(true);

    fetchInvestmentsOnMap({
      type: "physical_inventory",
      category:
        activeCategory !== "all"
          ? (activeCategory as InventoryCategory)
          : undefined,
    })
      .then((data) => {
        if (alive) {
          setInvestments(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load map pins:", err);
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [activeCategory]);

  const activeCategoryRef = useRef(activeCategory);
  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  const investmentsRef = useRef(investments);
  investmentsRef.current = investments;

  // Update pins when data changes
  const renderPins = useCallback(
    (mapboxgl: any, map: any, items: PartnerInvestment[]) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      items.forEach((item) => {
        if (item.lat == null || item.lng == null) return;

        const iconName = item.inventoryCategory
          ? CATEGORY_ICONS[item.inventoryCategory] || "inventory_2"
          : "inventory_2";

        const pin = document.createElement("div");
        pin.className = "group relative cursor-pointer";
        pin.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center justify-center text-black font-bold transition-transform group-hover:scale-110">
              <span class="material-symbols-outlined text-[20px]">${iconName}</span>
            </div>
            ${
              item.quantityAvailable
                ? `<span class="absolute -bottom-2 bg-zinc-950 border border-amber-400 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow">${item.quantityAvailable}x</span>`
                : ""
            }
          </div>
        `;

        pin.addEventListener("click", () => {
          setSelectedPin(item);
          if (onSelectInvestment) onSelectInvestment(item);
          map.flyTo({
            center: [item.lng, item.lat],
            zoom: 14,
            essential: true,
          });
        });

        const marker = new mapboxgl.Marker({ element: pin, anchor: "center" })
          .setLngLat([item.lng, item.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    },
    [onSelectInvestment],
  );

  const renderPinsRef = useRef(renderPins);
  renderPinsRef.current = renderPins;

  // Mount Mapbox
  useEffect(() => {
    if (!containerRef.current) return;
    let alive = true;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (!alive || !containerRef.current) return;

      mapboxgl.accessToken = getEffectiveMapboxToken();
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: getMapStyle() as any,
        center: initialCoordsRef.current,
        zoom: 11,
        attributionControl: false,
        // Only the passthrough (dragPan: false) embed needs cooperative
        // gestures: it sits in a normally-scrolling page, and without this
        // Mapbox's default scroll-to-zoom would hijack the mouse wheel the
        // moment the cursor is over the map, and single-finger touch drag
        // would pan the map instead of scrolling the page. It requires
        // Ctrl/Cmd+scroll to zoom and two fingers to pan on touch, letting
        // a plain wheel scroll / single-finger drag fall through to the
        // page instead. Once dragPan is enabled the map is meant to be
        // freely interactive (the dedicated map page, or a card the user
        // deliberately opened), so a normal one-finger drag should just pan
        // it rather than showing a "use two fingers" hint.
        cooperativeGestures: !dragPanRef.current,
        // A click-and-drag over the map is otherwise consumed to pan it —
        // fine for the dedicated map page, but for a small card embedded in
        // a scrolling page (see `dragPan` prop) that gesture is usually the
        // user trying to scroll the page, and the map should let it through.
        dragPan: dragPanRef.current,
      });
      mapRef.current = map;
      setMapReady(true);
      setupMapboxFallback(map);

      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right",
      );
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
        showUserLocation: true,
      });
      map.addControl(geolocate, "top-right");

      const onMapReady = () => {
        if (!alive) return;
        renderPinsRef.current(mapboxgl, map, investmentsRef.current);
      };

      if (map.isStyleLoaded()) {
        onMapReady();
      } else {
        map.on("load", onMapReady);
        map.on("style.load", onMapReady);
      }

      const fetchForViewport = () => {
        try {
          const b = map.getBounds();
          if (!b) return;
          fetchInvestmentsOnMap({
            type: "physical_inventory",
            category:
              activeCategoryRef.current !== "all"
                ? (activeCategoryRef.current as InventoryCategory)
                : undefined,
            minLat: b.getSouth(),
            maxLat: b.getNorth(),
            minLng: b.getWest(),
            maxLng: b.getEast(),
          })
            .then((data) => {
              if (alive) {
                setInvestments(data);
              }
            })
            .catch((err) => {
              console.warn("Could not query viewport investments:", err);
            });
        } catch (e) {
          console.warn("getBounds error:", e);
        }
      };

      map.on("moveend", fetchForViewport);
      map.on("load", fetchForViewport);
      if (map.isStyleLoaded()) {
        fetchForViewport();
      }

      map.on("error", (e: any) => {
        console.warn("Mapbox territory warning:", e?.error?.message);
      });

      const resizeObserver = new ResizeObserver(() => {
        if (map && alive) {
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

    return () => {
      alive = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, []);

  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    if (!hasCenteredRef.current) {
      hasCenteredRef.current = true;
      return;
    }
    mapRef.current.flyTo({ center: coords, zoom: 12, essential: true });
  }, [coords, mapReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    import("mapbox-gl").then(({ default: mapboxgl }) => {
      renderPins(mapboxgl, mapRef.current, investments);
    });
  }, [investments, renderPins]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-3xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl text-xs">
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
          )}
          <span className="text-zinc-400">Inventory Map Territory:</span>
          <span className="font-extrabold text-white uppercase tracking-wider">
            {country} ({countryCode})
          </span>
          {city && <span className="text-zinc-400">• {city}</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              locateMe();
              if (mapRef.current) {
                mapRef.current.flyTo({
                  center: coords,
                  zoom: 12,
                  essential: true,
                });
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold transition-colors cursor-pointer border border-zinc-800"
          >
            <span className="material-symbols-outlined text-[14px] text-amber-400">
              my_location
            </span>
            Fly to My Location
          </button>
        </div>
      </div>

      {/* Category Pills — overflow-x-auto with the app's globally-hidden
          scrollbar gives no visual hint that it scrolls, so a mouse user
          just sees it cut off at the card edge. Edge fades hint there's
          more, and the row itself is drag-to-scroll (mouse click-drag pans
          it, like touch already does natively) so it reads as a slider. */}
      <div className="relative">
        {canScrollCatLeft && (
          <div className="absolute left-0 top-0 bottom-1 w-8 bg-linear-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
        )}
        {canScrollCatRight && (
          <div className="absolute right-0 top-0 bottom-1 w-8 bg-linear-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
        )}
        <div
          ref={categoryScrollRef}
          onMouseDown={handleCategoryMouseDown}
          onClickCapture={handleCategoryClickCapture}
          className={`flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold select-none ${
            isDraggingCategories ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
        {[
          { id: "all", label: "All Equipment Supplies", icon: "widgets" },
          { id: "furniture_seating", label: "Chairs & Seating", icon: "chair" },
          {
            id: "tables_staging",
            label: "Tables & Staging",
            icon: "table_restaurant",
          },
          { id: "audio_visual", label: "Audio & AV", icon: "speaker" },
          { id: "lighting_rigging", label: "Lighting", icon: "light" },
          { id: "power_climate", label: "Power & Gen", icon: "bolt" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all border ${
              activeCategory === cat.id
                ? "bg-amber-400 text-black border-amber-300 shadow-md"
                : "bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {cat.icon}
            </span>
            <span>{cat.label}</span>
          </button>
        ))}

        {/* Coming Soon Modality: Financial Capital */}
        <button
          type="button"
          onClick={() => {
            toast.info(
              "Financial Capital & Venue Equity investments are coming soon! Physical equipment & inventory hubs are currently live on the map.",
              { duration: 4000 },
            );
          }}
          className="px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all border bg-zinc-950/40 border-amber-500/20 text-zinc-500 hover:text-amber-300 hover:border-amber-500/40 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">
            payments
          </span>
          <span>Financial Capital</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Coming Soon
          </span>
        </button>
        </div>
      </div>

      {/* Mapbox Canvas */}
      <div
        className={`relative border border-zinc-800 shadow-2xl bg-zinc-950 ${className}`}
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* Selected Hub Details Card (Bottom Overlay) */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-30 rounded-3xl bg-zinc-950/95 border border-amber-500/40 p-5 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  {selectedPin.inventoryCategory?.replace(/_/g, " ") ??
                    "Inventory Hub"}
                </span>
                <span className="text-[11px] font-bold text-lime-400">
                  {selectedPin.quantityAvailable} units ready
                </span>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>

            <h3 className="text-base font-black text-white leading-snug">
              {selectedPin.title}
            </h3>

            <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
              {selectedPin.description}
            </p>

            <div className="mt-3 pt-3 border-t border-zinc-900 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
              <div>
                <span className="text-zinc-500 block">Depot Location:</span>
                <span className="text-white font-medium truncate block">
                  {selectedPin.city ||
                    selectedPin.country ||
                    "Republic Warehouse"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Terms:</span>
                <span className="text-amber-300 font-medium truncate block">
                  {selectedPin.usageTerms || "Free for partner venues"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {selectedPin.partner && (
                <Link
                  href={`/messages?userId=${selectedPin.partner.id}&contextType=investment&contextId=${selectedPin.id}&contextLabel=${encodeURIComponent(selectedPin.title)}`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    chat
                  </span>
                  <span>Request Tool Dispatch</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
