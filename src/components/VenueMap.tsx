"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // Hook for navigation
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Venue } from "@/src/types/venue";
import { config } from "@/src/config";
import { X, Star, MapPin, Users, Banknote, Navigation, ArrowRight } from "lucide-react";

interface Props {
  venues: Venue[];
  center: { lat: number; lng: number } | null;
  loading: boolean;
}

export default function VenueMap({ venues, center, loading }: Props) {
  // --- HOOKS ---
  const router = useRouter(); // The navigation hook
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  
  // State Hooks
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null); // For the sidebar
  const [hoveredVenue, setHoveredVenue] = useState<Venue | null>(null);   // For the hover popup
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // --- 1. Initialize Map Hook ---
  useEffect(() => {
    if (!mapContainer.current) return;
    
    if (!config.mapboxToken) {
      console.error("Mapbox token missing");
      return;
    }
    mapboxgl.accessToken = config.mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: center ? [center.lng, center.lat] : [120.9842, 14.5995], 
      zoom: 14,
      pitch: 45, 
      bearing: -10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      add3DBuildings();
    });

    // Clear hover state when map moves to prevent floating ghosts
    map.current.on("move", () => {
      setHoveredVenue(null);
    });

    return () => map.current?.remove();
  }, []);

  // --- Helper: 3D Buildings ---
  const add3DBuildings = () => {
    const m = map.current;
    if (!m || m.getLayer('3d-buildings')) return;
    
    const layers = m.getStyle().layers;
    let labelLayerId;
    for (const layer of layers || []) {
      if (layer.type === 'symbol' && layer.layout?.['text-field']) {
        labelLayerId = layer.id;
        break;
      }
    }
    m.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 14,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6
        }
      },
      labelLayerId
    );
  };

  // --- 2. Markers Logic Hook ---
  useEffect(() => {
    if (!map.current) return;
    
    // Cleanup old markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    venues.forEach((venue) => {
      // Create DOM element for the marker
      const el = document.createElement("div");
      el.className = "venue-marker group cursor-pointer transition-all duration-300";
      const priceK = venue.price ? Math.round(venue.price / 1000) : 0;

      // Violet Marker Styling
      el.innerHTML = `
        <div class="transform transition-transform duration-200 hover:scale-110">
          <div class="bg-violet-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1">
            <span>₱${priceK}k</span>
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-violet-600 mx-auto -mt-0.5"></div>
        </div>
      `;

      // --- EVENT LISTENERS (The Interactive Part) ---

      // CLICK: Select Venue
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedVenue(venue);
        setHoveredVenue(null); // Hide hover tooltip immediately
        
        map.current?.flyTo({
          center: [venue.longitude, venue.latitude],
          zoom: 16,
          pitch: 50,
          essential: true,
          offset: [0, 100] // Shift map so card doesn't cover marker
        });
      });

      // HOVER START: Show Preview
      el.addEventListener("mouseenter", () => {
        if (map.current) {
          // Calculate screen position for the tooltip
          const point = map.current.project([venue.longitude, venue.latitude]);
          setHoverPos({ x: point.x, y: point.y });
          setHoveredVenue(venue);
        }
      });

      // HOVER END: Hide Preview
      el.addEventListener("mouseleave", () => {
        setHoveredVenue(null);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([venue.longitude, venue.latitude])
        .addTo(map.current!);
        
      markers.current.push(marker);
    });

    // Fit bounds to venues
    if (venues.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      venues.forEach(v => bounds.extend([v.longitude, v.latitude]));
      map.current.fitBounds(bounds, { padding: 100, maxZoom: 16 });
    } else if (center) {
      map.current.flyTo({ center: [center.lng, center.lat], zoom: 14 });
    }
  }, [venues, center]);

  // --- NAVIGATION HANDLER ---
  const handleNavigateToVenue = (id: string) => {
    // This pushes the user to /venue/[id]
    router.push(`/venue/${id}`);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100 shadow-xl border border-gray-200">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <span className="text-purple-900 font-semibold">Finding best venues...</span>
        </div>
      )}

      {/* --- 1. HOVER PREVIEW (Floating Tooltip) --- */}
      {hoveredVenue && hoverPos && !selectedVenue && (
        <div 
          className="absolute z-50 pointer-events-none flex flex-col items-center animate-in zoom-in-95 duration-200"
          style={{ 
            left: hoverPos.x, 
            top: hoverPos.y - 50, // Position above the marker
            transform: 'translate(-50%, -100%)' 
          }}
        >
          <div className="bg-white p-2 rounded-xl shadow-2xl w-48 border border-gray-100">
            <div className="relative h-28 w-full rounded-lg overflow-hidden mb-2 bg-gray-100">
              <img 
                src={hoveredVenue.image} 
                alt={hoveredVenue.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="font-bold text-gray-900 text-sm truncate px-1">{hoveredVenue.name}</h4>
            <p className="text-xs text-gray-500 truncate px-1 mb-1">{hoveredVenue.type}</p>
          </div>
          {/* Triangle pointing down */}
          <div className="w-4 h-4 bg-white transform rotate-45 -mt-2 shadow-sm border-r border-b border-gray-100"></div>
        </div>
      )}

      {/* --- 2. CLICKED DETAIL CARD (Sidebar) --- */}
      {selectedVenue && (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-xl shadow-2xl z-40 overflow-hidden animate-in slide-in-from-right-10 duration-300 flex flex-col max-h-[calc(100%-2rem)]">
          
          <div className="relative h-48 shrink-0 bg-gray-200">
            <img src={selectedVenue.image} alt={selectedVenue.name} className="w-full h-full object-cover"/>
            <button 
              onClick={() => setSelectedVenue(null)} 
              className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition-colors backdrop-blur-sm"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-3 left-3 bg-white/90 px-2.5 py-1 rounded-md text-xs font-bold text-violet-700 shadow-sm">
              {selectedVenue.type || 'Venue'}
            </div>
          </div>

          <div className="p-5 overflow-y-auto">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-xl text-gray-900 leading-tight flex-1 mr-2">{selectedVenue.name}</h3>
              <div className="flex items-center text-amber-500 text-sm font-bold bg-amber-50 px-2 py-1 rounded-md">
                <Star size={14} className="mr-1 fill-current" />
                {selectedVenue.rating?.toFixed(1)}
              </div>
            </div>

            <div className="flex items-start text-gray-500 text-xs mb-4 leading-relaxed">
              <MapPin size={14} className="mr-2 mt-0.5 shrink-0" />
              <span>{selectedVenue.address}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <Users size={16} className="mr-2 text-violet-500" />
                {selectedVenue.capacity} guests
              </div>
              <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <Banknote size={16} className="mr-2 text-emerald-500" />
                ₱{(selectedVenue.price || 0).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              {/* Navigate Button */}
              <button 
                onClick={() => handleNavigateToVenue(selectedVenue.id)}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-violet-200 flex items-center justify-center gap-2"
              >
                View Full Details
                <ArrowRight size={16} />
              </button>
              
              <button className="w-full border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Navigation size={16} className="text-gray-400" />
                Get Directions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}