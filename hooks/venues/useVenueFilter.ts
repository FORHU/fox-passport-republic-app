import { HARDCODED_VENUES, Venue } from "@/data/hardcodedVenues";

export const useVenueFilter = () => {
  const filterVenues = (
    query: string | null,
    type: "category" | "location"
  ) => {
    let filtered = HARDCODED_VENUES;

    if (!query) return filtered;

    const q = query.toLowerCase();

    if (type === "location") {
      return filtered.filter(
        (v) =>
          v.location.toLowerCase().includes(q) ||
          v.province.toLowerCase().includes(q)
      );
    }

    if (type === "category") {
      return filtered.filter((v) => {
        const cat = v.category.toLowerCase();

        // Map Broad Categories to Specific Data Types
        if (q === "hotels & travel")
          return [
            "hotel",
            "resort",
            "villa",
            "condo",
            "apartment",
            "suite",
            "inn",
            "lodge",
            "room",
            "cabin",
            "glamping",
          ].some((t) => cat.includes(t));
        if (q === "event planning & services")
          return ["garden", "function", "events", "historic", "event"].some(
            (t) => cat.includes(t)
          );
        if (q === "restaurants" || q === "food" || q === "food & dining")
          return ["dining", "restaurant", "food"].some((t) => cat.includes(t));
        if (q === "arts & entertainment")
          return ["art", "gallery", "museum", "historic"].some((t) =>
            cat.includes(t)
          );
        if (q === "nightlife")
          return ["bar", "club", "lounge"].some((t) => cat.includes(t));
        if (q === "real estate")
          return ["house", "condo", "apartment", "loft"].some((t) =>
            cat.includes(t)
          );
        if (q === "adventures")
          return ["hiking", "paragliding", "diving", "surfing", "zip"].some(
            (t) => cat.includes(t)
          );
        if (q === "camping")
          return ["cabin", "glamping", "camp", "forest", "mountain"].some((t) =>
            cat.includes(t)
          );
        if (q === "music & arts" || q === "music")
          return ["art", "music", "gallery", "museum"].some((t) =>
            cat.includes(t)
          );
        if (q === "venues")
          return ["venue", "event", "garden", "hall"].some((t) =>
            cat.includes(t)
          );
        if (q === "wellness")
          return ["spa", "wellness", "resort"].some((t) => cat.includes(t));

        // Default: Direct text match
        return cat.includes(q);
      });
    }

    return filtered;
  };

  return { filterVenues };
};
