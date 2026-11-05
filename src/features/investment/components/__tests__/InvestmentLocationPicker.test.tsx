import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InvestmentLocationPicker from "../InvestmentLocationPicker";
import * as mapboxLib from "@/shared/lib/mapbox";

// Mutable so a test can play the hook finishing a `locateMe()`.
const mocks = vi.hoisted(() => ({
  location: {
    coords: [120.9842, 14.5995] as [number, number],
    isLoading: false,
    locateMe: (() => {}) as () => void,
  },
  markers: [] as Array<{
    handlers: Record<string, () => void>;
    getLngLat: { mockReturnValue: (v: { lng: number; lat: number }) => void };
  }>,
}));

vi.mock("@/shared/hooks/useUserLocation", () => ({
  useUserLocation: () => ({
    coords: mocks.location.coords,
    country: "Philippines",
    countryCode: "PH",
    city: "Manila",
    isDetected: true,
    locateMe: mocks.location.locateMe,
    isLoading: mocks.location.isLoading,
  }),
}));

vi.mock("mapbox-gl", () => {
  class MockMap {
    addControl = vi.fn();
    on = vi.fn();
    flyTo = vi.fn();
    remove = vi.fn();
  }
  class MockMarker {
    handlers: Record<string, () => void> = {};
    setLngLat = vi.fn().mockReturnThis();
    addTo = vi.fn().mockReturnThis();
    on = vi.fn((event: string, cb: () => void) => {
      this.handlers[event] = cb;
      return this;
    });
    remove = vi.fn();
    getLngLat = vi.fn().mockReturnValue({ lng: 120.9842, lat: 14.5995 });
    constructor() {
      mocks.markers.push(this);
    }
  }
  class MockNavigationControl {}
  class MockGeolocateControl {}

  return {
    default: {
      Map: MockMap,
      Marker: MockMarker,
      NavigationControl: MockNavigationControl,
      GeolocateControl: MockGeolocateControl,
      accessToken: "",
    },
  };
});

describe("InvestmentLocationPicker", () => {
  const initialValue = {
    lat: 14.5995,
    lng: 120.9842,
    address: "Unit 12, Tech Center",
    city: "Makati",
    state: "Metro Manila",
    country: "Philippines",
    deliveryRadiusKm: 25,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(mapboxLib, "getEffectiveMapboxToken").mockReturnValue("test-mapbox-token");
    mocks.markers.length = 0;
    mocks.location.coords = [120.9842, 14.5995];
    mocks.location.isLoading = false;
    mocks.location.locateMe = vi.fn();
  });

  /** Holds the value like the wizard does, so later edits are visible. */
  function StatefulPicker({ onLatest }: { onLatest: (v: typeof initialValue) => void }) {
    const [value, setValue] = React.useState(initialValue);
    return (
      <InvestmentLocationPicker
        value={value}
        onChange={(next) => {
          setValue(next);
          onLatest(next);
        }}
        isPhysical={true}
      />
    );
  }

  async function dragPinTo(lng: number, lat: number) {
    await waitFor(() => expect(mocks.markers.length).toBe(1));
    const marker = mocks.markers[0];
    marker.getLngLat.mockReturnValue({ lng, lat });
    React.act(() => marker.handlers.dragend());
  }

  it("saves a dragged pin's coordinates even without a geocoding token", async () => {
    vi.spyOn(mapboxLib, "getEffectiveMapboxToken").mockReturnValue("");
    const handleChange = vi.fn();
    render(
      <InvestmentLocationPicker
        value={{ ...initialValue, lat: 10, lng: 120 }}
        onChange={handleChange}
        isPhysical={true}
      />,
    );

    await dragPinTo(121.05, 14.55);

    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        lat: 14.55,
        lng: 121.05,
        address: "Unit 12, Tech Center",
      }),
    );
  });

  it("a late reverse geocode keeps edits made while it was in flight", async () => {
    let resolveFetch!: (v: unknown) => void;
    global.fetch = vi.fn(
      () => new Promise((resolve) => (resolveFetch = resolve)),
    ) as any;
    const onLatest = vi.fn();
    render(<StatefulPicker onLatest={onLatest} />);

    await dragPinTo(121.05, 14.55);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "50" } });

    await React.act(async () => {
      resolveFetch({
        ok: true,
        json: async () => ({
          features: [
            { place_name: "5th Ave, Taguig", place_type: ["address"], text: "5th Ave" },
            { place_name: "Taguig", place_type: ["place"], text: "Taguig" },
          ],
        }),
      });
    });

    await waitFor(() =>
      expect(onLatest).toHaveBeenLastCalledWith(
        expect.objectContaining({
          lat: 14.55,
          lng: 121.05,
          address: "5th Ave, Taguig",
          city: "Taguig",
          deliveryRadiusKm: 50,
        }),
      ),
    );
  });

  it("Center on Me saves the located position, not the previous one", async () => {
    vi.spyOn(mapboxLib, "getEffectiveMapboxToken").mockReturnValue("");
    // jsdom has no geolocation; the real hook needs it to report back.
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition: vi.fn() },
    });
    const handleChange = vi.fn();
    const props = {
      value: { ...initialValue, lat: 10, lng: 120 },
      onChange: handleChange,
      isPhysical: true,
    };
    const { rerender } = render(<InvestmentLocationPicker {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Center on Me/i }));
    expect(mocks.location.locateMe).toHaveBeenCalled();
    expect(handleChange).not.toHaveBeenCalled();

    // The hook finishes locating.
    mocks.location.coords = [121.2, 14.8];
    rerender(<InvestmentLocationPicker {...props} />);

    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ lat: 14.8, lng: 121.2 }),
    );
    delete (navigator as { geolocation?: unknown }).geolocation;
  });

  it("Center on Me without geolocation saves the detected fallback at once", () => {
    vi.spyOn(mapboxLib, "getEffectiveMapboxToken").mockReturnValue("");
    mocks.location.coords = [121.0, 14.6];
    const handleChange = vi.fn();
    render(
      <InvestmentLocationPicker
        value={{ ...initialValue, lat: 10, lng: 120 }}
        onChange={handleChange}
        isPhysical={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Center on Me/i }));

    expect(mocks.location.locateMe).not.toHaveBeenCalled();
    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ lat: 14.6, lng: 121.0 }),
    );
  });

  it("renders location inputs and coverage radius slider when isPhysical is true", () => {
    const handleChange = vi.fn();

    render(
      <InvestmentLocationPicker
        value={initialValue}
        onChange={handleChange}
        isPhysical={true}
      />,
    );

    expect(screen.getByPlaceholderText(/Search address or depot area/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Unit 12, Tech Center")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Makati")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Philippines")).toBeInTheDocument();
    expect(screen.getByText(/Dispatch & Delivery Coverage Radius/i)).toBeInTheDocument();
    expect(screen.getByText("25 km coverage")).toBeInTheDocument();
  });

  it("triggers onChange when the user updates street address", () => {
    const handleChange = vi.fn();

    render(
      <InvestmentLocationPicker
        value={initialValue}
        onChange={handleChange}
        isPhysical={true}
      />,
    );

    const addressInput = screen.getByDisplayValue("Unit 12, Tech Center");
    fireEvent.change(addressInput, { target: { value: "Warehouse 8, Harbor Yard" } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "Warehouse 8, Harbor Yard",
      }),
    );
  });

  it("triggers onChange when delivery radius slider changes", () => {
    const handleChange = vi.fn();

    render(
      <InvestmentLocationPicker
        value={initialValue}
        onChange={handleChange}
        isPhysical={true}
      />,
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "50" } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryRadiusKm: 50,
      }),
    );
  });

  it("searches and renders autocomplete suggestions with debounce", async () => {
    const handleChange = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            id: "feat-1",
            place_name: "BGC Arts Center, Taguig",
            center: [121.0503, 14.5515],
            context: [
              { id: "place.1", text: "Taguig" },
              { id: "region.1", text: "Metro Manila" },
              { id: "country.1", text: "Philippines" },
            ],
          },
        ],
      }),
    } as any);

    render(
      <InvestmentLocationPicker
        value={initialValue}
        onChange={handleChange}
        isPhysical={true}
      />,
    );

    const searchInput = screen.getByPlaceholderText(/Search address or depot area/i);
    fireEvent.change(searchInput, { target: { value: "BGC Arts" } });

    await waitFor(() => {
      expect(screen.getByText("BGC Arts Center, Taguig")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("BGC Arts Center, Taguig"));

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: 14.5515,
        lng: 121.0503,
        address: "BGC Arts Center, Taguig",
        city: "Taguig",
        state: "Metro Manila",
        country: "Philippines",
      }),
    );
  });
});
