<template>
  <div class="mapbox-venue-container">
    <!-- Map Container -->
    <div ref="mapContainer" class="map-wrapper"></div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="map-loading">
      <v-progress-circular
        indeterminate
        color="primary"
        size="40"
      ></v-progress-circular>
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

      <!-- Venue Image -->
      <v-carousel
        v-if="selectedVenue.images && selectedVenue.images.length > 0"
        height="180"
        hide-delimiters
        show-arrows="hover"
      >
        <v-carousel-item
          v-for="(image, i) in selectedVenue.images"
          :key="i"
          :src="image"
          cover
        ></v-carousel-item>
      </v-carousel>
      <v-img
        v-else
        :src="selectedVenue.image || 'https://via.placeholder.com/400x180?text=Venue'"
        height="180"
        cover
      />

      <v-card-text class="pa-4">
        <!-- Venue Name & Rating -->
        <div class="d-flex align-center justify-space-between mb-2">
          <h3 class="text-h6 font-weight-bold text-truncate" style="max-width: 65%">
            {{ selectedVenue.name }}
          </h3>
          <div class="d-flex align-center" v-if="selectedVenue.rating">
            <v-icon color="amber" size="18">mdi-star</v-icon>
            <span class="ml-1 font-weight-medium">{{ selectedVenue.rating }}</span>
            <span class="text-grey ml-1 text-caption">({{ selectedVenue.reviewCount || 0 }})</span>
          </div>
        </div>

        <!-- Venue Type Badge -->
        <v-chip
          v-if="selectedVenue.type"
          size="small"
          color="primary"
          variant="tonal"
          class="mb-2"
        >
          {{ selectedVenue.type }}
        </v-chip>

        <!-- Address -->
        <div class="d-flex align-start mb-2 text-body-2 text-grey-darken-1">
          <v-icon size="16" class="mr-1 mt-1">mdi-map-marker</v-icon>
          <span>{{ selectedVenue.address }}</span>
        </div>

        <!-- Capacity -->
        <div class="d-flex align-center mb-2 text-body-2" v-if="selectedVenue.capacity">
          <v-icon size="16" class="mr-1">mdi-account-group</v-icon>
          <span>Up to {{ selectedVenue.capacity }} guests</span>
        </div>

        <!-- Price -->
        <div class="d-flex align-center mb-3" v-if="selectedVenue.price">
          <v-icon size="16" class="mr-1" color="success">mdi-cash</v-icon>
          <span class="font-weight-bold text-success">{{ formatPrice(selectedVenue.price) }}</span>
          <span class="text-grey ml-1">/ hour</span>
        </div>

        <!-- Amenities -->
        <div class="mb-3" v-if="selectedVenue.amenities && selectedVenue.amenities.length > 0">
          <p class="text-caption text-grey mb-1">Amenities</p>
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="amenity in selectedVenue.amenities.slice(0, 4)"
              :key="amenity"
              size="x-small"
              variant="outlined"
            >
              {{ amenity }}
            </v-chip>
            <v-chip
              v-if="selectedVenue.amenities.length > 4"
              size="x-small"
              variant="outlined"
            >
              +{{ selectedVenue.amenities.length - 4 }} more
            </v-chip>
          </div>
        </div>

        <!-- Action Buttons -->
        <v-btn
          color="primary"
          variant="flat"
          block
          class="mb-2"
          @click="handleViewDetails"
        >
          View Details
        </v-btn>

        <v-btn
          color="grey-darken-1"
          variant="outlined"
          block
          @click="getDirectionsToVenue"
        >
          <v-icon start>mdi-directions</v-icon>
          Get Directions
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Map Legend -->
    <div class="map-legend" v-if="showLegend && !loading && venues.length > 0">
      <div class="legend-item">
        <span class="legend-marker venue-marker-color"></span>
        <span>Venues</span>
      </div>
    </div>

    <!-- Map Controls -->
    <div class="map-controls" v-if="mapInitialized">
      <!-- Rotation Controls -->
      <v-tooltip text="Rotate Left" location="left">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            color="white"
            icon
            size="small"
            elevation="3"
            class="mb-2"
            @click="rotateLeft"
          >
            <v-icon>mdi-rotate-left</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Rotate Right" location="left">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            color="white"
            icon
            size="small"
            elevation="3"
            class="mb-2"
            @click="rotateRight"
          >
            <v-icon>mdi-rotate-right</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Pitch Controls -->
      <v-tooltip text="Tilt Up" location="left">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            color="white"
            icon
            size="small"
            elevation="3"
            class="mb-2"
            @click="tiltUp"
          >
            <v-icon>mdi-chevron-up</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Tilt Down" location="left">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            color="white"
            icon
            size="small"
            elevation="3"
            class="mb-2"
            @click="tiltDown"
          >
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-divider class="my-2"></v-divider>

      <!-- 3D Toggle -->
      <v-tooltip text="Toggle 3D View" location="left">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            :color="is3D ? 'primary' : 'white'"
            icon
            size="small"
            elevation="3"
            class="mb-2"
            @click="toggle3D"
          >
            <v-icon>{{ is3D ? 'mdi-video-3d' : 'mdi-video-3d-off' }}</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Map Style Toggle -->
      <v-menu location="left">
        <template v-slot:activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            color="white"
            icon
            size="small"
            elevation="3"
            class="mb-2"
          >
            <v-icon>mdi-layers</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" nav>
          <v-list-subheader>Map Style</v-list-subheader>
          <v-list-item
            v-for="style in mapStyles"
            :key="style.id"
            :active="currentStyle === style.id"
            @click="changeMapStyle(style)"
          >
            <template v-slot:prepend>
              <v-icon :icon="style.icon" size="small"></v-icon>
            </template>
            <v-list-item-title>{{ style.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Reset View -->
      <v-tooltip text="Reset View" location="left">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            color="white"
            icon
            size="small"
            elevation="3"
            @click="resetView"
          >
            <v-icon>mdi-compass</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useDisplay } from "vuetify";

// Types
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

// Map styles
const mapStyles = [
  { 
    id: "standard", 
    name: "Realistic 3D", 
    style: "mapbox://styles/mapbox/standard",
    icon: "mdi-city-variant"
  },
  { 
    id: "streets", 
    name: "Streets", 
    style: "mapbox://styles/mapbox/streets-v12",
    icon: "mdi-road-variant"
  },
  { 
    id: "satellite", 
    name: "Satellite", 
    style: "mapbox://styles/mapbox/satellite-streets-v12",
    icon: "mdi-satellite-variant"
  },
  { 
    id: "outdoors", 
    name: "Outdoors", 
    style: "mapbox://styles/mapbox/outdoors-v12",
    icon: "mdi-terrain"
  },
  { 
    id: "light", 
    name: "Light", 
    style: "mapbox://styles/mapbox/light-v11",
    icon: "mdi-white-balance-sunny"
  },
  { 
    id: "dark", 
    name: "Dark", 
    style: "mapbox://styles/mapbox/dark-v11",
    icon: "mdi-weather-night"
  },
];

// Refs
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<mapboxgl.Map | null>(null);
const locationMarker = ref<mapboxgl.Marker | null>(null);
const venueMarkers = ref<mapboxgl.Marker[]>([]);
const popups = ref<mapboxgl.Popup[]>([]);

// State
const loading = ref(true);
const error = ref("");
const selectedVenue = ref<Venue | null>(null);
const mapInitialized = ref(false);
const lastSearchedLocation = ref("");
const is3D = ref(true);
const currentStyle = ref("standard");

// Geocode location
const geocodeLocation = async (locationName: string) => {
  if (!locationName) return null;

  const token = config.public.MAPBOX_TOKEN;
  if (!token) {
    error.value = "Mapbox token not configured";
    return null;
  }

  try {
    const searchQuery = `${locationName}, Philippines`;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${token}&limit=1`
    );

    if (!response.ok) throw new Error("Geocoding request failed");

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng, placeName: data.features[0].place_name };
    }

    return null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
};

// Create custom venue marker with icon
const createVenueMarkerElement = (venue: Venue) => {
  const el = document.createElement("div");
  el.className = "venue-marker-3d";

  const priceText = venue.price ? `₱${(venue.price / 1000).toFixed(0)}k` : "";
  
  // Get icon based on venue type
  const iconSvg = getVenueIcon(venue.type || "");

  el.innerHTML = `
    <div class="marker-3d-container" data-venue-id="${venue.id}">
      <div class="marker-3d-bubble">
        <div class="marker-3d-icon">${iconSvg}</div>
        ${priceText ? `<span class="marker-3d-price">${priceText}</span>` : ''}
      </div>
      <div class="marker-3d-pointer"></div>
    </div>
  `;
  return el;
};

// Get venue icon based on type
const getVenueIcon = (type: string): string => {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('ballroom') || lowerType.includes('hall')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>`;
  }
  if (lowerType.includes('garden') || lowerType.includes('outdoor')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z"/></svg>`;
  }
  if (lowerType.includes('conference') || lowerType.includes('convention')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>`;
  }
  if (lowerType.includes('rooftop') || lowerType.includes('terrace')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm5 15h-2v-6H9v6H7v-7.81l5-4.5 5 4.5V18z"/></svg>`;
  }
  if (lowerType.includes('beach') || lowerType.includes('resort')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.127 14.56l1.43-1.43 6.44 6.443L19.57 21zm4.293-5.73l2.86-2.86c-3.95-3.95-10.35-3.96-14.3-.02 3.93-1.3 8.31-.25 11.44 2.88zM5.95 5.98c-3.94 3.95-3.93 10.35.02 14.3l2.86-2.86C5.7 14.29 4.65 9.91 5.95 5.98zm.02-.02l-.01.01c-.38 3.01 1.17 6.88 4.3 10.02l5.73-5.73c-3.13-3.13-7.01-4.68-10.02-4.3z"/></svg>`;
  }
  if (lowerType.includes('pavilion')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v1h20V7L12 2zm0 2.24L17.34 7H6.66L12 4.24zM5 10v10h2v-6h10v6h2V10H5zm8 10h-2v-4h2v4z"/></svg>`;
  }
  if (lowerType.includes('function') || lowerType.includes('event')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>`;
  }
  if (lowerType.includes('estate') || lowerType.includes('private')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`;
  }
  
  // Default venue icon
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
};

// Create popup content
const createPopupContent = (venue: Venue) => {
  const imageUrl = venue.image || venue.images?.[0] || "https://via.placeholder.com/280x140?text=Venue";

  return `
    <div class="venue-popup-3d">
      <div class="popup-3d-image">
        <img src="${imageUrl}" alt="${venue.name}" onerror="this.src='https://via.placeholder.com/280x140?text=Venue'" />
      </div>
      <div class="popup-3d-content">
        <h4 class="popup-3d-title">${venue.name}</h4>
        ${venue.rating ? `
          <div class="popup-3d-rating">
            <span>⭐ ${venue.rating}</span>
            <span class="popup-3d-reviews">(${venue.reviewCount || 0})</span>
          </div>
        ` : ""}
        ${venue.price ? `<div class="popup-3d-price">₱${venue.price.toLocaleString()}/hr</div>` : ""}
        <div class="popup-3d-type">${venue.type || 'Venue'}</div>
      </div>
    </div>
  `;
};

// Initialize map with realistic 3D style
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

    // Use the Standard style for realistic 3D buildings
    map.value = new mapboxgl.Map({
      container: mapContainer.value,
      style: "mapbox://styles/mapbox/standard", // Realistic 3D style
      center: [lng, lat],
      zoom: props.zoom,
      pitch: 60, // Tilt for 3D view
      bearing: -17, // Rotation angle
      antialias: true,
      interactive: true,
      dragRotate: true, // Enable rotation by dragging with right-click or ctrl+drag
      touchZoomRotate: true, // Enable rotation on touch devices
      pitchWithRotate: true, // Allow pitch adjustment while rotating
    });

    // Add controls
    map.value.addControl(new mapboxgl.NavigationControl({
      visualizePitch: true
    }), "top-right");
    
    map.value.addControl(new mapboxgl.FullscreenControl(), "top-right");
    
    map.value.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      }),
      "top-right"
    );

    // Add scale control
    map.value.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    // Add location marker
    if (props.showMarker) {
      const el = document.createElement("div");
      el.className = "location-marker-3d";
      el.innerHTML = `
        <div class="location-pulse"></div>
        <div class="location-dot"></div>
      `;
      
      locationMarker.value = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.value);
    }

    // Map load event
    map.value.on("load", () => {
      console.log("✅ Realistic 3D map loaded");
      loading.value = false;
      error.value = "";
      mapInitialized.value = true;
      
      // Configure the Standard style for best 3D effect
      try {
        // Enable 3D terrain if available
        if (map.value?.getSource('mapbox-dem') === undefined) {
          map.value?.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
          });
        }
        map.value?.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.2 });
      } catch (e) {
        console.log("Terrain not available for this style");
      }
      
      // Add fog for atmosphere
      try {
        map.value?.setFog({
          'color': 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6
        });
      } catch (e) {
        console.log("Fog not available");
      }
      
      addVenueMarkers();
      emit("locationFound", { lat, lng, placeName: lastSearchedLocation.value });
    });

    map.value.on("error", (e) => {
      console.error("Map error:", e);
      error.value = "Failed to load map";
      loading.value = false;
    });

    // Timeout fallback
    setTimeout(() => {
      if (loading.value) {
        loading.value = false;
      }
    }, 15000);

  } catch (err: any) {
    console.error("Map init error:", err);
    error.value = err.message || "Failed to initialize map";
    loading.value = false;
  }
};

// Add venue markers
const addVenueMarkers = () => {
  if (!map.value) return;

  // Clear existing
  venueMarkers.value.forEach((m) => m.remove());
  venueMarkers.value = [];
  popups.value.forEach((p) => p.remove());
  popups.value = [];

  props.venues.forEach((venue) => {
    if (!venue.latitude || !venue.longitude) return;

    const el = createVenueMarkerElement(venue);

    const popup = new mapboxgl.Popup({
      offset: [0, -50],
      closeButton: false,
      closeOnClick: false,
      maxWidth: "280px",
      className: "venue-popup-container"
    }).setHTML(createPopupContent(venue));

    const marker = new mapboxgl.Marker({ 
      element: el,
      anchor: "bottom"
    })
      .setLngLat([venue.longitude, venue.latitude])
      .addTo(map.value!);

    el.addEventListener("mouseenter", () => {
      popup.setLngLat([venue.longitude, venue.latitude]).addTo(map.value!);
      el.classList.add("hovered");
    });

    el.addEventListener("mouseleave", () => {
      popup.remove();
      el.classList.remove("hovered");
    });

    el.addEventListener("click", () => {
      selectVenue(venue);
    });

    venueMarkers.value.push(marker);
    popups.value.push(popup);
  });

  if (props.venues.length > 0) {
    setTimeout(() => fitBoundsToVenues(), 500);
  }
};

// Fit bounds
const fitBoundsToVenues = () => {
  if (!map.value || props.venues.length === 0) return;

  const bounds = new mapboxgl.LngLatBounds();

  if (locationMarker.value) {
    bounds.extend(locationMarker.value.getLngLat());
  }

  props.venues.forEach((v) => {
    if (v.latitude && v.longitude) {
      bounds.extend([v.longitude, v.latitude]);
    }
  });

  map.value.fitBounds(bounds, {
    padding: { top: 100, bottom: 100, left: 50, right: isMobile.value ? 50 : 400 },
    maxZoom: 16,
    pitch: is3D.value ? 60 : 0,
    bearing: is3D.value ? -17 : 0
  });
};

// Toggle 3D
const toggle3D = () => {
  if (!map.value) return;

  is3D.value = !is3D.value;

  if (is3D.value) {
    map.value.easeTo({
      pitch: 60,
      bearing: -17,
      duration: 1000
    });
  } else {
    map.value.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 1000
    });
  }
};

// Rotate left (counterclockwise)
const rotateLeft = () => {
  if (!map.value) return;
  const currentBearing = map.value.getBearing();
  map.value.easeTo({
    bearing: currentBearing - 45,
    duration: 500
  });
};

// Rotate right (clockwise)
const rotateRight = () => {
  if (!map.value) return;
  const currentBearing = map.value.getBearing();
  map.value.easeTo({
    bearing: currentBearing + 45,
    duration: 500
  });
};

// Tilt up (increase pitch)
const tiltUp = () => {
  if (!map.value) return;
  const currentPitch = map.value.getPitch();
  const newPitch = Math.min(currentPitch + 15, 85); // Max pitch 85
  map.value.easeTo({
    pitch: newPitch,
    duration: 500
  });
};

// Tilt down (decrease pitch)
const tiltDown = () => {
  if (!map.value) return;
  const currentPitch = map.value.getPitch();
  const newPitch = Math.max(currentPitch - 15, 0); // Min pitch 0
  map.value.easeTo({
    pitch: newPitch,
    duration: 500
  });
};

// Reset view
const resetView = () => {
  if (!map.value) return;
  
  map.value.easeTo({
    pitch: is3D.value ? 60 : 0,
    bearing: is3D.value ? -17 : 0,
    duration: 1000
  });
  
  if (props.venues.length > 0) {
    fitBoundsToVenues();
  }
};

// Change map style
const changeMapStyle = (styleOption: { id: string; name: string; style: string }) => {
  if (!map.value) return;

  currentStyle.value = styleOption.id;
  
  const currentCenter = map.value.getCenter();
  const currentZoom = map.value.getZoom();
  const currentPitch = map.value.getPitch();
  const currentBearing = map.value.getBearing();
  
  map.value.setStyle(styleOption.style);

  map.value.once("style.load", () => {
    map.value?.jumpTo({
      center: currentCenter,
      zoom: currentZoom,
      pitch: currentPitch,
      bearing: currentBearing
    });
    
    setTimeout(() => addVenueMarkers(), 200);
  });
};

// Select venue
const selectVenue = (venue: Venue) => {
  selectedVenue.value = venue;
  emit("venueSelected", venue);

  if (map.value) {
    map.value.flyTo({
      center: [venue.longitude, venue.latitude],
      zoom: 17,
      pitch: 70,
      bearing: Math.random() * 60 - 30, // Random angle for variety
      duration: 2000,
      essential: true
    });
  }
};

// Close venue detail
const closeVenueDetail = () => {
  selectedVenue.value = null;
  if (map.value && props.venues.length > 0) {
    fitBoundsToVenues();
  }
};

// Handle View Details click
const handleViewDetails = () => {
  if (selectedVenue.value) {
    console.log("📤 Emitting venueDetailsClick");
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
    map.value.flyTo({ 
      center: [lng, lat], 
      zoom: props.zoom,
      pitch: is3D.value ? 60 : 0,
      bearing: is3D.value ? -17 : 0,
      duration: 2000 
    });
    if (locationMarker.value) {
      locationMarker.value.setLngLat([lng, lat]);
    }
  }
};

// Retry
const retryLoad = async () => {
  error.value = "";
  loading.value = true;
  if (props.location) {
    await searchLocation(props.location);
  }
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
    error.value = `Location "${locationName}" not found`;
    loading.value = false;
  }
};

// Watch location
let hasInitialized = false;
watch(
  () => props.location,
  async (newLocation) => {
    if (!newLocation) return;
    if (!hasInitialized || newLocation !== lastSearchedLocation.value) {
      hasInitialized = true;
      await searchLocation(newLocation);
    }
  },
  { immediate: true }
);

// Watch venues
watch(
  () => props.venues.length,
  (newLen, oldLen) => {
    if (newLen !== oldLen && mapInitialized.value) {
      setTimeout(() => addVenueMarkers(), 100);
    }
  }
);

// Cleanup
onUnmounted(() => {
  venueMarkers.value.forEach((m) => m.remove());
  popups.value.forEach((p) => p.remove());
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

defineExpose({
  searchLocation,
  updateMapPosition,
  selectVenue,
  fitBoundsToVenues,
  toggle3D,
  resetView,
  rotateLeft,
  rotateRight,
  tiltUp,
  tiltDown,
});
</script>

<style scoped>
.mapbox-venue-container {
  position: relative;
  width: 100%;
  height: v-bind(height);
  border-radius: 16px;
  overflow: visible;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.map-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.venue-detail-card {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 320px;
  max-height: calc(100% - 32px);
  overflow-y: auto;
  z-index: 20;
  border-radius: 20px !important;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.98) !important;
}

.venue-detail-card.mobile-card {
  top: auto;
  bottom: 0;
  right: 0;
  left: 0;
  width: 100%;
  max-height: 55%;
  border-radius: 24px 24px 0 0 !important;
}

.venue-card-header {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
}

.close-btn {
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  backdrop-filter: blur(4px);
}

.map-legend {
  position: absolute;
  bottom: 32px;
  left: 16px;
  background: rgba(255, 255, 255, 0.95);
  padding: 10px 14px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 5;
  font-size: 12px;
  backdrop-filter: blur(10px);
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.venue-marker-color {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.location-marker-color {
  background: #2193b0;
}

.map-controls {
  position: absolute;
  bottom: 120px;
  right: 10px;
  display: flex;
  flex-direction: column;
  z-index: 5;
}

.ga-1 {
  gap: 4px;
}
</style>

<style>
/* Location marker with pulse animation */
.location-marker-3d {
  position: relative;
  width: 24px;
  height: 24px;
}

.location-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(33, 147, 176, 0.3);
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
}

.location-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #2193b0, #6dd5ed);
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(33, 147, 176, 0.5);
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* 3D Venue Markers */
.venue-marker-3d {
  cursor: pointer;
}

.marker-3d-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.venue-marker-3d:hover .marker-3d-container,
.venue-marker-3d.hovered .marker-3d-container {
  transform: scale(1.15) translateY(-8px);
}

.marker-3d-bubble {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
}

.marker-3d-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marker-3d-icon svg {
  width: 16px;
  height: 16px;
  fill: white;
}

.marker-3d-price {
  font-weight: 700;
}

.marker-3d-pointer {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid #764ba2;
  margin-top: -1px;
}

/* Popup Styles */
.venue-popup-container .mapboxgl-popup-content {
  padding: 0 !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
}

.venue-popup-container .mapboxgl-popup-tip {
  border-top-color: white !important;
}

.venue-popup-3d {
  width: 260px;
  background: white;
}

.popup-3d-image {
  height: 120px;
  overflow: hidden;
}

.popup-3d-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.popup-3d-image:hover img {
  transform: scale(1.05);
}

.popup-3d-content {
  padding: 12px 14px;
}

.popup-3d-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #1a1a2e;
}

.popup-3d-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  margin-bottom: 4px;
  color: #444;
}

.popup-3d-reviews {
  color: #888;
  font-size: 12px;
}

.popup-3d-price {
  font-size: 16px;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 4px;
}

.popup-3d-type {
  display: inline-block;
  font-size: 11px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 500;
}

/* Mapbox control adjustments */
.mapboxgl-ctrl-top-right {
  top: 10px;
  right: 10px;
}

.mapboxgl-ctrl-group {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.mapboxgl-ctrl-group button {
  width: 36px !important;
  height: 36px !important;
}

.mapboxgl-ctrl-scale {
  background: rgba(255, 255, 255, 0.9) !important;
  border-radius: 8px !important;
  border: none !important;
  padding: 4px 8px !important;
  font-size: 11px !important;
}
</style>