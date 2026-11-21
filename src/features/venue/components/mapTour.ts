import type { TourStep } from "@/shared/components/ui/ProductTour";

export const MAP_TOUR_KEY = "venues-map";

/** The Venues Map (`/venues/map`). On phones only the list or the map is on
 * screen at a time, so the steps for the hidden one are skipped and the
 * List/Map toggle step explains how to switch. */
export const MAP_TOUR: TourStep[] = [
  {
    title: "Find a venue on the map",
    body: "Every venue on FoxPassport, on one map. The list always shows what's in view, so moving the map changes the list.",
  },
  {
    target: "map-search",
    title: "Search or look nearby",
    body: "Search by venue name or place, or use the locate button to see venues that cover where you are now.",
  },
  {
    target: "map-legend",
    title: "Read the colours",
    body: "Each colour is a kind of venue. The same colour marks its pin on the map.",
  },
  {
    target: "map-list",
    title: "Venues in view",
    body: "The venues inside the map's current view. Pick one to find it on the map and see its details.",
  },
  {
    target: "map-canvas",
    title: "Explore the map",
    body: "Drag and zoom to move around. Click a pin to open that venue's card.",
  },
  {
    target: "map-toggle",
    title: "List or map",
    body: "On a phone, switch between the list and the map here.",
  },
  {
    title: "That's it",
    body: "Replay this tour any time with the flag button in the top bar.",
  },
];
