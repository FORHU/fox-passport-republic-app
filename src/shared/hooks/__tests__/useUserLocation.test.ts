import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUserLocation } from "../useUserLocation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import * as mapboxLib from "@/shared/lib/mapbox";

describe("useUserLocation hook", () => {
  const originalGeolocation = navigator.geolocation;
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null });
    vi.spyOn(mapboxLib, "getEffectiveMapboxToken").mockReturnValue("test-mapbox-token");
  });

  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: originalGeolocation,
      configurable: true,
      writable: true,
    });
    global.fetch = originalFetch;
  });

  it("updates coords and reverse geocodes when geolocation succeeds", async () => {
    const mockGetCurrentPosition = vi.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: 14.5995,
          longitude: 120.9842,
        },
      });
    });

    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
      writable: true,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          { place_type: ["country"], text: "Philippines", properties: { short_code: "ph" } },
          { place_type: ["place"], text: "Manila" },
          { place_type: ["region"], text: "Metro Manila" },
        ],
      }),
    } as any);

    const { result } = renderHook(() => useUserLocation());

    // Wait for async reverse geocoding to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGetCurrentPosition).toHaveBeenCalled();
    expect(result.current.coords).toEqual([120.9842, 14.5995]);
    expect(result.current.country).toBe("Philippines");
    expect(result.current.countryCode).toBe("PH");
    expect(result.current.city).toBe("Manila");
    expect(result.current.region).toBe("Metro Manila");
    expect(result.current.isDetected).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("falls back to user country when geolocation permission is denied", async () => {
    useAuthStore.setState({
      user: { id: "u-1", name: "Alice", email: "alice@test.com", country: "Japan", city: "Tokyo" } as any,
    });

    const mockGetCurrentPosition = vi.fn().mockImplementation((_success, error) => {
      error({ message: "User denied Geolocation" });
    });

    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useUserLocation());

    expect(mockGetCurrentPosition).toHaveBeenCalled();
    expect(result.current.country).toBe("Japan");
    expect(result.current.countryCode).toBe("JP");
    expect(result.current.city).toBe("Tokyo");
    expect(result.current.coords).toEqual([139.6917, 35.6895]); // Japan fallback coords
    expect(result.current.error).toBe("User denied Geolocation");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isDetected).toBe(false);
  });

  it("handles empty Mapbox token gracefully without crashing", async () => {
    vi.spyOn(mapboxLib, "getEffectiveMapboxToken").mockReturnValue("");

    const mockGetCurrentPosition = vi.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
        },
      });
    });

    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useUserLocation());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.coords).toEqual([-0.1278, 51.5074]);
    expect(result.current.isLoading).toBe(false);
  });

  it("allows manual re-detection via locateMe()", async () => {
    const mockGetCurrentPosition = vi.fn();
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useUserLocation());
    expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.locateMe();
    });
    expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2);
  });
});
