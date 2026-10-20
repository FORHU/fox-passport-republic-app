import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

import {
  DESTINATIONS,
  buildEventLocations,
  buildStops,
  eventLocationCollection,
  formatCoords,
  loadLandingEvents,
  mergeLocationsByCity,
  type LandingEvent,
  type LandingEventLocation,
  type LandingVenue,
} from "@/features/landing/journey/data";
import {
  destinationEventCards,
  featuredEventForKind,
  HeroSearch,
  oneOfEachKind,
} from "@/features/landing/journey/booking";
import {
  CITY_LIGHTS_RASTER_SOURCE,
  CITY_LIGHTS_RASTER_PAINT,
  applyJourneyMapTheme,
  closestVisibleEventLocation,
  getVisibleEventCalloutPlacements,
  getEventCalloutPlacement,
  isEventCalloutInsideMap,
  projectEventLocation,
} from "@/features/landing/journey/JourneyHero";
import { Lightbox } from "@/features/landing/journey/Lightbox";

describe("landing tour data", () => {
  it("gives every feature a credited photo, and the card turns through them", () => {
    expect(DESTINATIONS.length).toBeGreaterThanOrEqual(4);
    for (const d of DESTINATIONS) {
      expect(d.features).toHaveLength(4);
      expect(d.photos).toEqual(d.features.map((f) => f.photo));
      for (const p of d.photos) {
        expect(p.alt).toBeTruthy();
        expect(p.credit.author).toBeTruthy();
        expect(p.credit.license).toBe("Unsplash License");
        expect(p.credit.url).toMatch(/^https:\/\/unsplash\.com\/photos\/[\w-]+$/);
      }
    }
    expect(DESTINATIONS[3].features[0]).toMatchObject({
      label: "QR check-in",
      photo: { src: "/features/qr-check-in.jpg" },
    });
  });

  it("locates real events at matching capital cities and venue cities", () => {
    const venue: LandingVenue = {
      id: "venue-cebu",
      name: "Cebu venue",
      city: "Cebu City",
      category: "indoor",
      lat: 10.3157,
      lng: 123.8854,
    };
    const events: LandingEvent[] = [
      {
        id: "manila-event",
        name: "Manila Night",
        targetCity: "Manila",
        targetCountry: "Philippines",
      },
      {
        id: "cebu-event",
        name: "Cebu Night",
        targetCity: "CEBU",
        targetCountry: "Philippines",
      },
      {
        id: "unknown-event",
        name: "Unknown City Night",
        targetCity: "Atlantis",
      },
    ];

    const locations = buildEventLocations(events, [venue]);

    expect(locations.map((location) => location.city)).toEqual([
      "Manila",
      "CEBU",
    ]);
    expect(locations[0]).toMatchObject({
      lat: 14.5995,
      lng: 120.9842,
      events: [{ id: "manila-event" }],
    });
    expect(locations[1]).toMatchObject({
      lat: venue.lat,
      lng: venue.lng,
      events: [{ id: "cebu-event" }],
    });
    expect(eventLocationCollection(locations).features).toHaveLength(2);
  });

  it("locates events in any seeded country using their event coordinates", () => {
    const events: LandingEvent[] = [
      {
        id: "new-york-1",
        name: "New York Birthday",
        targetCity: "New York",
        targetCountry: "United States",
        lat: 40.7128,
        lng: -74.006,
      },
      {
        id: "london-1",
        name: "London Wedding",
        targetCity: "London",
        targetCountry: "United Kingdom",
        lat: 51.5072,
        lng: -0.1276,
      },
    ];

    const locations = buildEventLocations(events, []);

    expect(locations).toMatchObject([
      {
        city: "New York",
        country: "United States",
        lat: 40.7128,
        lng: -74.006,
        events: [{ id: "new-york-1" }],
      },
      {
        city: "London",
        country: "United Kingdom",
        lat: 51.5072,
        lng: -0.1276,
        events: [{ id: "london-1" }],
      },
    ]);
  });

  it("loads landing events across API pages up to the requested count", async () => {
    const fetchPage = vi.fn(async (page: number, pageLimit: number) =>
      Array.from({ length: pageLimit }, (_, index) => ({
        id: `event-${(page - 1) * 50 + index + 1}`,
        name: "Seeded event",
      })),
    );

    const events = await loadLandingEvents(120, fetchPage);

    expect(events).toHaveLength(120);
    expect(events[0].id).toBe("event-1");
    expect(events[119].id).toBe("event-120");
    expect(fetchPage.mock.calls).toEqual([
      [1, 50],
      [2, 50],
      [3, 20],
    ]);
  });

  // The photos live in the object store, not in public/, so there is no file
  // to stat here. This keeps a typo or a stray path from shipping; that the
  // file is actually in the bucket is checked by looking at the page.
  it("only points at feature photo paths", () => {
    for (const d of DESTINATIONS) {
      for (const p of d.photos) {
        expect(p.src, p.src).toMatch(/\/features\/[a-z0-9-]+\.jpg$/);
      }
    }
  });

  it("does not reuse a photo for two features", () => {
    const all = DESTINATIONS.flatMap((d) => d.photos.map((p) => p.src));
    expect(new Set(all).size).toBe(all.length);
  });

  it("formats a position the way a chart prints it", () => {
    expect(formatCoords(10.32, 123.89)).toBe("10.32° N · 123.89° E");
    expect(formatCoords(-33.86, -70.1)).toBe("33.86° S · 70.10° W");
  });

  it("attaches only the venues that are near a place", () => {
    const d = DESTINATIONS[0];
    const venue = (id: string, dLat: number): LandingVenue => ({
      id,
      name: id,
      city: "",
      category: "other",
      lat: d.lat + dLat,
      lng: d.lng,
    });
    const stops = buildStops([venue("near", 0.2), venue("far", 20)]);
    expect(stops[0].venues.map((v) => v.id)).toEqual(["near"]);
    expect(stops[0].count).toBe(1);
  });
});

describe("landing map theme", () => {
  it("uses a NASA VIIRS raster for realistic global city-light patterns", () => {
    expect(CITY_LIGHTS_RASTER_SOURCE).toMatchObject({
      type: "raster",
      tileSize: 256,
      maxzoom: 8,
      attribution: expect.stringContaining("NASA"),
    });
    expect(CITY_LIGHTS_RASTER_SOURCE.tiles[0]).toContain(
      "/VIIRS_CityLights_2012/",
    );
    expect(CITY_LIGHTS_RASTER_SOURCE.tiles[0]).toContain("{z}/{y}/{x}.jpg");
    expect(CITY_LIGHTS_RASTER_PAINT).toMatchObject({
      "raster-opacity": 0.48,
      "raster-contrast": 0.35,
      "raster-saturation": -0.1,
      "raster-brightness-max": 0.9,
    });
  });

  it("uses an Earth-like daylight palette in light mode", () => {
    const paint = vi.fn();
    const setFog = vi.fn();
    const setLights = vi.fn();
    const map = {
      getLayer: () => true,
      setPaintProperty: paint,
      setFog,
      setLights,
    };

    applyJourneyMapTheme(map, "light");

    expect(paint).toHaveBeenCalledWith("land", "background-color", "#a9ce8d");
    expect(paint).toHaveBeenCalledWith("water", "fill-color", "#378fca");
    expect(paint).toHaveBeenCalledWith(
      "national-park",
      "fill-color",
      "#72b65f",
    );
    expect(paint).toHaveBeenCalledWith("landuse", "fill-color", "#91c779");
    expect(setFog).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "rgb(105,184,238)",
        "high-color": "rgb(221,242,255)",
        "horizon-blend": 0.2,
        "space-color": "rgb(232,239,244)",
      }),
    );
    expect(setLights).toHaveBeenCalledWith([
      {
        id: "daylight-fill",
        type: "ambient",
        properties: { color: "#fff8e8", intensity: 0.7 },
      },
      {
        id: "daylight-sun",
        type: "directional",
        properties: {
          color: "#fff2cf",
          direction: [210, 40],
          intensity: 0.8,
          "cast-shadows": true,
          "shadow-intensity": 0.18,
        },
      },
    ]);
  });

  it("keeps the dark palette unchanged", () => {
    const paint = vi.fn();
    const setFog = vi.fn();
    const setLights = vi.fn();
    const map = {
      getLayer: () => true,
      setPaintProperty: paint,
      setFog,
      setLights,
    };

    applyJourneyMapTheme(map, "dark");

    expect(paint).toHaveBeenCalledWith("land", "background-color", "#222d3c");
    expect(paint).toHaveBeenCalledWith("water", "fill-color", "#0a101a");
    expect(setFog).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "rgb(22,32,44)",
        "horizon-blend": 0.12,
      }),
    );
    expect(setLights).toHaveBeenCalledWith(null);
  });
});

describe("rotating globe event focus", () => {
  it("focuses the nearest event city on the globe's front side", () => {
    const event = (id: string): LandingEvent => ({
      id,
      name: id,
      category: "social",
    });
    const locations: LandingEventLocation[] = [
      {
        key: "far",
        city: "Far",
        lat: 0,
        lng: 100,
        events: [event("far-event")],
      },
      {
        key: "near",
        city: "Near",
        lat: 0,
        lng: 20,
        events: [event("near-event")],
      },
      {
        key: "backside",
        city: "Backside",
        lat: 0,
        lng: 179,
        events: [event("hidden-event")],
      },
    ];
    const map = {
      getCenter: () => ({ lng: 0, lat: 0 }),
    };

    expect(closestVisibleEventLocation(map, locations)?.key).toBe("near");
  });

  it("shows multiple front-side location cards when they can fit without overlap", () => {
    const locations: LandingEventLocation[] = [
      {
        key: "west",
        city: "West",
        lat: 0,
        lng: -45,
        events: [{ id: "w", name: "West event" }],
      },
      {
        key: "center",
        city: "Center",
        lat: 0,
        lng: 0,
        events: [{ id: "c", name: "Center event" }],
      },
      {
        key: "east",
        city: "East",
        lat: 0,
        lng: 45,
        events: [{ id: "e", name: "East event" }],
      },
      {
        key: "back",
        city: "Back",
        lat: 0,
        lng: 179,
        events: [{ id: "b", name: "Back event" }],
      },
    ];
    const map = {
      getCenter: () => ({ lng: 0, lat: 0 }),
      project: ([lng]: [number, number]) => ({ x: 600 + lng * 5, y: 350 }),
    };

    const cards = getVisibleEventCalloutPlacements(map, locations, 1200, 700);

    expect(cards.map(({ location }) => location.key)).toEqual([
      "center",
      "west",
      "east",
    ]);
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const a = cards[i];
        const b = cards[j];
        expect(
          a.left < b.left + 208 &&
            a.left + 208 > b.left &&
            a.top < b.top + 80 &&
            a.top + 80 > b.top,
        ).toBe(false);
      }
    }
  });

  it("shows one card per city, however many venue points it has", () => {
    const point = (key: string, ids: string[]): LandingEventLocation => ({
      key,
      city: "Baguio",
      country: "Philippines",
      lat: 16.4,
      lng: 120.6,
      events: ids.map((id) => ({ id, name: id })),
    });
    const merged = mergeLocationsByCity([
      point("baguio:a", ["e1", "e2"]),
      point("baguio:b", ["e2", "e3", "e4"]),
      {
        key: "davao",
        city: "Davao City",
        lat: 7.1,
        lng: 125.6,
        events: [{ id: "d1", name: "d1" }],
      },
    ]);

    expect(merged.map((l) => l.key)).toEqual(["baguio:b", "davao"]);
    expect(merged[0].events.map((e) => e.id).sort()).toEqual([
      "e1",
      "e2",
      "e3",
      "e4",
    ]);
  });

  it("folds districts of one metro area into its busiest member", () => {
    const at = (
      key: string,
      city: string,
      lat: number,
      lng: number,
      count: number,
    ): LandingEventLocation => ({
      key,
      city,
      country: "Philippines",
      lat,
      lng,
      events: Array.from({ length: count }, (_, n) => ({
        id: `${key}-${n}`,
        name: key,
      })),
    });

    const merged = mergeLocationsByCity([
      at("makati", "Makati", 14.5547, 121.0244, 12),
      at("taguig", "Taguig", 14.5176, 121.0509, 5),
      at("manila", "Manila", 14.5995, 120.9842, 10),
      at("cebu", "Cebu City", 10.3157, 123.8854, 15),
    ]);

    expect(merged.map((l) => [l.city, l.events.length])).toEqual([
      ["Cebu City", 15],
      ["Makati", 27],
    ]);
  });

  it("leaves a card off rather than strung far from its pin", () => {
    // A pin boxed in on every side by the hero text and the edges of the map.
    const map = {
      getCenter: () => ({ lng: 0, lat: 0 }),
      project: () => ({ x: 600, y: 350 }),
    };
    const locations: LandingEventLocation[] = [
      {
        key: "boxed",
        city: "Boxed",
        lat: 0,
        lng: 0,
        events: [{ id: "b", name: "b" }],
      },
    ];
    const everything = { left: 0, top: 0, right: 1200, bottom: 700 };

    expect(
      getVisibleEventCalloutPlacements(map, locations, 1200, 700, everything),
    ).toEqual([]);
  });

  it("keeps a card off another card's connector", () => {
    // A connector already runs straight down onto this pin from above, so the
    // nearest spot (above it) would sit on that line.
    const placement = getEventCalloutPlacement(
      { x: 400, y: 300 },
      1200,
      700,
      undefined,
      undefined,
      { cards: [], lines: [[400, 100, 400, 300]] },
    );

    expect(placement).toMatchObject({ left: 416, top: 260 });
  });

  it("on a phone offers two compact cards, under the site header", () => {
    const locations: LandingEventLocation[] = Array.from(
      { length: 4 },
      (_, index) => ({
        key: `p-${index}`,
        city: `P${index}`,
        lat: 0,
        lng: index * 6 - 9,
        events: [{ id: `${index}`, name: "x" }],
      }),
    );
    const map = {
      getCenter: () => ({ lng: 0, lat: 0 }),
      project: ([lng]: [number, number]) => ({ x: 195 + lng * 6, y: 220 }),
    };

    const cards = getVisibleEventCalloutPlacements(map, locations, 390, 844);

    expect(cards.length).toBeLessThanOrEqual(2);
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.top).toBeGreaterThanOrEqual(88);
      expect(card.left).toBeGreaterThanOrEqual(8);
      expect(card.left + 160).toBeLessThanOrEqual(390 - 8);
    }
  });

  it("offers at most four cards, busiest places first rather than nearest", () => {
    const locations: LandingEventLocation[] = Array.from(
      { length: 6 },
      (_, index) => ({
        key: `place-${index}`,
        city: `Place ${index}`,
        lat: 0,
        lng: index * 8 - 20,
        events: Array.from({ length: index + 1 }, (_, n) => ({
          id: `${index}-${n}`,
          name: "x",
        })),
      }),
    );
    const map = {
      getCenter: () => ({ lng: 0, lat: 0 }),
      project: ([lng]: [number, number]) => ({ x: 600 + lng * 14, y: 350 }),
    };

    const cards = getVisibleEventCalloutPlacements(map, locations, 1200, 700);

    expect(cards).toHaveLength(4);
    expect(cards.map((c) => c.location.key)).toEqual([
      "place-5",
      "place-4",
      "place-3",
      "place-2",
    ]);
  });

  it("keeps a card on its pin and side while the globe turns", () => {
    const locations: LandingEventLocation[] = [
      {
        key: "a",
        city: "A",
        lat: 0,
        lng: 0,
        events: [{ id: "a", name: "a" }],
      },
      {
        key: "b",
        city: "B",
        lat: 0,
        lng: 20,
        events: [{ id: "b", name: "b" }],
      },
    ];
    const at = (centerLng: number) => ({
      getCenter: () => ({ lng: centerLng, lat: 0 }),
      project: ([lng]: [number, number]) => ({
        x: 600 + (lng - centerLng) * 8,
        y: 350,
      }),
    });

    const first = getVisibleEventCalloutPlacements(
      at(0),
      locations,
      1200,
      700,
    );
    // Turned until B is the nearer one: a distance ranking would swap them.
    const next = getVisibleEventCalloutPlacements(
      at(15),
      locations,
      1200,
      700,
      undefined,
      first,
    );

    expect(next.map((c) => c.location.key)).toEqual(
      first.map((c) => c.location.key),
    );
    for (const card of next) {
      const before = first.find((c) => c.location.key === card.location.key)!;
      expect(card.left - card.markerX).toBe(before.left - before.markerX);
      expect(card.top - card.markerY).toBe(before.top - before.markerY);
    }
  });

  it("does not offer a new card for a place still near the limb", () => {
    const locations: LandingEventLocation[] = [
      {
        key: "near",
        city: "Near",
        lat: 0,
        lng: 50,
        events: [{ id: "n", name: "n" }],
      },
      {
        key: "limb",
        city: "Limb",
        lat: 0,
        lng: 70,
        events: [{ id: "l", name: "l" }],
      },
    ];
    const map = {
      getCenter: () => ({ lng: 0, lat: 0 }),
      project: ([lng]: [number, number]) => ({ x: 600 + lng * 4, y: 350 }),
    };

    const cards = getVisibleEventCalloutPlacements(map, locations, 1200, 700);

    expect(cards.map((c) => c.location.key)).toEqual(["near"]);
  });

  it("bounds callout projection and rendering when many locations are available", () => {
    const locations: LandingEventLocation[] = Array.from(
      { length: 100 },
      (_, index) => ({
        key: `location-${index}`,
        city: `City ${index}`,
        lat: 0,
        lng: index * 0.1,
        events: [{ id: `event-${index}`, name: `Event ${index}` }],
      }),
    );
    const project = vi.fn(([_lng, _lat]: [number, number]) => ({
      x: 600,
      y: 350,
    }));
    const map = {
      getCenter: () => ({ lng: 0, lat: 0 }),
      project,
    };

    const cards = getVisibleEventCalloutPlacements(map, locations, 1200, 700);

    expect(project).toHaveBeenCalledTimes(24);
    expect(cards.length).toBeLessThanOrEqual(8);
  });

  it("projects the event callout from the exact event coordinates", () => {
    const project = vi.fn(() => ({ x: 180, y: 240 }));
    const location: LandingEventLocation = {
      key: "cebu",
      city: "Cebu City",
      lat: 10.3157,
      lng: 123.8854,
      events: [{ id: "cebu-event", name: "Cebu Night" }],
    };

    expect(projectEventLocation({ project }, location)).toEqual({
      x: 180,
      y: 240,
    });
    expect(project).toHaveBeenCalledWith([123.8854, 10.3157]);
  });

  it("keeps the compact callout within the map viewport", () => {
    expect(isEventCalloutInsideMap({ x: 500, y: 250 }, 1000, 700)).toBe(true);
    expect(isEventCalloutInsideMap({ x: 0, y: 0 }, 0, 0)).toBe(false);
    expect(isEventCalloutInsideMap({ x: 40, y: 250 }, 1000, 700)).toBe(true);
    expect(isEventCalloutInsideMap({ x: -1, y: 250 }, 1000, 700)).toBe(false);
    expect(isEventCalloutInsideMap({ x: 500, y: 701 }, 1000, 700)).toBe(false);
  });

  it("moves the callout away from hero text while keeping its connector on the point", () => {
    expect(
      getEventCalloutPlacement({ x: 450, y: 250 }, 1200, 700, {
        left: 0,
        top: 100,
        right: 600,
        bottom: 600,
      }),
    ).toEqual({
      left: 616,
      top: 210,
      edgeX: 616,
      edgeY: 250,
    });
  });
});

describe("oneOfEachKind", () => {
  const ev = (id: string, category: string): LandingEvent => ({
    id,
    name: id,
    category,
  });

  it("shows variety before repeating a kind", () => {
    const picked = oneOfEachKind(
      [
        ev("w1", "wedding"),
        ev("w2", "wedding"),
        ev("b1", "birthday"),
        ev("c1", "corporate"),
      ],
      3,
    );
    expect(picked.map((e) => e.category)).toEqual([
      "wedding",
      "birthday",
      "corporate",
    ]);
  });

  it("fills the rest with what is left, and copes with none", () => {
    expect(
      oneOfEachKind([ev("w1", "wedding"), ev("w2", "wedding")], 5),
    ).toHaveLength(2);
    expect(oneOfEachKind([], 5)).toEqual([]);
  });
});

describe("featuredEventForKind", () => {
  const ev = (id: string, category: string, image?: string): LandingEvent => ({
    id,
    name: id,
    category,
    images: image ? [{ url: image }] : [],
  });

  it("prefers an event with a photo for its kind", () => {
    const featured = featuredEventForKind(
      [
        ev("wedding-without-photo", "wedding"),
        ev("birthday", "birthday", "/birthday.jpg"),
        ev("wedding-with-photo", "wedding", "/wedding.jpg"),
      ],
      "wedding",
    );

    expect(featured?.id).toBe("wedding-with-photo");
  });

  it("falls back to the event details when no photo is available", () => {
    expect(
      featuredEventForKind([ev("wedding", "wedding")], "wedding")?.id,
    ).toBe("wedding");
    expect(featuredEventForKind([], "wedding")).toBeUndefined();
  });
});

describe("destination event cards", () => {
  const event = (
    id: string,
    category: string,
    image?: string,
  ): LandingEvent => ({
    id,
    name: id,
    category,
    images: image ? [{ url: image }] : [],
  });

  it("shows local listings first and fills missing categories with destination searches", () => {
    const destination = DESTINATIONS[0];
    const cards = destinationEventCards(destination, [
      {
        key: "nearby",
        city: destination.name,
        lat: destination.lat,
        lng: destination.lng,
        events: [
          event("wedding-no-photo", "wedding"),
          event("birthday", "birthday", "/birthday.jpg"),
          event("wedding-photo", "wedding", "/wedding.jpg"),
          event("corporate", "corporate"),
        ],
      },
      {
        key: "far",
        city: "Far away",
        lat: -33.8688,
        lng: 151.2093,
        events: [event("far-wedding", "wedding", "/far.jpg")],
      },
    ]);

    expect(cards.map(({ kind }) => kind)).toEqual([
      "wedding",
      "birthday",
      "corporate",
      "social",
    ]);
    expect(cards.slice(0, 2).map(({ event: item }) => item?.id)).toEqual([
      "wedding-photo",
      "birthday",
    ]);
    expect(cards[0].image).toBe("/wedding.jpg");
    expect(cards[1].image).toBe("/birthday.jpg");
    expect(cards.slice(2)).toEqual([
      expect.objectContaining({
        kind: "corporate",
        event: undefined,
        image: destination.photos[0].src,
      }),
      expect.objectContaining({
        kind: "social",
        event: undefined,
        image: destination.photos[0].src,
      }),
    ]);
  });

  it("keeps destination search cards when there are no local listings", () => {
    const destination = DESTINATIONS[0];
    const cards = destinationEventCards(destination, []);

    expect(cards).toHaveLength(4);
    expect(cards.every((card) => card.event === undefined)).toBe(true);
    expect(
      cards.every((card) => card.image === destination.photos[0].src),
    ).toBe(true);
  });

  it("keeps the connected event-card layout balanced at four categories", () => {
    const destination = DESTINATIONS[0];
    const cards = destinationEventCards(destination, [
      {
        key: "local",
        city: destination.name,
        lat: destination.lat,
        lng: destination.lng,
        events: [
          event("wedding", "wedding", "/wedding.jpg"),
          event("birthday", "birthday", "/birthday.jpg"),
          event("corporate", "corporate", "/corporate.jpg"),
          event("social", "social", "/social.jpg"),
        ],
      },
    ]);
    expect(cards).toHaveLength(4);
    expect(new Set(cards.map((card) => card.kind)).size).toBe(4);
  });
});

describe("HeroSearch", () => {
  it("goes to the results page with what was chosen", async () => {
    push.mockClear();
    const user = userEvent.setup();
    render(<HeroSearch />);
    await user.click(screen.getByRole("combobox", { name: "Type of event" }));
    await user.click(screen.getByRole("option", { name: /Wedding/ }));
    await user.type(screen.getByLabelText("City"), " Cebu ");
    await user.click(screen.getByRole("button", { name: "Find events" }));
    expect(push).toHaveBeenCalledTimes(1);
    const url = new URL(push.mock.calls[0][0], "http://x");
    expect(url.pathname).toBe("/packages");
    expect(url.searchParams.get("category")).toBe("wedding");
    expect(url.searchParams.get("city")).toBe("Cebu");
    expect(url.searchParams.get("label")).toBe("Cebu");
  });

  it("sends the day picked on the calendar", async () => {
    push.mockClear();
    const user = userEvent.setup();
    render(<HeroSearch />);
    await user.click(screen.getByRole("button", { name: "Date" }));
    // The last day of the month shown is never in the past.
    const days = screen
      .getAllByRole("button", { pressed: false })
      .filter(
        (b) =>
          /^\d{1,2}$/.test(b.textContent ?? "") &&
          !(b as HTMLButtonElement).disabled,
      );
    const last = days[days.length - 1];
    const day = (last.textContent ?? "").padStart(2, "0");
    await user.click(last);
    await user.click(screen.getByRole("button", { name: "Find events" }));
    const url = new URL(push.mock.calls[0][0], "http://x");
    expect(url.searchParams.get("startDate")).toMatch(
      new RegExp("^\\d{4}-\\d{2}-" + day + "$"),
    );
  });

  it("will not let a day in the past be picked", async () => {
    const user = userEvent.setup();
    render(<HeroSearch />);
    await user.click(screen.getByRole("button", { name: "Date" }));
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    const days = screen
      .getAllByRole("button")
      .filter((b) => /^\d{1,2}$/.test(b.textContent ?? ""));
    expect(days.length).toBeGreaterThan(27);
    expect(days.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });

  it("searches everything when nothing is chosen", async () => {
    push.mockClear();
    const user = userEvent.setup();
    render(<HeroSearch />);
    await user.click(screen.getByRole("button", { name: "Find events" }));
    expect(push).toHaveBeenCalledWith("/packages");
  });
});

describe("Lightbox", () => {
  const photos = [0, 1, 2].map((i) => ({
    src: `/p${i}.jpg`,
    credit: {
      author: `Author ${i}`,
      license: "CC BY 2.0",
      url: `https://x/${i}`,
    },
  }));

  it("names the photographer and moves with the arrow keys", () => {
    const onIndex = vi.fn();
    const onClose = vi.fn();
    render(
      <Lightbox
        title="Paris, France"
        photos={photos}
        index={0}
        onIndex={onIndex}
        onClose={onClose}
      />,
    );
    expect(screen.getByText(/Author 0/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onIndex).toHaveBeenLastCalledWith(1);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onIndex).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("gives the page its scroll back when it closes", () => {
    const { unmount } = render(
      <Lightbox
        title="x"
        photos={photos}
        index={0}
        onIndex={() => {}}
        onClose={() => {}}
      />,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
