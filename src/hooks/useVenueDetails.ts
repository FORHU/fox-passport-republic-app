import { useMemo } from 'react';
import { HARDCODED_VENUES, Venue } from '@/src/data/hardcodedVenues'; // Adjust path to where your file is
import { VENUE_THINGS_TO_DO, MOCK_REVIEWS } from '@/src/data/venueActivities';

export function useVenueDetails(venueId: string) {
  
  const venueData = useMemo(() => {
    const venue = HARDCODED_VENUES.find((v) => v.id === venueId);
    
    // Fallback if ID not found
    if (!venue) return null;

    // Get specific activities or default
    const activities = VENUE_THINGS_TO_DO[venueId] || VENUE_THINGS_TO_DO["default"];

    return {
      venue,
      activities,
      reviews: MOCK_REVIEWS // You can filter this by ID later if you want specific reviews per venue
    };
  }, [venueId]);

  return venueData;
}