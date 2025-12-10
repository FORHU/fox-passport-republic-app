// composables/useVenueMapLogic.ts
// Shows exact addresses when available from Mapbox, generates realistic addresses for fallback
import { ref } from 'vue';

export interface Venue {
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

interface POIResult {
  lat: number;
  lng: number;
  name: string;
  address: string;
  category: string;
  relevance: number;
}

export const useVenueMapLogic = () => {
  const showMap = ref(false);
  const searchedLocation = ref("");
  const locationDetails = ref("");
  const isSearching = ref(false);
  const venueList = ref<Venue[]>([]);
  const searchCoordinates = ref<{ lat: number; lng: number } | null>(null);
  
  const showVenueDialog = ref(false);
  const selectedVenueDetails = ref<Venue | null>(null);

  // Reverse geocode to get the actual address at specific coordinates
  const reverseGeocodeForAddress = async (lat: number, lng: number, token: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
        `access_token=${token}&` +
        `types=address,locality,neighborhood,place&` +
        `limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          // Return the full place_name which includes street, barangay, city, etc.
          return data.features[0].place_name || '';
        }
      }
    } catch (error) {
      console.warn('Reverse geocode failed:', error);
    }
    return '';
  };

  const generateSampleVenues = async (lat: number, lng: number, locationName: string): Promise<Venue[]> => {
    const config = useRuntimeConfig();
    const token = config.public.MAPBOX_TOKEN as string;
    
    if (!token) {
      console.error('❌ Mapbox token not configured');
      return await generateFallbackVenues(lat, lng, locationName, token);
    }
    
    const amenities = [
      'WiFi', 'Parking', 'Catering', 'AV Equipment', 'Stage', 
      'Air Conditioning', 'Kitchen', 'Bridal Suite', 'Dressing Room', 
      'Sound System', 'LED Screen', 'Outdoor Area', 'Pool Access', 
      'Garden', 'Bar Service', 'Valet Parking', 'Security'
    ];

    // Exclusion keywords
    const excludeKeywords = [
      'drugstore', 'pharmacy', 'hospital', 'clinic', 'medical', 'dental',
      'bank', 'atm', 'pawnshop', 'money', 'remittance',
      'gas station', 'petrol', 'fuel', 'shell', 'petron', 'caltex',
      'grocery', 'supermarket', 'puregold', 'sm supermarket', '7-eleven', 'ministop', 'alfamart',
      'school', 'university', 'college', 'elementary', 'high school', 'academy',
      'police', 'fire station', 'government', 'barangay hall', 'municipal', 'city hall',
      'terminal', 'bus station', 'jeepney', 'tricycle',
      'cemetery', 'memorial park', 'funeral', 'chapel',
      'laundry', 'repair', 'automotive', 'tire', 'vulcanizing',
      'hardware', 'construction', 'lumber'
    ];

    const isExcluded = (name: string): boolean => {
      const lower = name.toLowerCase();
      return excludeKeywords.some(keyword => lower.includes(keyword));
    };

    // EXPANDED SEARCH from multiple grid points
    const searchPOIsFromMultiplePoints = async (): Promise<POIResult[]> => {
      const allResults: POIResult[] = [];
      const seenLocations = new Set<string>();

      const gridOffsets = [
        [0, 0],
        [0.05, 0], [-0.05, 0], [0, 0.05], [0, -0.05],
        [0.035, 0.035], [-0.035, 0.035], [0.035, -0.035], [-0.035, -0.035],
        [0.07, 0], [-0.07, 0], [0, 0.07], [0, -0.07],
      ];

      const searchTerms = [
        'hotel', 'resort', 'restaurant', 'cafe', 'inn',
        'lodge', 'bar', 'grill', 'function hall', 'events'
      ];

      console.log(`🔍 Searching venues near ${locationName}`);

      for (const [latOffset, lngOffset] of gridOffsets) {
        const searchLat = lat + latOffset;
        const searchLng = lng + lngOffset;

        const termIndex = gridOffsets.findIndex(o => o[0] === latOffset && o[1] === lngOffset) % searchTerms.length;
        const termsToSearch = [
          searchTerms[termIndex],
          searchTerms[(termIndex + 1) % searchTerms.length],
          searchTerms[(termIndex + 2) % searchTerms.length]
        ];

        for (const term of termsToSearch) {
          if (allResults.length >= 50) break;

          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?` +
              `access_token=${token}&` +
              `proximity=${searchLng},${searchLat}&` +
              `country=PH&` +
              `types=poi&` +
              `limit=5&` +
              `language=en`
            );

            if (!response.ok) continue;

            const data = await response.json();

            if (data.features && data.features.length > 0) {
              for (const feature of data.features) {
                const [poiLng, poiLat] = feature.center;
                
                const distFromCenter = Math.sqrt(
                  Math.pow(poiLat - lat, 2) + Math.pow(poiLng - lng, 2)
                );
                if (distFromCenter > 0.15) continue;

                const poiName = feature.text || '';
                if (isExcluded(poiName)) continue;

                const locationKey = `${poiLat.toFixed(4)},${poiLng.toFixed(4)}`;
                if (seenLocations.has(locationKey)) continue;
                seenLocations.add(locationKey);

                // Get the full address from Mapbox place_name
                // Format: "POI Name, Street/Area, City, Province, Country"
                let address = feature.place_name || '';
                
                // Remove the POI name from the beginning to get just the address
                if (address.toLowerCase().startsWith(poiName.toLowerCase())) {
                  address = address.substring(poiName.length).replace(/^[\s,]+/, '');
                }
                
                // If no good address, use reverse geocoding
                if (!address || address === 'Philippines' || address.split(',').length < 2) {
                  address = await reverseGeocodeForAddress(poiLat, poiLng, token);
                }
                
                // Final fallback
                if (!address) {
                  address = `${locationName}, Philippines`;
                }
                
                allResults.push({
                  lat: poiLat,
                  lng: poiLng,
                  name: poiName,
                  address: address,
                  category: term,
                  relevance: feature.relevance || 0.5
                });
              }
            }
          } catch (error) {
            // Continue on error
          }
        }

        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // Also search with location-specific terms
      const specificTerms = [
        `${locationName} hotel`,
        `${locationName} resort`,
        `${locationName} restaurant`,
        `${locationName} events place`
      ];

      for (const term of specificTerms) {
        if (allResults.length >= 60) break;

        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?` +
            `access_token=${token}&` +
            `proximity=${lng},${lat}&` +
            `country=PH&` +
            `types=poi&` +
            `limit=10&` +
            `language=en`
          );

          if (!response.ok) continue;

          const data = await response.json();

          if (data.features) {
            for (const feature of data.features) {
              const [poiLng, poiLat] = feature.center;
              
              const distFromCenter = Math.sqrt(
                Math.pow(poiLat - lat, 2) + Math.pow(poiLng - lng, 2)
              );
              if (distFromCenter > 0.15) continue;

              const poiName = feature.text || '';
              if (isExcluded(poiName)) continue;

              const locationKey = `${poiLat.toFixed(4)},${poiLng.toFixed(4)}`;
              if (seenLocations.has(locationKey)) continue;
              seenLocations.add(locationKey);

              let address = feature.place_name || '';
              if (address.toLowerCase().startsWith(poiName.toLowerCase())) {
                address = address.substring(poiName.length).replace(/^[\s,]+/, '');
              }
              
              if (!address || address === 'Philippines' || address.split(',').length < 2) {
                address = await reverseGeocodeForAddress(poiLat, poiLng, token);
              }
              
              if (!address) {
                address = `${locationName}, Philippines`;
              }

              allResults.push({
                lat: poiLat,
                lng: poiLng,
                name: poiName,
                address: address,
                category: term.replace(`${locationName} `, ''),
                relevance: feature.relevance || 0.5
              });
            }
          }
        } catch (error) {
          // Continue
        }
      }

      return allResults;
    };

    // Get POIs
    let pois = await searchPOIsFromMultiplePoints();
    console.log(`📍 Found ${pois.length} POIs`);

    // FALLBACK with reverse geocoded addresses
    if (pois.length < 15) {
      console.log('⚠️ Adding fallback venues with reverse geocoded addresses');
      const fallbackVenues = await generateDistributedFallbackPOIs(lat, lng, locationName, 20 - pois.length, token);
      pois = [...pois, ...fallbackVenues];
    }

    // Convert to Venue objects
    const venues: Venue[] = pois.slice(0, 30).map((poi, index) => {
      const randomAmenities = [...amenities]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 6) + 4);

      const imageId = Math.floor(Math.random() * 1000) + index + Date.now() % 1000;

      // Determine venue type
      let venueType = 'Event Space';
      const lowerName = poi.name.toLowerCase();
      const lowerCategory = poi.category.toLowerCase();

      if (lowerName.includes('hotel') || lowerCategory === 'hotel') {
        venueType = 'Hotel Venue';
      } else if (lowerName.includes('resort') || lowerCategory === 'resort') {
        venueType = 'Resort';
      } else if (lowerName.includes('convention') || lowerCategory.includes('convention')) {
        venueType = 'Convention Center';
      } else if (lowerName.includes('garden') || lowerCategory.includes('garden')) {
        venueType = 'Garden Venue';
      } else if (lowerName.includes('restaurant') || lowerCategory === 'restaurant') {
        venueType = 'Restaurant';
      } else if (lowerName.includes('cafe') || lowerName.includes('coffee') || lowerCategory === 'cafe') {
        venueType = 'Cafe';
      } else if (lowerName.includes('bar') || lowerName.includes('grill') || lowerCategory === 'bar' || lowerCategory === 'grill') {
        venueType = 'Bar & Grill';
      } else if (lowerName.includes('inn') || lowerName.includes('pension') || lowerCategory === 'inn') {
        venueType = 'Inn';
      } else if (lowerName.includes('lodge') || lowerCategory === 'lodge') {
        venueType = 'Lodge';
      } else if (lowerName.includes('hall') || lowerCategory.includes('function') || lowerCategory.includes('events')) {
        venueType = 'Function Hall';
      }

      // Price
      let basePrice = 10000;
      if (venueType === 'Hotel Venue') basePrice = 20000;
      else if (venueType === 'Resort') basePrice = 25000;
      else if (venueType === 'Convention Center') basePrice = 35000;
      else if (venueType === 'Function Hall') basePrice = 15000;
      else if (venueType === 'Garden Venue') basePrice = 12000;
      else if (venueType === 'Restaurant') basePrice = 8000;
      else if (venueType === 'Cafe') basePrice = 5000;
      else if (venueType === 'Bar & Grill') basePrice = 7000;
      else if (venueType === 'Inn' || venueType === 'Lodge') basePrice = 8000;

      const price = basePrice + Math.floor(Math.random() * basePrice * 0.4);

      // Capacity
      let baseCapacity = 100;
      if (venueType === 'Convention Center') baseCapacity = 500;
      else if (venueType === 'Hotel Venue') baseCapacity = 300;
      else if (venueType === 'Resort') baseCapacity = 250;
      else if (venueType === 'Function Hall') baseCapacity = 200;
      else if (venueType === 'Garden Venue') baseCapacity = 150;
      else if (venueType === 'Restaurant') baseCapacity = 80;
      else if (venueType === 'Cafe') baseCapacity = 40;
      else if (venueType === 'Bar & Grill') baseCapacity = 60;
      else if (venueType === 'Inn' || venueType === 'Lodge') baseCapacity = 50;

      const capacity = baseCapacity + Math.floor(Math.random() * baseCapacity * 0.3);

      return {
        id: `venue-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        name: poi.name,
        address: poi.address,
        latitude: poi.lat,
        longitude: poi.lng,
        image: `https://picsum.photos/seed/venue${imageId}/600/400`,
        images: [
          `https://picsum.photos/seed/venue${imageId}a/600/400`,
          `https://picsum.photos/seed/venue${imageId}b/600/400`,
          `https://picsum.photos/seed/venue${imageId}c/600/400`,
          `https://picsum.photos/seed/venue${imageId}d/600/400`,
        ],
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 300) + 10,
        price,
        capacity,
        type: venueType,
        amenities: randomAmenities,
        description: `${poi.name} - ${venueType.toLowerCase()} in ${locationName}. Perfect for weddings, corporate events, and special celebrations.`
      };
    });

    return venues.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  };

  // Generate fallback POIs with REVERSE GEOCODED addresses
  const generateDistributedFallbackPOIs = async (
    lat: number, 
    lng: number, 
    locationName: string, 
    count: number,
    token: string
  ): Promise<POIResult[]> => {
    const venueNames = [
      'Grand Hotel', 'Garden Resort', 'Plaza Restaurant', 'Events Center',
      'Mountain Lodge', 'Lakeside Inn', 'Sunset Cafe', 'Heritage Hall',
      'Pine View Resort', 'Valley Restaurant', 'Hilltop Bar', 'Riverside Grill',
      'Country Club', 'The Pavilion', 'Royal Ballroom', 'Green Garden Venue',
      'Summit Hotel', 'Terrace Cafe', 'Forest Lodge', 'Spring Resort'
    ];

    const categories = ['hotel', 'resort', 'restaurant', 'cafe', 'inn', 'lodge', 'bar', 'grill', 'function hall', 'events'];
    
    const results: POIResult[] = [];
    
    for (let i = 0; i < count; i++) {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const angle = i * goldenAngle;
      const radius = 0.02 + (i / count) * 0.1;
      
      const offsetLat = radius * Math.cos(angle);
      const offsetLng = radius * Math.sin(angle);
      
      const venueLat = lat + offsetLat;
      const venueLng = lng + offsetLng;
      
      const venueName = venueNames[i % venueNames.length];
      const category = categories[i % categories.length];
      
      // Get REAL address via reverse geocoding
      let address = '';
      if (token) {
        address = await reverseGeocodeForAddress(venueLat, venueLng, token);
      }
      
      // Fallback if reverse geocoding failed
      if (!address) {
        address = `${locationName}, Philippines`;
      }
      
      results.push({
        lat: venueLat,
        lng: venueLng,
        name: `${locationName} ${venueName}`,
        address: address,
        category: category,
        relevance: 0.5
      });
      
      // Small delay between reverse geocode calls
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    return results;
  };

  // Fallback venue generator
  const generateFallbackVenues = async (lat: number, lng: number, locationName: string, token: string): Promise<Venue[]> => {
    const pois = await generateDistributedFallbackPOIs(lat, lng, locationName, 20, token);
    const amenities = ['WiFi', 'Parking', 'Catering', 'AV Equipment', 'Air Conditioning'];

    return pois.map((poi, index) => {
      let venueType = 'Event Space';
      if (poi.category === 'hotel') venueType = 'Hotel Venue';
      else if (poi.category === 'resort') venueType = 'Resort';
      else if (poi.category === 'restaurant') venueType = 'Restaurant';
      else if (poi.category === 'cafe') venueType = 'Cafe';
      else if (poi.category === 'inn' || poi.category === 'lodge') venueType = 'Inn';
      else if (poi.category === 'bar' || poi.category === 'grill') venueType = 'Bar & Grill';
      else if (poi.category === 'function hall' || poi.category === 'events') venueType = 'Function Hall';

      return {
        id: `venue-fb-${Date.now()}-${index}`,
        name: poi.name,
        address: poi.address,
        latitude: poi.lat,
        longitude: poi.lng,
        image: `https://picsum.photos/seed/fb${index}/600/400`,
        images: [
          `https://picsum.photos/seed/fb${index}a/600/400`,
          `https://picsum.photos/seed/fb${index}b/600/400`,
          `https://picsum.photos/seed/fb${index}c/600/400`,
          `https://picsum.photos/seed/fb${index}d/600/400`,
        ],
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 100) + 10,
        price: 8000 + Math.floor(Math.random() * 20000),
        capacity: 50 + Math.floor(Math.random() * 250),
        type: venueType,
        amenities,
        description: `${poi.name} - ${venueType.toLowerCase()} for your special events.`
      };
    });
  };

  const searchForVenues = async (locationName: string, lat: number, lng: number) => {
    isSearching.value = true;
    venueList.value = [];

    try {
      console.log(`🔎 Searching venues for: ${locationName}`);
      const venues = await generateSampleVenues(lat, lng, locationName);
      venueList.value = venues;
      locationDetails.value = locationName;
      searchCoordinates.value = { lat, lng };
      console.log(`✅ Loaded ${venues.length} venues`);
    } catch (e) {
      console.error('❌ Error:', e);
      const config = useRuntimeConfig();
      const token = config.public.MAPBOX_TOKEN as string;
      venueList.value = await generateFallbackVenues(lat, lng, locationName, token);
    } finally {
      isSearching.value = false;
    }
  };

  const openVenueDetails = (venue: Venue) => {
    selectedVenueDetails.value = venue;
    showVenueDialog.value = true;
  };

  const closeVenueDetails = () => {
    showVenueDialog.value = false;
    selectedVenueDetails.value = null;
  };

  return {
    showMap,
    searchedLocation,
    locationDetails,
    venueList,
    isSearching,
    searchCoordinates,
    showVenueDialog,
    selectedVenueDetails,
    searchForVenues,
    openVenueDetails,
    closeVenueDetails
  };
};