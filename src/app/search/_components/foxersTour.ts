import type { TourStep } from "@/shared/components/ui/ProductTour";

export const FOXERS_TOUR_KEY = "foxers";

/** The Foxers page (`/search`). Filters are a sidebar on desktop and a
 * button that opens a sheet on phones; both carry `foxers-filters`. */
export const FOXERS_TOUR: TourStep[] = [
  {
    title: "Meet the Foxers",
    body: "Foxers are the people who make events happen: Event Foxers who run the whole night, and Providers who rent out gear and services. Here's how to find the right one.",
  },
  {
    target: "foxers-search",
    title: "Search by name or skill",
    body: "Type a name, a service or a kind of event to narrow the list as you type.",
  },
  {
    target: "foxers-kinds",
    title: "Pick a kind of Foxer",
    body: "Switch between everyone, Event Foxers and each kind of Provider. The count shows how many match.",
  },
  {
    target: "foxers-filters",
    title: "Filter the results",
    body: "Narrow by city, price, category and more. Active filters show as chips you can clear one by one.",
  },
  {
    target: "foxers-results",
    title: "Browse and open a profile",
    body: "Open any Foxer to see their packages, prices and reviews, and to book or message them.",
  },
  {
    title: "That's it",
    body: "Replay this tour any time with the flag button in the top bar.",
  },
];
