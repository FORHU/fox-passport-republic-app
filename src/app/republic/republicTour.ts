import type { TourStep } from "@/shared/components/ui/ProductTour";

export const REPUBLIC_TOUR_KEY = "republic";

/** The Republic feed (`/republic`). The sidebar is desktop-only and the
 * control bar and depots banner are its phone stand-ins; Following moves
 * between an inline strip and the right sidebar, both `republic-following`. */
export const REPUBLIC_TOUR: TourStep[] = [
  {
    title: "Welcome to the Republic",
    body: "The community feed: posts from citizens, Foxers and partners. Here's how to find your way around.",
  },
  {
    target: "republic-sidebar",
    title: "Your corner",
    body: "Your citizen card, the Equipment Depots map where partners keep their gear, and shortcuts to the rest of the Republic.",
  },
  {
    target: "republic-mobile-bar",
    title: "Streams and posting",
    body: "Swipe between streams, or tap Post to share something with the community.",
  },
  {
    target: "republic-depots",
    title: "Equipment Depots",
    body: "See where partners keep their gear, and what's on offer, on the depots map.",
  },
  {
    target: "republic-search",
    title: "Search the feed",
    body: "Find posts, creators and venues by name or hashtag.",
  },
  {
    target: "republic-compose",
    title: "Share a post",
    body: "Post an update, photos or something you're selling. It goes out to the community feed.",
  },
  {
    target: "republic-filters",
    title: "Choose what you see",
    body: "Pick a stream (All, Community, Marketplace or Partners) and sort by For You or Recent.",
  },
  {
    target: "republic-following",
    title: "People you follow",
    body: "The Foxers and citizens you follow, so you can jump to their profiles.",
  },
  {
    target: "republic-feed",
    title: "The feed",
    body: "Like, comment on, save or share any post. Open one to read the whole thread.",
  },
  {
    title: "That's it",
    body: "Replay this tour any time with the flag button in the top bar.",
  },
];
