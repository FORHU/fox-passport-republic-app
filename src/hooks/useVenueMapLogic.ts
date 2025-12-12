import { useState, useCallback } from "react";
import { Venue, POIResult } from "@/src/types/venue";
import { config } from "@/src/config"; 

export const useVenueMapLogic = () => {
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchCoordinates, setSearchCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // --- Helper: Reverse Geocode ---
  const reverseGeocodeForAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${config.mapboxToken}&types=address,locality,neighborhood,place&limit=1`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.features?.length > 0) return data.features[0].place_name;
      }
    } catch (e) { console.warn(e); }
    return "";
  };

  // --- Helper: Exclusion Check ---
  const isExcluded = (name: string): boolean => {
    const excludeKeywords = ['drugstore', 'pharmacy', 'hospital', 'clinic', 'bank', 'atm', 'gas station', 'school', 'police', 'cemetery', 'laundry', 'hardware'];
    return excludeKeywords.some(k => name.toLowerCase().includes(k));
  };

  // --- Core Logic: Generate/Fetch Venues ---
  const searchForVenues = useCallback(async (locationName: string, lat: number, lng: number) => {
    // Safety check for token
    if (!config.mapboxToken) {
      console.error("❌ Missing Mapbox API Token in .env.local");
      return;
    }

    setLoading(true);
    setSearchCoordinates({ lat, lng });

    try {
      console.log(`🔎 Searching venues for: ${locationName}`);
      
      const allResults: POIResult[] = [];
      const seenLocations = new Set<string>();

      // 1. Grid Search Pattern
      const gridOffsets = [
        [0, 0], [0.035, 0.035], [-0.035, 0.035], [0.035, -0.035], [-0.035, -0.035]
      ];
      const searchTerms = ['hotel', 'resort', 'restaurant', 'events', 'function hall'];

      // 2. Fetch from Mapbox
      for (const [latOffset, lngOffset] of gridOffsets) {
        const searchLat = lat + latOffset;
        const searchLng = lng + lngOffset;
        
        const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];

        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?access_token=${config.mapboxToken}&proximity=${searchLng},${searchLat}&country=PH&types=poi&limit=8`
          );
          const data = await res.json();

          if (data.features) {
            for (const feature of data.features) {
              const [pLng, pLat] = feature.center;
              const poiName = feature.text || '';
              
              if (isExcluded(poiName)) continue;
              
              const locKey = `${pLat.toFixed(4)},${pLng.toFixed(4)}`;
              if (seenLocations.has(locKey)) continue;
              seenLocations.add(locKey);

              let address = feature.place_name || '';
              if (address.toLowerCase().startsWith(poiName.toLowerCase())) {
                 address = address.substring(poiName.length).replace(/^[\s,]+/, '');
              }
              
              allResults.push({
                lat: pLat, lng: pLng, name: poiName, address, category: term, relevance: 1
              });
            }
          }
        } catch (err) { continue; }
      }

      // 3. Fallback Generation
      if (allResults.length < 15) {
        const fallbacksNeeded = 20 - allResults.length;
        const venueNames = ['Grand Hotel', 'Garden Resort', 'Plaza Events', 'Mountain Lodge', 'Sunset Pavilion'];
        
        for (let i = 0; i < fallbacksNeeded; i++) {
          const angle = i * (Math.PI * 2 / fallbacksNeeded);
          const radius = 0.02; 
          const fLat = lat + (radius * Math.cos(angle));
          const fLng = lng + (radius * Math.sin(angle));
          
          const address = await reverseGeocodeForAddress(fLat, fLng);
          
          allResults.push({
            lat: fLat, lng: fLng,
            name: `${locationName} ${venueNames[i % venueNames.length]}`,
            address: address || `${locationName}, Philippines`,
            category: 'fallback',
            relevance: 0.5
          });
        }
      }

      // 4. Map to Venue Objects
      const mappedVenues: Venue[] = allResults.slice(0, 30).map((poi, index) => {
        const price = 8000 + Math.floor(Math.random() * 20000);
        return {
          id: `venue-${index}`,
          name: poi.name,
          address: poi.address,
          latitude: poi.lat,
          longitude: poi.lng,
          image: `https://picsum.photos/seed/${index + poi.name}/600/400`,
          rating: 3.5 + (Math.random() * 1.5),
          reviewCount: 10 + Math.floor(Math.random() * 200),
          price: price,
          capacity: 50 + Math.floor(Math.random() * 300),
          type: poi.category.charAt(0).toUpperCase() + poi.category.slice(1),
          amenities: ['WiFi', 'Parking', 'Air Con', 'Catering'],
          description: `Beautiful venue in ${locationName}`
        };
      });

      setVenues(mappedVenues);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, venues, searchCoordinates, searchForVenues };
};