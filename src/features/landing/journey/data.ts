"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { assetUrl } from "@/shared/lib/assets";

// ---------------------------------------------------------------------------
// What the landing page reads. Everything here is real data; the page shows
// nothing it can't back up.
// ---------------------------------------------------------------------------

export {
  filterLandingVenues,
  loadLandingEvents,
  type LandingEvent,
  type LandingEventLocation,
  type LandingFoxer,
  type LandingVenue,
} from "@/shared/data/landingJourney";
import {
  filterLandingVenues,
  loadLandingEvents,
  type LandingEvent,
  type LandingEventLocation,
  type LandingFoxer,
  type LandingVenue,
} from "@/shared/data/landingJourney";

const TEN_MINUTES = 1000 * 60 * 10;

/** The number of verified Foxers. */
export function useFoxerTotal() {
  const { data } = useQuery({
    queryKey: ["landing", "foxer-total"],
    queryFn: async () => {
      const res = await api.get("/users/foxers", {
        params: { limit: 1, page: 1 },
      });
      return (res.data?.pagination?.total ?? 0) as number;
    },
    staleTime: TEN_MINUTES,
  });
  return data ?? 0;
}

export function useFoxers(limit = 12) {
  const { data } = useQuery({
    queryKey: ["landing", "foxers", limit],
    queryFn: async () => {
      const res = await api.get("/users/foxers", {
        params: { limit, page: 1 },
      });
      return ((res.data?.data ?? []) as any[]).map((f): LandingFoxer => ({
        id: f.id,
        name: f.name,
        city: f.city ?? undefined,
        roles: f.roleType ?? [],
      }));
    },
    staleTime: TEN_MINUTES,
  });
  return data ?? [];
}

/** Events open to book, with whether they are still loading or failed. */
export function useEventsQuery(limit = 12) {
  return useQuery({
    queryKey: ["landing", "events", limit],
    queryFn: () =>
      loadLandingEvents(limit, async (page, pageLimit) => {
        const res = await api.get("/event-templates/browse", {
          params: { page, limit: pageLimit },
        });
        return (res.data?.data ?? []) as LandingEvent[];
      }),
    staleTime: TEN_MINUTES,
  });
}

export function useEvents(limit = 12) {
  return useEventsQuery(limit).data ?? [];
}

/** The venues that have a real location on the map. */
export function useVenues(limit = 80) {
  const { data } = useQuery({
    queryKey: ["landing", "venues", limit],
    queryFn: async () => {
      const res = await api.get("/venues", { params: { limit } });
      const list: any[] = res.data?.venues ?? res.data?.data ?? [];
      return filterLandingVenues(list);
    },
    staleTime: TEN_MINUTES,
  });
  return data ?? [];
}

const normalizePlace = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/city$/, "");

/**
 * Locate bookable event templates using their own coordinates, real venue
 * coordinates, or a matching capital-city tour stop.
 */
export function buildEventLocations(
  events: LandingEvent[],
  venues: LandingVenue[],
): LandingEventLocation[] {
  const locations = new Map<string, LandingEventLocation>();

  for (const event of events) {
    const city =
      event.targetCity?.trim() ||
      event.templateVenues
        ?.find((item) => item.venue?.city)
        ?.venue?.city?.trim();
    if (!city) continue;

    const cityKey = normalizePlace(city);
    const country = event.targetCountry?.trim();
    const coordinates: { lat: number; lng: number }[] = [];

    if (
      typeof event.lat === "number" &&
      Number.isFinite(event.lat) &&
      event.lat >= -90 &&
      event.lat <= 90 &&
      typeof event.lng === "number" &&
      Number.isFinite(event.lng) &&
      event.lng >= -180 &&
      event.lng <= 180
    ) {
      coordinates.push({ lat: event.lat, lng: event.lng });
    }

    if (coordinates.length === 0) {
      for (const item of event.templateVenues ?? []) {
        const venue = item.venue;
        if (
          venue &&
          normalizePlace(venue.city ?? "") === cityKey &&
          typeof venue.lat === "number" &&
          typeof venue.lng === "number"
        ) {
          coordinates.push({ lat: venue.lat, lng: venue.lng });
        }
      }
    }

    if (coordinates.length === 0) {
      for (const venue of venues) {
        if (normalizePlace(venue.city) === cityKey) {
          coordinates.push({ lat: venue.lat, lng: venue.lng });
        }
      }
    }

    if (coordinates.length === 0) {
      const capital = DESTINATIONS.find(
        (destination) =>
          normalizePlace(destination.name) === cityKey &&
          (!country ||
            normalizePlace(destination.region) === normalizePlace(country)),
      );
      if (capital) coordinates.push({ lat: capital.lat, lng: capital.lng });
    }

    for (const coordinate of coordinates) {
      const key = `${cityKey}:${coordinate.lat.toFixed(3)}:${coordinate.lng.toFixed(3)}`;
      let location = locations.get(key);
      if (!location) {
        location = {
          key,
          city,
          country,
          ...coordinate,
          events: [],
        };
        locations.set(key, location);
      }
      if (!location.events.some((item) => item.id === event.id)) {
        location.events.push(event);
      }
    }
  }

  return Array.from(locations.values());
}

/** Places closer than this are one stop on a globe: Makati and Taguig are Manila. */
const NEARBY_DEGREES = 0.5;

function poolLocations(group: LandingEventLocation[]): LandingEventLocation {
  if (group.length === 1) return group[0];
  const seen = new Set<string>();
  const events = group
    .flatMap((location) => location.events)
    .filter((event) => !seen.has(event.id) && !!seen.add(event.id));
  // The pin - and the key the cards are tracked by - is the point holding the
  // most events (ties go to the first), so it stays put from frame to frame.
  const pin = group.reduce((best, location) =>
    location.events.length > best.events.length ? location : best,
  );
  return { ...pin, events };
}

function isNearby(a: LandingEventLocation, b: LandingEventLocation) {
  const cos = Math.cos((((a.lat + b.lat) / 2) * Math.PI) / 180);
  return Math.hypot(a.lat - b.lat, (a.lng - b.lng) * cos) < NEARBY_DEGREES;
}

/**
 * One location per stop, with every event around it pooled.
 *
 * `buildEventLocations` keeps a separate point per venue coordinate, which is
 * right for the dots on the map but wrong for the callout cards: a city with
 * three venues got three cards that all read "Baguio · 9 events", and a metro
 * area split into districts (Manila, Makati, Taguig) got a card for each.
 * Points of one city are pooled first, then cities within `NEARBY_DEGREES` of
 * a busier one are folded into it.
 */
export function mergeLocationsByCity(
  locations: LandingEventLocation[],
): LandingEventLocation[] {
  const groups = new Map<string, LandingEventLocation[]>();
  for (const location of locations) {
    const id = `${normalizePlace(location.city)}|${normalizePlace(location.country ?? "")}`;
    const group = groups.get(id);
    if (group) group.push(location);
    else groups.set(id, [location]);
  }

  // Busiest first, so the anchor of a cluster is its biggest member, and the
  // result doesn't depend on the order the API happened to return things in.
  const pooled = Array.from(groups.values())
    .map(poolLocations)
    .sort(
      (a, b) =>
        b.events.length - a.events.length || a.key.localeCompare(b.key),
    );

  const taken = new Set<LandingEventLocation>();
  const stops: LandingEventLocation[] = [];
  for (const anchor of pooled) {
    if (taken.has(anchor)) continue;
    const cluster = pooled.filter(
      (location) =>
        !taken.has(location) &&
        (location === anchor || isNearby(anchor, location)),
    );
    cluster.forEach((location) => taken.add(location));
    stops.push(poolLocations(cluster));
  }
  return stops;
}

export function eventLocationCollection(locations: LandingEventLocation[]) {
  return {
    type: "FeatureCollection" as const,
    features: locations.map((location) => ({
      type: "Feature" as const,
      properties: {
        name: location.city,
        count: location.events.length,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [location.lng, location.lat],
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------

/** A photo that illustrates a feature, and who took it, for the credit line. */
export interface Photo {
  src: string;
  /** What the photo shows, for screen readers. */
  alt?: string;
  credit: { author: string; license: string; url: string };
}

export interface Feature {
  label: string;
  title: string;
  /**
   * Only where a public page shows this feature. Without one the card is a
   * plain tile: a link to a page about something else reads as broken.
   */
  href?: string;
  photo: Photo;
}

export interface Destination {
  key: string;
  /** The kind of event to search for from here. */
  category: string;
  name: string;
  region: string;
  /** The step of a booking this stop presents: the card's headline. */
  kind: string;
  /** One line on that feature. */
  tagline: string;
  /** Four related features, shown as the small cards around the stop's card. */
  features: Feature[];
  lat: number;
  lng: number;
  /** The card's photos: one per feature, in the same order. */
  photos: Photo[];
}

/**
 * A free photo from Unsplash (Unsplash License: free to use, no credit
 * required, though the card still credits it). The files are in
 * public/features, and in the bucket under static/features for setups that set
 * NEXT_PUBLIC_ASSETS_URL, so the page never loads from Unsplash.
 */
const unsplash = (
  file: string,
  alt: string,
  author: string,
  id: string,
): Photo => ({
  src: assetUrl(`features/${file}.jpg`),
  alt,
  credit: {
    author,
    license: "Unsplash License",
    url: `https://unsplash.com/photos/${id}`,
  },
});

/**
 * The tour, in the order the plane flies it, eastward from Washington, D.C. round to
 * Tokyo. Each landing presents what FoxPassport does, in the order a booking goes:
 * plan, choose who to trust, know the price, the night itself, and after. Every
 * feature named here is one the platform has today, and each has a photo of
 * what it's about; the stop's card turns through those same photos.
 */
export const DESTINATIONS: Destination[] = (
  [
    {
      key: "washington",
      category: "social",
      name: "Washington, D.C.",
      region: "United States",
      kind: "Plan it in one place",
      tagline:
        "The venue, the gear and the crew for any event, found and booked in one place.",
      features: [
        {
          label: "One booking",
          title: "Venue, gear and crew in a single package",
          href: "/packages",
          photo: unsplash(
            "one-booking",
            "Round tables set with flowers and gold chairs for an event",
            "Michael Kyule",
            "rJWykl03fbA",
          ),
        },
        {
          label: "Prices up front",
          title: "See package prices before you sign up",
          href: "/packages",
          photo: unsplash(
            "prices-up-front",
            "Someone browsing on a phone in the dark",
            "Gilles Lambert",
            "pb_lF8VWaPU",
          ),
        },
        {
          label: "Every kind of event",
          title: "Weddings, birthdays, corporate and social nights",
          href: "/packages",
          photo: unsplash(
            "every-kind-of-event",
            "Guests raising a toast at a long table under string lights",
            "Al Elmes",
            "ULHxWq8reao",
          ),
        },
        {
          label: "Venue map",
          title: "Browse venues on the map",
          href: "/venues/map",
          photo: unsplash(
            "venue-map",
            "A hand placing a red pin on a city map",
            "GeoJango Maps",
            "Z8UgB80_46w",
          ),
        },
      ],
      lat: 38.9072,
      lng: -77.0369,
    },
    {
      key: "paris",
      category: "social",
      name: "Paris",
      region: "France",
      kind: "Book people you can trust",
      tagline:
        "Every venue and supplier is ID-checked and reviewed by our team before they can take a booking.",
      features: [
        {
          label: "Verified Foxers",
          title: "ID-checked and reviewed by our team",
          href: "/search",
          photo: unsplash(
            "verified-foxers",
            "Two people shaking hands",
            "Cytonn Photography",
            "n95VMLxqM2I",
          ),
        },
        {
          label: "Gear",
          title: "Sound, lights, staging and furniture to rent",
          href: "/search?type=gear",
          photo: unsplash(
            "gear",
            "Microphones, drums and keyboards on a stage under spotlights",
            "Magnus Lunay",
            "LHR6tUw8N34",
          ),
        },
        {
          label: "Talent",
          title: "Catering, design and staff, by the hour or the job",
          href: "/search?type=service",
          photo: unsplash(
            "talent",
            "Chefs plating small dishes for service",
            "Filipp Romanovski",
            "__BxlspIesw",
          ),
        },
        {
          label: "Performers",
          title: "DJs, bands, hosts and photographers",
          photo: unsplash(
            "performers",
            "A DJ's hand over a lit mixing deck",
            "Marcela Laskoski",
            "YrtFlrLo2DQ",
          ),
        },
      ],
      lat: 48.8566,
      lng: 2.3522,
    },
    {
      key: "male",
      category: "wedding",
      name: "Malé",
      region: "Maldives",
      kind: "Know the price first",
      tagline:
        "Browse complete packages with prices. You only need an account when you book.",
      features: [
        {
          label: "Package prices",
          title: "See what a full package costs",
          href: "/packages",
          photo: unsplash(
            "package-prices",
            "Someone stacking coins on a table",
            "Towfiqu barbhuiya",
            "jpqyfK7GB4w",
          ),
        },
        {
          label: "Account at booking",
          title: "Sign up only when you reserve",
          photo: unsplash(
            "account-at-booking",
            "A reserved sign on a table",
            "Alexandr Popadin",
            "tPG1lcsMZVk",
          ),
        },
        {
          label: "Cancellation policy",
          title: "See the cancellation terms before you book",
          photo: unsplash(
            "cancellation-policy",
            "An open monthly planner on a desk",
            "Eric Rothermel",
            "FoKO4DpXamQ",
          ),
        },
        {
          label: "Secure checkout",
          title: "Pay by card through Stripe",
          photo: unsplash(
            "secure-checkout",
            "Someone holding a card while paying on a laptop",
            "rupixen",
            "Q59HmzK38eQ",
          ),
        },
      ],
      lat: 4.1755,
      lng: 73.5093,
    },
    {
      key: "manila",
      category: "social",
      name: "Manila",
      region: "Philippines",
      kind: "On the night",
      tagline:
        "Your booking has a QR code. Show it at the entrance and you're checked in.",
      features: [
        {
          label: "QR check-in",
          title: "Show your booking's QR code at the door",
          photo: unsplash(
            "qr-check-in",
            "A guest's booking checked on a phone at the entrance",
            "Claudio Schwarz",
            "wMgW6bjjzZU",
          ),
        },
        {
          label: "Message your Foxers",
          title: "Chat with your host and suppliers before the day",
          photo: unsplash(
            "message-your-foxers",
            "Someone writing a message on a phone",
            "freestocks",
            "mw6Onwg4frY",
          ),
        },
        {
          label: "Booking details",
          title: "Date, venue and guests on one booking page",
          photo: unsplash(
            "booking-details",
            "A guest book held in someone's hand",
            "Erik Mclean",
            "aNZnKZKfAq8",
          ),
        },
        {
          label: "Change requests",
          title: "Ask for a change to your booking in the app",
          photo: unsplash(
            "change-requests",
            "Someone working on a laptop at dusk",
            "Thought Catalog",
            "UK78i6vK3sc",
          ),
        },
      ],
      lat: 14.5995,
      lng: 120.9842,
    },
    {
      key: "tokyo",
      category: "social",
      name: "Tokyo",
      region: "Japan",
      kind: "Keep the night",
      tagline: "Every event you attend adds a stamp to your FoxPassport.",
      features: [
        {
          label: "Passport stamps",
          title: "A stamp for every event you attend",
          photo: unsplash(
            "passport-stamps",
            "An open passport full of stamps",
            "Kit (formerly ConvertKit)",
            "htQznS-Rx7w",
          ),
        },
        {
          label: "Badges and levels",
          title: "Earn badges and level up as you go",
          photo: unsplash(
            "badges-and-levels",
            "A row of gold medals with red ribbons",
            "George Pisarevsky",
            "u-OIymmnw1s",
          ),
        },
        {
          label: "Reviews",
          title: "Review the venues and Foxers you booked",
          photo: unsplash(
            "reviews",
            "A row of glitter stars on a dark background",
            "Markus Spiske",
            "vJ_LviEnR1A",
          ),
        },
        {
          label: "Foxer Republic",
          title: "Share your night on the community feed",
          href: "/republic",
          photo: unsplash(
            "foxer-republic",
            "A fan filming the stage on a phone at a concert",
            "Noiseporn",
            "JNuKyKXLh8U",
          ),
        },
      ],
      lat: 35.6762,
      lng: 139.6503,
    },
  ] satisfies Omit<Destination, "photos">[]
).map((d) => ({ ...d, photos: d.features.map((f) => f.photo) }));

export interface Stop extends Destination {
  /** Real venues within about a hundred kilometres. */
  venues: LandingVenue[];
  count: number;
}

const NEAR_DEGREES = 1.2;

/** Each destination with the real venues near it, if there are any. */
export function buildStops(venues: LandingVenue[]): Stop[] {
  return DESTINATIONS.map((d) => {
    const cos = Math.cos((d.lat * Math.PI) / 180);
    const near = venues
      .filter(
        (v) => Math.hypot(v.lat - d.lat, (v.lng - d.lng) * cos) < NEAR_DEGREES,
      )
      // Ones with a photo first, so a card can show it.
      .sort((a, b) => Number(!!b.image) - Number(!!a.image));
    return { ...d, venues: near, count: near.length };
  });
}

const hemi = (n: number, pos: string, neg: string) => (n >= 0 ? pos : neg);

/** 10.32° N · 123.89° E — the way a chart prints a position. */
export function formatCoords(lat: number, lng: number) {
  return `${Math.abs(lat).toFixed(2)}° ${hemi(lat, "N", "S")} · ${Math.abs(
    lng,
  ).toFixed(2)}° ${hemi(lng, "E", "W")}`;
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export interface RoleInfo {
  key: string;
  /** The `roleType` value the API uses. */
  roleType: string;
  name: string;
  line: string;
  ink: "red" | "blue";
  applyHref: string;
}

export const ROLES: RoleInfo[] = [
  {
    key: "event",
    roleType: "eventFoxer",
    name: "Event Foxer",
    line: "Builds events from venues, gear and talent.",
    ink: "blue",
    applyHref: "/creator-dashboard/apply",
  },
  {
    key: "venue",
    roleType: "venueFoxer",
    name: "Venue Foxer",
    line: "Lists spaces and approves who hosts in them.",
    ink: "red",
    applyHref: "/venue-foxer/apply",
  },
  {
    key: "gear",
    roleType: "gearFoxer",
    name: "Gear Foxer",
    line: "Rents out sound, lights, staging and furniture.",
    ink: "blue",
    applyHref: "/foxer/apply?type=asset",
  },
  {
    key: "talent",
    roleType: "serviceFoxer",
    name: "Talent Foxer",
    line: "Catering, design and staff, booked by the hour or the job.",
    ink: "red",
    applyHref: "/foxer/apply?type=service",
  },
  {
    key: "performer",
    roleType: "performerFoxer",
    name: "Performer",
    line: "DJs, bands, hosts and photographers.",
    ink: "blue",
    applyHref: "/foxer/apply?type=performer",
  },
  {
    key: "organizer",
    roleType: "organizer",
    name: "Organizer",
    line: "Runs the door and the day for someone else's event.",
    ink: "red",
    applyHref: "/foxer/apply?type=organizer",
  },
  {
    key: "partner",
    roleType: "investor",
    name: "Partner",
    line: "Backs venues and events with equipment or capital.",
    ink: "blue",
    applyHref: "/foxer/apply-investor",
  },
];

export const roleName = (roleType: string) =>
  ROLES.find((r) => r.roleType === roleType)?.name ?? roleType;
