"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

// ---------------------------------------------------------------------------
// What the landing page reads. Everything here is real data; the page shows
// nothing it can't back up.
// ---------------------------------------------------------------------------

export interface LandingVenue {
  id: string;
  name: string;
  city: string;
  category: string;
  lat: number;
  lng: number;
  image?: string;
}

export interface LandingEventLocation {
  key: string;
  city: string;
  country?: string;
  lat: number;
  lng: number;
  events: LandingEvent[];
}

export interface LandingEvent {
  id: string;
  name: string;
  category?: string;
  targetCity?: string;
  targetCountry?: string;
  lat?: number | null;
  lng?: number | null;
  description?: string;
  images?: { url: string }[];
  estimatedTotal?: number;
  templateVenues?: {
    venue?: {
      city?: string;
      lat?: number | null;
      lng?: number | null;
    };
  }[];
}

export interface LandingFoxer {
  id: string;
  name: string;
  city?: string;
  roles: string[];
}

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

/** Load at most 300 public templates, respecting the API's 50-item page limit. */
export async function loadLandingEvents(
  limit: number,
  fetchPage: (page: number, pageLimit: number) => Promise<LandingEvent[]>,
) {
  const target = Math.min(300, Math.max(0, Math.floor(limit)));
  const events: LandingEvent[] = [];
  let page = 1;

  while (events.length < target) {
    const pageSize = Math.min(50, target - events.length);
    const batch = await fetchPage(page, pageSize);
    events.push(...batch);
    if (batch.length < pageSize) break;
    page += 1;
  }

  return events.slice(0, target);
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
      const located = list
        .filter(
          (v) =>
            typeof v.lat === "number" &&
            typeof v.lng === "number" &&
            v.status !== "rejected",
        )
        .map((v): LandingVenue => ({
          id: v.id,
          name: v.name,
          city: v.city ?? "",
          category: v.category ?? "other",
          lat: v.lat,
          lng: v.lng,
          image:
            typeof v.images?.[0] === "string"
              ? v.images[0]
              : v.images?.[0]?.url,
        }));
      // A stray bad coordinate would send the whole map to the wrong country,
      // so keep what sits near the middle of the pack.
      const median = (n: number[]) =>
        [...n].sort((a, b) => a - b)[Math.floor(n.length / 2)] ?? 0;
      const mLat = median(located.map((v) => v.lat));
      const mLng = median(located.map((v) => v.lng));
      return located.filter(
        (v) => Math.abs(v.lat - mLat) < 12 && Math.abs(v.lng - mLng) < 12,
      );
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

/** A photo of an event, and who took it, for the credit the licence asks for. */
export interface Photo {
  src: string;
  subject?: "city";
  credit: { author: string; license: string; url: string };
}

export interface Destination {
  key: string;
  /** The kind of event to search for from here. */
  category: string;
  name: string;
  region: string;
  /** The kind of event the place is picked for. */
  kind: string;
  /** One line on the events there. */
  tagline: string;
  lat: number;
  lng: number;
  /** Photos of events there, served from /public/destinations. */
  photos: Photo[];
}

/**
 * The tour, in the order the plane flies it, eastward from Washington, D.C. round to
 * Tokyo: capital cities, each with the kinds of event it is known for. The point
 * is the events, not the travel; the map only shows they happen everywhere.
 * Photos are from Wikimedia Commons under Creative Commons licences, credited on
 * screen.
 */
export const DESTINATIONS: Destination[] = [
  {
    key: "washington",
    category: "social",
    name: "Washington, D.C.",
    region: "United States",
    kind: "Arena concerts",
    tagline: "Arena nights, Pride and open-air shows in the capital.",
    lat: 38.9072,
    lng: -77.0369,
    photos: [
      {
        src: "/destinations/washington-city.jpg",
        subject: "city",
        credit: {
          author:
            "U.S. Navy photo by Photographer's Mate 2nd Class Daniel J. McLain",
          license: "Public domain",
          url: "https://commons.wikimedia.org/wiki/File:US_Navy_040709-N-0295M-004_The_Washington_Monument_and_Thomas_Jefferson_Memorial_fill_the_skyline_of_Washington,_D.C.jpg",
        },
      },
      {
        src: "/destinations/washington-1.jpg",
        credit: {
          author: "Ted Eytan",
          license: "CC BY-SA 2.0",
          url: "https://commons.wikimedia.org/wiki/File:Justin_Timberlake_-_The_2020_Experience_World_Tour_-_Washington_-_03.jpg",
        },
      },
      {
        src: "/destinations/washington-2.jpg",
        credit: {
          author: "Mrs. Gemstone",
          license: "CC BY-SA 2.0",
          url: "https://commons.wikimedia.org/wiki/File:Muse_Concert_-_Verizon_Center_-_February_1,_2016_-_24554291014.jpg",
        },
      },
      {
        src: "/destinations/washington-3.jpg",
        credit: {
          author: "Ted Eytan",
          license: "CC BY-SA 2.0",
          url: "https://commons.wikimedia.org/wiki/File:2018.06.10_Alessia_Cara_at_the_Capital_Pride_Concert_with_a_Sony_A7III,_Washington,_DC_USA_03656_(42017806694).jpg",
        },
      },
      {
        src: "/destinations/washington-4.jpg",
        credit: {
          author: "Danazar",
          license: "CC BY-SA 4.0",
          url: "https://commons.wikimedia.org/wiki/File:Imagine_Dragons_July_6_2015_Verizon_Center.jpg",
        },
      },
    ],
  },
  {
    key: "paris",
    category: "social",
    name: "Paris",
    region: "France",
    kind: "Stadium and arena tours",
    tagline: "From the Stade de France to fireworks over the Eiffel Tower.",
    lat: 48.8566,
    lng: 2.3522,
    photos: [
      {
        src: "/destinations/paris.jpg",
        credit: {
          author: "U2start",
          license: "CC BY 2.0",
          url: "https://commons.wikimedia.org/wiki/File:U2_in_Paris,_Dec_7_2015_(22980099304).jpg",
        },
      },
      {
        src: "/destinations/paris-1.jpg",
        credit: {
          author: "Like tears in rain",
          license: "CC BY-SA 4.0",
          url: "https://commons.wikimedia.org/wiki/File:Rihanna_au_Stade_de_France.jpg",
        },
      },
      {
        src: "/destinations/paris-2.jpg",
        credit: {
          author: "Syced",
          license: "CC0",
          url: "https://commons.wikimedia.org/wiki/File:F%C3%AAte_de_la_Musique_2008,_Paris.jpg",
        },
      },
      {
        src: "/destinations/paris-3.jpg",
        credit: {
          author: "Kenneth Lu",
          license: "CC BY 2.0",
          url: "https://commons.wikimedia.org/wiki/File:Eiffel_Tower_fireworks_on_Bastille_Day_2017_(36303814041).jpg",
        },
      },
    ],
  },
  {
    key: "male",
    category: "wedding",
    name: "Malé",
    region: "Maldives",
    kind: "Weddings and celebrations",
    tagline:
      "Island weddings and city celebrations in the heart of the Maldives.",
    lat: 4.1755,
    lng: 73.5093,
    photos: [
      {
        src: "/destinations/maldives.jpg",
        credit: {
          author: "Shifaaz shamoon sotti",
          license: "CC0",
          url: "https://commons.wikimedia.org/wiki/File:Maldives_wedding_(Unsplash).jpg",
        },
      },
      {
        src: "/destinations/male-1.jpg",
        credit: {
          author: "Ibrahim Asad",
          license: "CC BY 3.0",
          url: "https://commons.wikimedia.org/wiki/File:Wedding_Couple_in_Maldives_palm_beach_-_panoramio.jpg",
        },
      },
      {
        src: "/destinations/male-2.jpg",
        credit: {
          author: "The President's Office, Maldives",
          license: "CC BY 4.0",
          url: "https://commons.wikimedia.org/wiki/File:Eid_lights_in_the_Maldives.jpg",
        },
      },
      {
        src: "/destinations/male-3.jpg",
        credit: {
          author: "The President's Office, Maldives",
          license: "CC BY 4.0",
          url: "https://commons.wikimedia.org/wiki/File:Flag_hoisting_repbulic_square_national_day_2025.jpg",
        },
      },
    ],
  },
  {
    key: "manila",
    category: "social",
    name: "Manila",
    region: "Philippines",
    kind: "Concerts and festivals",
    tagline:
      "Arena concerts, Pride and processions with crowds that fill the street.",
    lat: 14.5995,
    lng: 120.9842,
    photos: [
      {
        src: "/destinations/manila-1.jpg",
        credit: {
          author: "Patrick Cristiano",
          license: "CC BY-SA 4.0",
          url: "https://commons.wikimedia.org/wiki/File:Sam_Smith%27s_The_Thrill_of_It_All_Tour_in_Manila.jpg",
        },
      },
      {
        src: "/destinations/manila-2.jpg",
        credit: {
          author: "Patrick Cristiano",
          license: "CC BY-SA 4.0",
          url: "https://commons.wikimedia.org/wiki/File:Mariah_Carey_at_the_SM_Mall_of_Asia_Arena_in_2025.jpg",
        },
      },
      {
        src: "/destinations/manila-3.jpg",
        credit: {
          author: "Sean Ronquillo",
          license: "CC BY-SA 4.0",
          url: "https://commons.wikimedia.org/wiki/File:Black_Nazarene_Traslacion_Quezon_Boulevard_4.jpg",
        },
      },
      {
        src: "/destinations/manila-4.jpg",
        credit: {
          author: "Pandekate",
          license: "CC BY-SA 4.0",
          url: "https://commons.wikimedia.org/wiki/File:2019_Metro_Manila_Pride_1.jpg",
        },
      },
    ],
  },
  {
    key: "tokyo",
    category: "social",
    name: "Tokyo",
    region: "Japan",
    kind: "Festivals and fireworks",
    tagline: "Summer Sonic, Sumida fireworks and a Dome full of fans.",
    lat: 35.6762,
    lng: 139.6503,
    photos: [
      {
        src: "/destinations/tokyo-1.jpg",
        credit: {
          author: "LuxTonnerre",
          license: "CC BY 2.0",
          url: "https://commons.wikimedia.org/wiki/File:Marine_Stage_at_Summer_Sonic_Festival.jpg",
        },
      },
      {
        src: "/destinations/tokyo-2.jpg",
        credit: {
          author: "Dick Thomas Johnson",
          license: "CC BY 2.0",
          url: "https://commons.wikimedia.org/wiki/File:Sumidagawa_Fireworks_Festival_2023_(53329043888).jpg",
        },
      },
      {
        src: "/destinations/tokyo-3.jpg",
        credit: {
          author: "Guilhem Vellut",
          license: "CC BY 2.0",
          url: "https://commons.wikimedia.org/wiki/File:Sanja_Matsuri_@_Asakusa_(14228881562).jpg",
        },
      },
      {
        src: "/destinations/tokyo-4.jpg",
        credit: {
          author: "nagi usano",
          license: "CC BY 2.0",
          url: "https://commons.wikimedia.org/wiki/File:BiSH_%22Bye-Bye_Show_for_Never%22_in_Tokyo_Dome.jpg",
        },
      },
    ],
  },
];

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
