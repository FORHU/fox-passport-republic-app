/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { config } from "@/shared/lib/config";
import {
  getEffectiveMapboxToken,
  getMapStyle,
  setupMapboxFallback,
} from "@/shared/lib/mapbox";
import { useUserLocation } from "@/shared/hooks/useUserLocation";
import "mapbox-gl/dist/mapbox-gl.css";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
  deliveryRadiusKm: number;
}

interface InvestmentLocationPickerProps {
  value: LocationData;
  onChange: (val: LocationData) => void;
  isPhysical: boolean;
}

export default function InvestmentLocationPicker({
  value,
  onChange,
  isPhysical,
}: InvestmentLocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const radiusSourceRef = useRef<any>(null);

  const { coords: detectedCoords, country: detectedCountry, countryCode, city: detectedCity, isDetected, locateMe } =
    useUserLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync initial detected position if current value is default/empty
  useEffect(() => {
    if (isDetected && value.lat === 14.5995 && value.lng === 120.9842) {
      onChange({
        ...value,
        lat: detectedCoords[1],
        lng: detectedCoords[0],
        city: detectedCity || value.city,
        country: detectedCountry || value.country,
      });
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: detectedCoords,
          zoom: 12,
          essential: true,
        });
        if (markerRef.current) {
          markerRef.current.setLngLat(detectedCoords);
        }
      }
    }
  }, [isDetected, detectedCoords, detectedCountry, detectedCity]);

  // Reverse geocode a dragged pin coordinate
  const reverseGeocodePin = useCallback(
    async (lng: number, lat: number) => {
      if (!config.mapboxToken) return;
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${config.mapboxToken}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        let streetAddress = "";
        let city = "";
        let state = "";
        let country = "";

        if (data.features && data.features.length > 0) {
          streetAddress = data.features[0].place_name;
          for (const feat of data.features) {
            if (feat.place_type.includes("country")) {
              country = feat.text;
            } else if (feat.place_type.includes("region")) {
              state = feat.text;
            } else if (feat.place_type.includes("place")) {
              city = feat.text;
            }
          }
        }

        onChange({
          ...value,
          lat,
          lng,
          address: streetAddress || value.address,
          city: city || value.city,
          state: state || value.state,
          country: country || value.country,
        });
      } catch (err) {
        console.error("Failed to reverse geocode pin:", err);
      }
    },
    [value, onChange],
  );

  // Address search with country scoping
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query || query.length < 3 || !config.mapboxToken) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const countryFilter = countryCode ? `&country=${countryCode.toLowerCase()}` : "";
      const proximity =
        value.lng != null && value.lat != null
          ? `&proximity=${value.lng},${value.lat}`
          : "";
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query,
      )}.json?access_token=${config.mapboxToken}${countryFilter}${proximity}&limit=5`;

      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (feature: any) => {
    const [lng, lat] = feature.center;
    setSearchQuery(feature.place_name);
    setSuggestions([]);

    let city = "";
    let state = "";
    let country = "";
    if (feature.context) {
      for (const ctx of feature.context) {
        if (ctx.id.startsWith("country")) country = ctx.text;
        if (ctx.id.startsWith("region")) state = ctx.text;
        if (ctx.id.startsWith("place")) city = ctx.text;
      }
    }

    onChange({
      ...value,
      lat,
      lng,
      address: feature.place_name,
      city: city || value.city,
      state: state || value.state,
      country: country || value.country,
    });

    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14, essential: true });
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      }
    }
  };

  // Mount Mapbox Map
  useEffect(() => {
    if (!containerRef.current) return;
    let alive = true;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (!alive || !containerRef.current) return;

      mapboxgl.accessToken = getEffectiveMapboxToken();

      const initialCenter: [number, number] =
        value.lng != null && value.lat != null
          ? [value.lng, value.lat]
          : detectedCoords;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: getMapStyle() as any,
        center: initialCenter,
        zoom: 12,
        attributionControl: false,
      });
      mapRef.current = map;
      setupMapboxFallback(map);

      // Add navigation and geolocate controls
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
        showUserLocation: true,
      });
      map.addControl(geolocate, "top-right");

      // Custom draggable gold pin for partner depot
      const pinEl = document.createElement("div");
      pinEl.className =
        "w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center justify-center text-black cursor-grab active:cursor-grabbing";
      pinEl.innerHTML = `<span class="material-symbols-outlined text-[18px]">inventory_2</span>`;

      const marker = new mapboxgl.Marker({
        element: pinEl,
        draggable: true,
        anchor: "center",
      })
        .setLngLat(initialCenter)
        .addTo(map);

      markerRef.current = marker;

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        reverseGeocodePin(lngLat.lng, lngLat.lat);
      });

      map.on("click", (e) => {
        marker.setLngLat(e.lngLat);
        reverseGeocodePin(e.lngLat.lng, e.lngLat.lat);
      });
    });

    return () => {
      alive = false;
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Detected Country Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-zinc-400">Detected Territory:</span>
          <span className="font-bold text-white uppercase tracking-wider">
            {detectedCountry} ({countryCode})
          </span>
          {detectedCity && (
            <span className="text-zinc-400 font-medium">• {detectedCity}</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            locateMe();
            if (mapRef.current) {
              mapRef.current.flyTo({ center: detectedCoords, zoom: 13, essential: true });
              if (markerRef.current) markerRef.current.setLngLat(detectedCoords);
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">my_location</span>
          Center on Me
        </button>
      </div>

      {/* Address Search Bar Scoped to Country */}
      <div className="relative">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-zinc-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={`Search address or depot area in ${detectedCountry}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {isSearching && (
            <div className="absolute right-3.5 w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            {suggestions.map((feat) => (
              <button
                key={feat.id}
                type="button"
                onClick={() => handleSelectSuggestion(feat)}
                className="w-full text-left px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 border-b border-zinc-800/50 last:border-none transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-400">
                  location_on
                </span>
                <span className="truncate">{feat.place_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mapbox Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-xl h-72 w-full bg-zinc-950">
        <div ref={containerRef} className="w-full h-full" />

        {/* Overlay Instructions Badge */}
        <div className="absolute bottom-3 left-3 bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 px-3 py-1.5 rounded-xl text-[11px] text-zinc-300 flex items-center gap-1.5 pointer-events-none shadow-md">
          <span className="material-symbols-outlined text-[14px] text-amber-400">
            touch_app
          </span>
          Drag the gold pin to your exact warehouse/depot location
        </div>
      </div>

      {/* Resolved Location Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-zinc-400 font-semibold mb-1 block">
            Street Address / Depot Name
          </label>
          <input
            type="text"
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder="e.g. Unit 4B, Logistics Park"
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="text-zinc-400 font-semibold mb-1 block">City / Municipality</label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="e.g. Makati"
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="text-zinc-400 font-semibold mb-1 block">Country</label>
          <input
            type="text"
            value={value.country}
            onChange={(e) => onChange({ ...value, country: e.target.value })}
            placeholder="e.g. Philippines"
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Delivery Coverage Radius Slider (for Physical Inventory) */}
      {isPhysical && (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-400">
                radar
              </span>
              Dispatch & Delivery Coverage Radius
            </span>
            <span className="font-bold text-amber-400">
              {value.deliveryRadiusKm} km coverage
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={value.deliveryRadiusKm}
            onChange={(e) =>
              onChange({ ...value, deliveryRadiusKm: Number(e.target.value) })
            }
            className="w-full accent-amber-400 cursor-pointer"
          />
          <p className="text-[11px] text-zinc-500">
            Partner venues and event organizers located within {value.deliveryRadiusKm} km of this warehouse will see these supplies as available for dispatch.
          </p>
        </div>
      )}
    </div>
  );
}
