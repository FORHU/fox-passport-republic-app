import type { TourStep } from "@/shared/components/ui/ProductTour";

export const BOOKINGS_TOUR_KEY = "bookings";

/** The Bookings page (`/booking`). The switch only shows for people who run
 * events, and the strip and sections only once there are bookings; steps for
 * anything not on screen are skipped. */
export const BOOKINGS_TOUR: TourStep[] = [
  {
    title: "Your bookings",
    body: "Everything you've booked, in date order, with what needs doing first. Here's a quick look around.",
  },
  {
    target: "bookings-switch",
    title: "Yours or your events'",
    body: "Switch between the bookings you made and the bookings citizens made for your events.",
  },
  {
    target: "bookings-find",
    title: "Book something new",
    body: "How many bookings you have, and a shortcut to find your next event.",
  },
  {
    target: "bookings-strip",
    title: "The month at a glance",
    body: "Days with a booking are marked. Pick a day to jump to its bookings below.",
  },
  {
    target: "bookings-attention",
    title: "Needs attention",
    body: "Bookings whose date passed before they were paid. They'll be cancelled automatically.",
  },
  {
    target: "bookings-upcoming",
    title: "Coming up",
    body: "Your upcoming bookings, soonest first. Open one for details and tickets, or cancel it.",
  },
  {
    title: "That's it",
    body: "Replay this tour any time with the flag button in the top bar.",
  },
];
