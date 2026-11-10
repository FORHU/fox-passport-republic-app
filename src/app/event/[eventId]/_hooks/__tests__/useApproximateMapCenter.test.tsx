import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useApproximateMapCenter } from "../useApproximateMapCenter";

/**
 * An event with a city but no coordinates gets the city's center from
 * Mapbox, limited to the event's country, so the page can show the area.
 */

const geo = vi.hoisted(() => ({
  mapboxGeocode: vi.fn(),
  fetchCountries: vi.fn(),
}));
vi.mock("@/shared/lib/geocoding", () => ({
  mapboxGeocode: geo.mapboxGeocode,
}));
vi.mock("@/shared/api/geo", () => ({
  fetchCountries: geo.fetchCountries,
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
  );
}

const cebu = { city: "Cebu City", state: "Cebu", country: "Philippines" };

describe("useApproximateMapCenter", () => {
  beforeEach(() => {
    geo.mapboxGeocode.mockReset();
    geo.fetchCountries.mockReset();
    geo.fetchCountries.mockResolvedValue([
      { code: "PH", name: "Philippines" },
      { code: "SV", name: "El Salvador" },
    ]);
  });

  it("returns the city's center, searching only the event's country", async () => {
    geo.mapboxGeocode.mockResolvedValue([{ center: [123.89, 10.31] }]);
    const { result } = renderHook(
      () => useApproximateMapCenter({ ...cebu, enabled: true }),
      { wrapper },
    );
    await waitFor(() => expect(result.current).toEqual({ lat: 10.31, lng: 123.89 }));
    expect(geo.mapboxGeocode).toHaveBeenCalledWith(
      "Cebu City, Cebu",
      expect.objectContaining({ country: "PH", limit: 1 }),
    );
  });

  it("returns null when the city isn't found", async () => {
    geo.mapboxGeocode.mockResolvedValue([]);
    const { result } = renderHook(
      () => useApproximateMapCenter({ ...cebu, enabled: true }),
      { wrapper },
    );
    await waitFor(() => expect(geo.mapboxGeocode).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it("doesn't guess when the country is unknown", async () => {
    const { result } = renderHook(
      () => useApproximateMapCenter({ ...cebu, country: "Atlantis", enabled: true }),
      { wrapper },
    );
    await waitFor(() => expect(geo.fetchCountries).toHaveBeenCalled());
    expect(result.current).toBeNull();
    expect(geo.mapboxGeocode).not.toHaveBeenCalled();
  });

  it("doesn't look anything up when disabled (exact coordinates exist)", () => {
    const { result } = renderHook(
      () => useApproximateMapCenter({ ...cebu, enabled: false }),
      { wrapper },
    );
    expect(result.current).toBeNull();
    expect(geo.fetchCountries).not.toHaveBeenCalled();
    expect(geo.mapboxGeocode).not.toHaveBeenCalled();
  });

  it("doesn't look anything up without a city", () => {
    const { result } = renderHook(
      () => useApproximateMapCenter({ ...cebu, city: null, enabled: true }),
      { wrapper },
    );
    expect(result.current).toBeNull();
    expect(geo.mapboxGeocode).not.toHaveBeenCalled();
  });
});
