/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { config } from "@/shared/lib/config";
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
}

export default function PartnerInventoryMap({
  className = "h-[550px] w-full rounded-3xl overflow-hidden",
  selectedCategory,
  onSelectInvestment,
}: PartnerInventoryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const { coords, country, countryCode, city, locateMe } = useUserLocation();
  const [investments, setInvestments] = useState<PartnerInvestment[]>([]);
  const [selectedPin, setSelectedPin] = useState<PartnerInvestment | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  // Captured once for the map's initial center — later `coords` updates
  // (geolocation resolving, "Fly to My Location") are applied via setCenter
  // in the effect below instead of tearing down and recreating the map.
  const initialCoordsRef = useRef(coords);

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
        renderPins(mapboxgl, map, investments);
      };

      if (map.isStyleLoaded()) {
        onMapReady();
      } else {
        map.on("load", onMapReady);
        map.on("style.load", onMapReady);
      }

      // Fetch only what's on the screen
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
              if (alive) setInvestments(data);
            })
            .catch(() => {});
        } catch {
          // ignore if map canvas not ready
        }
      };

      map.on("moveend", fetchForViewport);
      map.on("load", fetchForViewport);
      if (map.isStyleLoaded()) {
        fetchForViewport();
      }

      // Auto container resize observation
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
    // Mount once — later coords changes recenter the existing map instead
    // of tearing it down (see the effect below).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter the existing map (without remounting) whenever coords change
  // *after* the initial mount — e.g. geolocation resolving a moment later,
  // or "Fly to My Location". Skips the transition where mapReady first
  // becomes true, since the map was just created centered on those coords.
  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    if (!hasCenteredRef.current) {
      hasCenteredRef.current = true;
      return;
    }
    mapRef.current.flyTo({ center: coords, zoom: 12, essential: true });
  }, [coords, mapReady]);

  // Update pins when data changes
  const renderPins = (mapboxgl: any, map: any, items: PartnerInvestment[]) => {
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
        map.flyTo({ center: [item.lng, item.lat], zoom: 14, essential: true });
      });

      const marker = new mapboxgl.Marker({ element: pin, anchor: "center" })
        .setLngLat([item.lng, item.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (!mapRef.current) return;
    import("mapbox-gl").then(({ default: mapboxgl }) => {
      renderPins(mapboxgl, mapRef.current, investments);
    });
  }, [investments]);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar & Country Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-3xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
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

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
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
