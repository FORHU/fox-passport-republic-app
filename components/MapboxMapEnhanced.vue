<template>
  <div class="mapbox-venue-container">
    <!-- Map Container -->
    <div ref="mapContainer" class="map-wrapper"></div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="map-loading">
      <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
      <span class="ml-3">Loading map...</span>
    </div>

    <!-- Error Overlay -->
    <div v-if="error && !loading" class="map-error">
      <v-icon color="error" size="24">mdi-alert-circle</v-icon>
      <span class="ml-2">{{ error }}</span>
      <v-btn size="small" color="primary" class="ml-3" @click="retryLoad">Retry</v-btn>
    </div>

    <!-- Venue Detail Card -->
    <v-card
      v-if="selectedVenue"
      class="venue-detail-card"
      :class="{ 'mobile-card': isMobile }"
      elevation="8"
    >
      <div class="venue-card-header">
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          class="close-btn"
          @click="closeVenueDetail"
        ></v-btn>
      </div>

      <v-img
        :src="selectedVenue.image || 'https://via.placeholder.com/400x180?text=Venue'"
        height="160"
        cover
      />

      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between mb-2">
          <h3 class="text-subtitle-1 font-weight-bold text-truncate" style="max-width: 65%">
            {{ selectedVenue.name }}
          </h3>
          <div class="d-flex align-center" v-if="selectedVenue.rating">
            <v-icon color="amber" size="16">mdi-star</v-icon>
            <span class="ml-1 text-body-2">{{ selectedVenue.rating }}</span>
          </div>
        </div>

        <v-chip v-if="selectedVenue.type" size="x-small" color="primary" variant="tonal" class="mb-2">
          {{ selectedVenue.type }}
        </v-chip>

        <div class="d-flex align-start mb-1 text-caption text-grey-darken-1">
          <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
          <span>{{ selectedVenue.address }}</span>
        </div>

        <div class="d-flex align-center mb-1 text-caption" v-if="selectedVenue.capacity">
          <v-icon size="14" class="mr-1">mdi-account-group</v-icon>
          <span>Up to {{ selectedVenue.capacity }} guests</span>
        </div>

        <div class="d-flex align-center mb-3" v-if="selectedVenue.price">
          <v-icon size="14" class="mr-1" color="success">mdi-cash</v-icon>
          <span class="font-weight-bold text-success text-body-2">{{ formatPrice(selectedVenue.price) }}</span>
          <span class="text-grey text-caption ml-1">/ hour</span>
        </div>

        <v-btn color="primary" variant="flat" block size="small" class="mb-2" @click="handleViewDetails">
          View Details
        </v-btn>
        <v-btn color="grey" variant="outlined" block size="small" @click="getDirectionsToVenue">
          <v-icon start size="16">mdi-directions</v-icon>
          Get Directions
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Map Legend -->
    <div class="map-legend" v-if="showLegend && !loading && venues.length > 0">
      <div class="legend-item">
        <span class="legend-marker" style="background: #7c3aed"></span>
        <span>Venues ({{ venues.length }})</span>
      </div>
    </div>

    <!-- Map Controls -->
    <div class="map-controls" v-if="mapInitialized">
      <v-btn
        :color="is3D ? 'primary' : 'white'"
        icon
        size="x-small"
        elevation="2"
        class="mb-1"
        @click="toggle3D"
        title="Toggle 3D"
      >
        <v-icon size="18">mdi-cube-outline</v-icon>
      </v-btn>

      <v-menu location="left">
        <template v-slot:activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" color="white" icon size="x-small" elevation="2" class="mb-1">
            <v-icon size="18">mdi-layers</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" nav>
          <v-list-item
            v-for="style in mapStyles"
            :key="style.id"
            :active="currentStyle === style.id"
            @click="changeMapStyle(style)"
          >
            <v-list-item-title class="text-caption">{{ style.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn color="white" icon size="x-small" elevation="2" @click="resetView" title="Reset View">
        <v-icon size="18">mdi-compass</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useDisplay } from "vuetify";

interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  price?: number;
  capacity?: number;
  type?: string;
  amenities?: string[];
  description?: string;
}

interface Props {
  location?: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: string;
  venues?: Venue[];
  showMarker?: boolean;
  markerColor?: string;
  showLegend?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  location: "",
  latitude: 14.5995,
  longitude: 120.9842,
  zoom: 15,
  height: "600px",
  venues: () => [],
  showMarker: true,
  markerColor: "#2193b0",
  showLegend: true,
});

const emit = defineEmits<{
  (e: "locationFound", data: { lat: number; lng: number; placeName: string }): void;
  (e: "venueSelected", venue: Venue): void;
  (e: "venueDetailsClick", venue: Venue): void;
  (e: "error", message: string): void;
}>();

const { mobile: isMobile } = useDisplay();
const config = useRuntimeConfig();

// Simpler map styles for better performance
const mapStyles = [
  { id: "streets", name: "Streets", style: "mapbox://styles/mapbox/streets-v12" },
  { id: "satellite", name: "Satellite", style: "mapbox://styles/mapbox/satellite-streets-v12" },
  { id: "light", name: "Light", style: "mapbox://styles/mapbox/light-v11" },
  { id: "dark", name: "Dark", style: "mapbox://styles/mapbox/dark-v11" },
];

// Refs
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<mapboxgl.Map | null>(null);
const locationMarker = ref<mapboxgl.Marker | null>(null);
const venueMarkers = ref<mapboxgl.Marker[]>([]);

// State
const loading = ref(true);
const error = ref("");
const selectedVenue = ref<Venue | null>(null);
const mapInitialized = ref(false);
const lastSearchedLocation = ref("");
const is3D = ref(true);
const currentStyle = ref("streets");

// Geocode location
const geocodeLocation = async (locationName: string) => {
  if (!locationName) return null;

  const token = config.public.MAPBOX_TOKEN;
  if (!token) return null;

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName + ", Philippines")}.json?access_token=${token}&limit=1`
    );
    const data = await response.json();

    if (data.features?.[0]) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng, placeName: data.features[0].place_name };
    }
    return null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
};

// Create simple venue marker - OPTIMIZED for performance
const createVenueMarkerElement = (venue: Venue, index: number) => {
  const el = document.createElement("div");
  el.className = "venue-marker";
  el.setAttribute("data-index", String(index));
  
  const price = venue.price ? `₱${Math.round(venue.price / 1000)}k` : "";
  
  el.innerHTML = `
    <div class="marker-bubble">
      <span class="marker-price">${price}</span>
    </div>
    <div class="marker-pointer"></div>
  `;
  
  return el;
};

// Initialize map - OPTIMIZED: removed heavy terrain and fog
const initializeMap = async (lat: number, lng: number) => {
  await nextTick();
  
  if (!mapContainer.value) {
    error.value = "Map container not found";
    loading.value = false;
    return;
  }

  const token = config.public.MAPBOX_TOKEN;
  if (!token) {
    error.value = "Mapbox token not configured";
    loading.value = false;
    return;
  }

  try {
    mapboxgl.accessToken = token;

    map.value = new mapboxgl.Map({
      container: mapContainer.value,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: props.zoom,
      pitch: is3D.value ? 45 : 0,
      bearing: is3D.value ? -10 : 0,
      antialias: true,
      // Performance optimizations
      fadeDuration: 0,
      trackResize: true,
    });

    // Minimal controls
    map.value.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.value.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // Location marker
    if (props.showMarker) {
      locationMarker.value = new mapboxgl.Marker({ color: props.markerColor })
        .setLngLat([lng, lat])
        .addTo(map.value);
    }

    map.value.on("load", () => {
      console.log("✅ Map loaded");
      loading.value = false;
      mapInitialized.value = true;
      
      // Add 3D buildings layer - OPTIMIZED
      add3DBuildings();
      addVenueMarkers();
      
      emit("locationFound", { lat, lng, placeName: lastSearchedLocation.value });
    });

    map.value.on("error", () => {
      error.value = "Failed to load map";
      loading.value = false;
    });

    setTimeout(() => {
      if (loading.value) loading.value = false;
    }, 10000);

  } catch (err: any) {
    error.value = err.message || "Failed to initialize map";
    loading.value = false;
  }
};

// Add 3D buildings - OPTIMIZED: simpler configuration
const add3DBuildings = () => {
  if (!map.value || map.value.getLayer("3d-buildings")) return;

  const layers = map.value.getStyle().layers;
  let labelLayerId: string | undefined;
  
  for (const layer of layers || []) {
    if (layer.type === "symbol" && layer.layout?.["text-field"]) {
      labelLayerId = layer.id;
      break;
    }
  }

  map.value.addLayer({
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#ddd",
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "min_height"],
      "fill-extrusion-opacity": 0.7
    }
  }, labelLayerId);
};

// Remove 3D buildings
const remove3DBuildings = () => {
  if (map.value?.getLayer("3d-buildings")) {
    map.value.removeLayer("3d-buildings");
  }
};

// Add venue markers - OPTIMIZED: using simple DOM markers
const addVenueMarkers = () => {
  if (!map.value) return;

  // Clear existing markers
  venueMarkers.value.forEach(m => m.remove());
  venueMarkers.value = [];

  props.venues.forEach((venue, index) => {
    if (!venue.latitude || !venue.longitude) return;

    const el = createVenueMarkerElement(venue, index);
    
    const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([venue.longitude, venue.latitude])
      .addTo(map.value!);

    // Simple click handler
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      selectVenue(venue);
    });

    venueMarkers.value.push(marker);
  });

  if (props.venues.length > 0) {
    fitBoundsToVenues();
  }
};

// Fit bounds
const fitBoundsToVenues = () => {
  if (!map.value || props.venues.length === 0) return;

  const bounds = new mapboxgl.LngLatBounds();

  if (locationMarker.value) {
    bounds.extend(locationMarker.value.getLngLat());
  }

  props.venues.forEach(v => {
    if (v.latitude && v.longitude) {
      bounds.extend([v.longitude, v.latitude]);
    }
  });

  map.value.fitBounds(bounds, {
    padding: { top: 80, bottom: 80, left: 50, right: isMobile.value ? 50 : 360 },
    maxZoom: 16,
    duration: 1000
  });
};

// Toggle 3D
const toggle3D = () => {
  if (!map.value) return;
  is3D.value = !is3D.value;

  map.value.easeTo({
    pitch: is3D.value ? 45 : 0,
    bearing: is3D.value ? -10 : 0,
    duration: 800
  });

  if (is3D.value) {
    add3DBuildings();
  } else {
    remove3DBuildings();
  }
};

// Reset view
const resetView = () => {
  if (!map.value) return;
  map.value.easeTo({ pitch: is3D.value ? 45 : 0, bearing: 0, duration: 800 });
  if (props.venues.length > 0) fitBoundsToVenues();
};

// Change map style
const changeMapStyle = (styleOption: { id: string; style: string }) => {
  if (!map.value) return;
  currentStyle.value = styleOption.id;
  
  const center = map.value.getCenter();
  const zoom = map.value.getZoom();
  const pitch = map.value.getPitch();
  const bearing = map.value.getBearing();
  
  map.value.setStyle(styleOption.style);

  map.value.once("style.load", () => {
    map.value?.jumpTo({ center, zoom, pitch, bearing });
    if (is3D.value) add3DBuildings();
    setTimeout(() => addVenueMarkers(), 100);
  });
};

// Select venue
const selectVenue = (venue: Venue) => {
  selectedVenue.value = venue;
  emit("venueSelected", venue);

  map.value?.flyTo({
    center: [venue.longitude, venue.latitude],
    zoom: 17,
    pitch: is3D.value ? 55 : 0,
    duration: 1500
  });
};

// Close venue detail
const closeVenueDetail = () => {
  selectedVenue.value = null;
  if (props.venues.length > 0) fitBoundsToVenues();
};

// Handle View Details click
const handleViewDetails = () => {
  if (selectedVenue.value) {
    const venue = { ...selectedVenue.value };
    selectedVenue.value = null;
    emit("venueDetailsClick", venue);
  }
};

// Get directions
const getDirectionsToVenue = () => {
  if (selectedVenue.value) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${selectedVenue.value.latitude},${selectedVenue.value.longitude}`,
      "_blank"
    );
  }
};

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(price);
};

// Update position
const updateMapPosition = (lat: number, lng: number) => {
  if (map.value) {
    map.value.flyTo({ center: [lng, lat], zoom: props.zoom, duration: 1500 });
    locationMarker.value?.setLngLat([lng, lat]);
  }
};

// Retry
const retryLoad = async () => {
  error.value = "";
  loading.value = true;
  if (props.location) await searchLocation(props.location);
};

// Search location
const searchLocation = async (locationName: string) => {
  if (!locationName) return;

  loading.value = true;
  error.value = "";
  lastSearchedLocation.value = locationName;

  const result = await geocodeLocation(locationName);

  if (result) {
    if (map.value && mapInitialized.value) {
      updateMapPosition(result.lat, result.lng);
      loading.value = false;
      emit("locationFound", result);
    } else {
      await initializeMap(result.lat, result.lng);
    }
  } else {
    error.value = `Location not found`;
    loading.value = false;
  }
};

// Watch location
let hasInit = false;
watch(() => props.location, async (loc) => {
  if (!loc) return;
  if (!hasInit || loc !== lastSearchedLocation.value) {
    hasInit = true;
    await searchLocation(loc);
  }
}, { immediate: true });

// Watch venues
watch(() => props.venues.length, (n, o) => {
  if (n !== o && mapInitialized.value) {
    setTimeout(() => addVenueMarkers(), 50);
  }
});

// Cleanup
onUnmounted(() => {
  venueMarkers.value.forEach(m => m.remove());
  map.value?.remove();
  map.value = null;
});

defineExpose({ searchLocation, updateMapPosition, selectVenue, fitBoundsToVenues, toggle3D });
</script>

<style scoped>
.mapbox-venue-container {
  position: relative;
  width: 100%;
  height: v-bind(height);
  border-radius: 12px;
  overflow: hidden;
  background: #e5e5e5;
}

.map-wrapper {
  width: 100%;
  height: 100%;
}

.map-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 100;
}

.map-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  background: white;
  padding: 16px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.venue-detail-card {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 280px;
  max-height: calc(100% - 24px);
  overflow-y: auto;
  z-index: 20;
  border-radius: 14px !important;
}

.venue-detail-card.mobile-card {
  top: auto;
  bottom: 0;
  right: 0;
  left: 0;
  width: 100%;
  max-height: 50%;
  border-radius: 16px 16px 0 0 !important;
}

.venue-card-header {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 5;
}

.close-btn {
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
}

.map-legend {
  position: absolute;
  bottom: 28px;
  left: 12px;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  z-index: 5;
  font-size: 11px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

.map-controls {
  position: absolute;
  bottom: 100px;
  right: 10px;
  display: flex;
  flex-direction: column;
  z-index: 5;
}
</style>

<style>
/* Simple, performant venue markers */
.venue-marker {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.venue-marker:hover {
  transform: scale(1.1) translateY(-2px);
  z-index: 100 !important;
}

.marker-bubble {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4);
}

.marker-pointer {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #6d28d9;
  margin: -1px auto 0;
}

/* Compact popup styles */
.mapboxgl-popup-content {
  padding: 0 !important;
  border-radius: 10px !important;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
}

/* Performance: reduce control animations */
.mapboxgl-ctrl-group {
  border-radius: 8px !important;
  overflow: hidden;
}

.mapboxgl-ctrl-group button {
  width: 32px !important;
  height: 32px !important;
}
</style>