// Helper functions for filtering venues
export function filterVenues(venues: any[], locationQuery?: string, categoryQuery?: string) {
  let filtered = venues;

  if (locationQuery) {
    filtered = filtered.filter(
      (v) =>
        v.location.toLowerCase().includes(locationQuery.toLowerCase()) ||
        v.province.toLowerCase().includes(locationQuery.toLowerCase())
    );
  }

  if (categoryQuery) {
    filtered = filtered.filter((v) => {
      const cat = v.category.toLowerCase();
      const q = categoryQuery.toLowerCase();

      if (q === "hotels & travel") return ["hotel", "resort", "villa", "condo", "apartment", "suite", "inn", "lodge", "room", "cabin", "glamping"].some((t) => cat.includes(t));
      if (q === "event planning & services") return ["garden", "function", "events", "historic", "event"].some((t) => cat.includes(t));
      if (q === "restaurants" || q === "food") return ["dining", "restaurant"].some((t) => cat.includes(t));
      if (q === "arts & entertainment") return ["art", "gallery", "museum", "historic"].some((t) => cat.includes(t));
      if (q === "nightlife") return ["bar", "club", "lounge"].some((t) => cat.includes(t));
      if (q === "real estate") return ["house", "condo", "apartment", "loft"].some((t) => cat.includes(t));
      if (q === "adventures") return ["hiking", "paragliding", "diving", "surfing", "zip"].some((t) => cat.includes(t));
      if (q === "camping") return ["cabin", "glamping", "camp", "forest", "mountain"].some((t) => cat.includes(t));
      if (q === "music & arts") return ["art", "music", "gallery", "museum"].some((t) => cat.includes(t));
      if (q === "venues") return ["venue", "event", "garden", "hall"].some((t) => cat.includes(t));
      if (q === "wellness") return ["spa", "wellness", "resort"].some((t) => cat.includes(t));
      if (q === "food & dining") return ["restaurant", "dining", "food"].some((t) => cat.includes(t));

      return cat.includes(q);
    });
  }

  return filtered;
}