import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { VenuesMapPageClient } from "../VenuesMapPageClient";
import {
  fetchVenuesByViewport,
  fetchVenuesNear,
} from "@/features/venue/api/venues";

// Props the page hands the (mocked) map, so tests can drive camera events.
let mapProps: any = null;

vi.mock("@/shared/components/ui/VenuesMap", () => ({
  CATEGORY_COLORS: {},
  CATEGORY_LABELS: {},
  VenuesMap: (props: any) => {
    mapProps = props;
    return null;
  },
}));
vi.mock("@/features/venue/api/venues", () => ({
  fetchVenuesByViewport: vi.fn(),
  fetchVenuesNear: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn() }) }));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/link", () => ({
  default: ({ href, children, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));
vi.mock("@/shared/components/ui/Money", () => ({ Money: () => null }));
vi.mock("@/shared/components/ui/BackButton", () => ({ BackButton: () => null }));
vi.mock("@/features/landing/components/sections/LandingHeader", () => ({
  default: () => null,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const byViewport = vi.mocked(fetchVenuesByViewport);
const near = vi.mocked(fetchVenuesNear);

const venues = (prefix: string, n: number, from = 1) =>
  Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-${from + i}`,
    title: `${prefix} ${from + i}`,
    lat: 14,
    lng: 121,
  }));

const VIEW = { north: 15, south: 14, east: 122, west: 121 };

// List fetches ask for 12; the lightweight map-pin fetch asks for 1000.
const listCalls = () =>
  byViewport.mock.calls.map((c) => c[0]).filter((q: any) => q.limit === 12);

function moveMap(bounds: typeof VIEW, reason: string) {
  act(() => {
    mapProps.onViewportChange(bounds, { reason });
  });
}

async function renderWithViewport(total = 30) {
  byViewport.mockImplementation(async (q: any) => ({
    venues:
      q.limit === 12 ? venues("Venue", 12, (q.page - 1) * 12 + 1) : [],
    total,
  }));
  render(<VenuesMapPageClient venues={[]} />);
  moveMap(VIEW, "user");
  await screen.findByText("Page 1 of 3", {}, { timeout: 2000 });
}

beforeEach(() => {
  mapProps = null;
  byViewport.mockReset();
  near.mockReset();
  Element.prototype.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

describe("VenuesMapPageClient list paging", () => {
  it("doesn't load another page when the list is scrolled", async () => {
    await renderWithViewport();
    const before = listCalls().length;

    const list = screen.getByText("Venue 1").closest(".overflow-y-auto")!;
    fireEvent.scroll(list, { target: { scrollTop: 5000 } });
    await new Promise((r) => setTimeout(r, 400));

    expect(listCalls()).toHaveLength(before);
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });

  it("changes page only from Next and Prev, with the list's own bounds", async () => {
    await renderWithViewport();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByText("Page 2 of 3");
    expect(screen.getByText("Venue 13")).toBeInTheDocument();
    expect(listCalls().at(-1)).toMatchObject({ ...VIEW, page: 2 });

    fireEvent.click(screen.getByRole("button", { name: /prev/i }));
    await screen.findByText("Page 1 of 3");
    expect(listCalls().at(-1)).toMatchObject({ ...VIEW, page: 1 });
  });

  it("ignores selection and resize camera moves for the list", async () => {
    await renderWithViewport();
    const before = listCalls().length;

    moveMap({ north: 14.5, south: 14.4, east: 121.5, west: 121.4 }, "selection");
    moveMap({ north: 16, south: 13, east: 123, west: 120 }, "resize");
    await new Promise((r) => setTimeout(r, 400));

    expect(listCalls()).toHaveLength(before);
    expect(screen.getByText("Venue 1")).toBeInTheDocument();
  });

  it("pages within a pinned searched location, not the live viewport", async () => {
    await renderWithViewport();

    act(() => {
      mapProps.onLocationSelect({
        name: "Baguio",
        placeName: "Baguio, Philippines",
        center: [120.6, 16.4],
        bbox: [120.5, 16.3, 120.7, 16.5],
        placeType: "place",
      });
    });
    await waitFor(
      () =>
        expect(listCalls().at(-1)).toMatchObject({ west: 120.5, page: 1 }),
      { timeout: 2000 },
    );
    await screen.findByText("Page 1 of 3");
    // A pan while the location is pinned doesn't change what Next pages.
    moveMap(VIEW, "user");

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByText("Page 2 of 3");
    expect(listCalls().at(-1)).toMatchObject({
      west: 120.5,
      south: 16.3,
      east: 120.7,
      north: 16.5,
      page: 2,
    });
  });

  it("pages near-me results from the near-me list, without a viewport fetch", async () => {
    await renderWithViewport();
    near.mockResolvedValue(venues("Near", 30));
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (ok: any) =>
          ok({ coords: { latitude: 14.5, longitude: 121.5 } }),
      },
    });

    fireEvent.click(
      screen.getByTitle(/service area covers your current location/i),
    );
    await screen.findByText("Near 1");
    expect(screen.queryByText("Near 13")).not.toBeInTheDocument();
    const before = listCalls().length;

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await screen.findByText("Near 13");
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    expect(screen.queryByText("Near 1")).not.toBeInTheDocument();
    expect(listCalls()).toHaveLength(before);
  });

  it("drops a page response that arrives after a newer pan", async () => {
    await renderWithViewport();

    let resolvePage!: (v: any) => void;
    byViewport.mockImplementationOnce(
      () => new Promise((r) => (resolvePage = r)),
    );
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    byViewport.mockImplementation(async (q: any) => ({
      venues: q.limit === 12 ? venues("Panned", 12) : [],
      total: 12,
    }));
    moveMap({ north: 20, south: 19, east: 125, west: 124 }, "user");
    await screen.findByText("Panned 1", {}, { timeout: 2000 });

    await act(async () => {
      resolvePage({ venues: venues("Stale", 12), total: 30 });
    });
    expect(screen.queryByText("Stale 1")).not.toBeInTheDocument();
    expect(screen.getByText("Panned 1")).toBeInTheDocument();
  });
});
