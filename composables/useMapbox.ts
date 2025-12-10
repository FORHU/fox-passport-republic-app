// composables/useMapboxEnhanced.ts
export const useMapboxEnhanced = () => {
  const config = useRuntimeConfig();
  const mapboxToken = config.public.MAPBOX_TOKEN;

  // Geocode a location name to coordinates
  const geocodeLocation = async (locationName: string, country: string = 'Philippines') => {
    if (!locationName) {
      return { success: false, error: 'No location provided' };
    }

    if (!mapboxToken) {
      return { success: false, error: 'Mapbox token not configured' };
    }

    try {
      const searchQuery = country ? `${locationName}, ${country}` : locationName;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}&limit=1&types=place,locality,neighborhood`
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [longitude, latitude] = feature.center;
        
        return {
          success: true,
          data: {
            latitude,
            longitude,
            placeName: feature.place_name,
            placeType: feature.place_type,
            bbox: feature.bbox,
            text: feature.text,
            context: feature.context,
          }
        };
      }

      return { success: false, error: 'Location not found' };
    } catch (err: any) {
      console.error('Geocoding error:', err);
      return { success: false, error: err.message || 'Geocoding failed' };
    }
  };

  // Reverse geocode coordinates to location name
  const reverseGeocode = async (latitude: number, longitude: number) => {
    if (!mapboxToken) {
      return { success: false, error: 'Mapbox token not configured' };
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&limit=1&types=place,locality,address`
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          success: true,
          data: {
            placeName: feature.place_name,
            placeType: feature.place_type,
            context: feature.context,
            text: feature.text,
          }
        };
      }

      return { success: false, error: 'Location not found' };
    } catch (err: any) {
      console.error('Reverse geocoding error:', err);
      return { success: false, error: err.message || 'Reverse geocoding failed' };
    }
  };

  // Get directions between two points
  const getDirections = async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    profile: 'driving' | 'walking' | 'cycling' | 'driving-traffic' = 'driving'
  ) => {
    if (!mapboxToken) {
      return { success: false, error: 'Mapbox token not configured' };
    }

    try {
      const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?access_token=${mapboxToken}&geometries=geojson&overview=full&steps=true&banner_instructions=true`
      );

      if (!response.ok) {
        throw new Error(`Directions request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          success: true,
          data: {
            distance: route.distance, // in meters
            duration: route.duration, // in seconds
            geometry: route.geometry, // GeoJSON LineString
            steps: route.legs[0].steps, // Turn-by-turn directions
            distanceText: formatDistance(route.distance),
            durationText: formatDuration(route.duration),
          }
        };
      }

      return { success: false, error: 'No route found' };
    } catch (err: any) {
      console.error('Directions error:', err);
      return { success: false, error: err.message || 'Directions request failed' };
    }
  };

  // Get isochrone (areas reachable within time/distance)
  const getIsochrone = async (
    location: { lat: number; lng: number },
    minutes: number = 15,
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ) => {
    if (!mapboxToken) {
      return { success: false, error: 'Mapbox token not configured' };
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${location.lng},${location.lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxToken}`
      );

      if (!response.ok) {
        throw new Error(`Isochrone request failed: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.features[0]
      };
    } catch (err: any) {
      console.error('Isochrone error:', err);
      return { success: false, error: err.message || 'Isochrone request failed' };
    }
  };

  // Search for places near a location
  const searchNearby = async (
    location: { lat: number; lng: number },
    query: string,
    radius: number = 5000 // meters
  ) => {
    if (!mapboxToken) {
      return { success: false, error: 'Mapbox token not configured' };
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?proximity=${location.lng},${location.lat}&access_token=${mapboxToken}&limit=10`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.features.map((feature: any) => ({
          name: feature.text,
          placeName: feature.place_name,
          coordinates: {
            lat: feature.center[1],
            lng: feature.center[0]
          },
          type: feature.place_type,
          address: feature.properties?.address,
        }))
      };
    } catch (err: any) {
      console.error('Search error:', err);
      return { success: false, error: err.message || 'Search failed' };
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance; // in kilometers
  };

  const toRad = (degrees: number) => degrees * (Math.PI / 180);

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  // Philippine municipality coordinates lookup (expanded)
  const philippineMunicipalityCoords: Record<string, { lat: number; lng: number }> = {
    // Metro Manila
    'manila': { lat: 14.5995, lng: 120.9842 },
    'quezon city': { lat: 14.6760, lng: 121.0437 },
    'makati': { lat: 14.5547, lng: 121.0244 },
    'taguig': { lat: 14.5176, lng: 121.0509 },
    'pasig': { lat: 14.5764, lng: 121.0851 },
    'caloocan': { lat: 14.6488, lng: 120.9670 },
    'paranaque': { lat: 14.4793, lng: 121.0198 },
    'las pinas': { lat: 14.4445, lng: 120.9939 },
    'mandaluyong': { lat: 14.5794, lng: 121.0359 },
    'marikina': { lat: 14.6507, lng: 121.1029 },
    'muntinlupa': { lat: 14.3808, lng: 121.0426 },
    'pasay': { lat: 14.5378, lng: 120.9896 },
    'pateros': { lat: 14.5418, lng: 121.0658 },
    'san juan': { lat: 14.6019, lng: 121.0355 },
    'valenzuela': { lat: 14.7000, lng: 120.9833 },
    'malabon': { lat: 14.6608, lng: 120.9573 },
    'navotas': { lat: 14.6618, lng: 120.9402 },
    
    // Major Cities
    'cebu city': { lat: 10.3157, lng: 123.8854 },
    'davao city': { lat: 7.1907, lng: 125.4553 },
    'antipolo': { lat: 14.5863, lng: 121.1756 },
    'cagayan de oro': { lat: 8.4542, lng: 124.6319 },
    'zamboanga city': { lat: 6.9214, lng: 122.0790 },
    'iloilo city': { lat: 10.7202, lng: 122.5621 },
    'bacolod': { lat: 10.6760, lng: 122.9500 },
    'general santos': { lat: 6.1164, lng: 125.1716 },
    'baguio': { lat: 16.4023, lng: 120.5960 },
    'tagaytay': { lat: 14.1092, lng: 120.9605 },
    
    // Pampanga
    'san fernando': { lat: 15.0286, lng: 120.6897 },
    'angeles': { lat: 15.1450, lng: 120.5887 },
    'mabalacat': { lat: 15.2167, lng: 120.5708 },
    
    // Bulacan
    'malolos': { lat: 14.8433, lng: 120.8114 },
    'meycauayan': { lat: 14.7339, lng: 120.9614 },
    'san jose del monte': { lat: 14.8136, lng: 121.0453 },
    
    // Rizal
    'cainta': { lat: 14.5781, lng: 121.1225 },
    'taytay': { lat: 14.5672, lng: 121.1328 },
    'binangonan': { lat: 14.4647, lng: 121.1922 },
    
    // Cavite
    'bacoor': { lat: 14.4598, lng: 120.9428 },
    'imus': { lat: 14.4297, lng: 120.9367 },
    'dasmarinas': { lat: 14.3294, lng: 120.9367 },
    'cavite city': { lat: 14.4791, lng: 120.8964 },
    
    // Laguna
    'santa rosa': { lat: 14.3123, lng: 121.1114 },
    'calamba': { lat: 14.2119, lng: 121.1653 },
    'san pablo': { lat: 14.0683, lng: 121.3256 },
    'binan': { lat: 14.3369, lng: 121.0858 },
  };

  // Quick lookup for common Philippine locations
  const getQuickCoordinates = (locationName: string) => {
    const normalized = locationName.toLowerCase().trim();
    return philippineMunicipalityCoords[normalized] || null;
  };

  // Get static map image URL
  const getStaticMapUrl = (
    center: { lat: number; lng: number },
    zoom: number = 14,
    width: number = 600,
    height: number = 400,
    markers?: Array<{ lat: number; lng: number; color?: string }>
  ): string => {
    if (!mapboxToken) return '';

    let markerString = '';
    if (markers && markers.length > 0) {
      markerString = markers.map(m => 
        `pin-s${m.color ? `-${m.color}` : ''}(${m.lng},${m.lat})`
      ).join(',');
    }

    const overlay = markerString ? `/${markerString}` : '';
    
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static${overlay}/${center.lng},${center.lat},${zoom},0/${width}x${height}@2x?access_token=${mapboxToken}`;
  };

  return {
    mapboxToken,
    geocodeLocation,
    reverseGeocode,
    getDirections,
    getIsochrone,
    searchNearby,
    calculateDistance,
    formatDistance,
    formatDuration,
    getQuickCoordinates,
    getStaticMapUrl,
    philippineMunicipalityCoords,
  };
};