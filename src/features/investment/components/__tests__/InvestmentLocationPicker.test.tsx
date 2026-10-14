import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InvestmentLocationPicker from "../InvestmentLocationPicker";
import * as mapboxLib from "@/shared/lib/mapbox";

vi.mock("@/shared/hooks/useUserLocation", () => ({
  useUserLocation: () => ({
    coords: [120.9842, 14.5995],
    country: "Philippines",
    countryCode: "PH",
    city: "Manila",
    isDetected: true,
    locateMe: vi.fn(),
    isLoading: false,
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
    setLngLat = vi.fn().mockReturnThis();
    addTo = vi.fn().mockReturnThis();
    on = vi.fn().mockReturnThis();
    remove = vi.fn();
    getLngLat = vi.fn().mockReturnValue({ lng: 120.9842, lat: 14.5995 });
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
