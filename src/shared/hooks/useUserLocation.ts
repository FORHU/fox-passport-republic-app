"use client";

import { useState, useEffect, useCallback } from "react";
import { config } from "@/shared/lib/config";
import { useAuthStore } from "@/shared/auth/useAuthStore";

export interface UserLocationState {
  coords: [number, number]; // [lng, lat]
  country: string;
  countryCode: string;
  city: string;
  region: string;
  isLoading: boolean;
  isDetected: boolean;
  error: string | null;
  locateMe: () => void;
}

// Fallback centroids per country code if GPS is denied or offline
const COUNTRY_CENTROIDS: Record<
  string,
  { coords: [number, number]; name: string }
> = {
  PH: { coords: [120.9842, 14.5995], name: "Philippines" },
  US: { coords: [-98.5795, 39.8283], name: "United States" },
  SG: { coords: [103.8198, 1.3521], name: "Singapore" },
  GB: { coords: [-0.1278, 51.5074], name: "United Kingdom" },
  JP: { coords: [139.6917, 35.6895], name: "Japan" },
  AU: { coords: [133.7751, -25.2744], name: "Australia" },
  CA: { coords: [-106.3468, 56.1304], name: "Canada" },
  DE: { coords: [10.4515, 51.1657], name: "Germany" },
  FR: { coords: [2.2137, 46.2276], name: "France" },
  AE: { coords: [55.2708, 25.2048], name: "United Arab Emirates" },
};

const DEFAULT_GLOBAL: [number, number] = [120.9842, 14.5995];

export function useUserLocation(): UserLocationState {
  const { user } = useAuthStore();
  const [coords, setCoords] = useState<[number, number]>(DEFAULT_GLOBAL);
  const [country, setCountry] = useState<string>("Detecting Country...");
  const [countryCode, setCountryCode] = useState<string>("PH");
  const [city, setCity] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDetected, setIsDetected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    if (!config.mapboxToken) {
      setIsLoading(false);
      return;
    }

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=country,place,region&access_token=${config.mapboxToken}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Geocoding failed");
      const data = await res.json();

      let detectedCountry = "Philippines";
      let detectedCode = "PH";
      let detectedCity = "";
      let detectedRegion = "";

      if (data.features && data.features.length > 0) {
        for (const feature of data.features) {
          if (feature.place_type.includes("country")) {
            detectedCountry = feature.text;
            detectedCode = (
              feature.properties?.short_code || "PH"
            ).toUpperCase();
          } else if (feature.place_type.includes("place")) {
            detectedCity = feature.text;
          } else if (feature.place_type.includes("region")) {
            detectedRegion = feature.text;
          }
        }
      }

      setCountry(detectedCountry);
      setCountryCode(detectedCode);
      setCity(detectedCity);
      setRegion(detectedRegion);
      setIsDetected(true);
    } catch (err: any) {
      console.warn("Reverse geocode fallback:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectLocation = useCallback(() => {
    setIsLoading(true);
    setError(null);

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords([lng, lat]);
          reverseGeocode(lng, lat);
        },
        (err) => {
          console.log(
            "Geolocation permission not granted, using fallback:",
            err.message,
          );
          setError(err.message);

          // Fallback: Check user profile country
          const userCountryCode = user?.country
            ? Object.keys(COUNTRY_CENTROIDS).find(
                (code) =>
                  COUNTRY_CENTROIDS[code].name.toLowerCase() ===
                  user.country?.toLowerCase(),
              ) || "PH"
            : "PH";

          const fallback =
            COUNTRY_CENTROIDS[userCountryCode] || COUNTRY_CENTROIDS.PH;
          setCoords(fallback.coords);
          setCountry(user?.country || fallback.name);
          setCountryCode(userCountryCode);
          setCity(user?.city || "");
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 6000 },
      );
    } else {
      setIsLoading(false);
    }
  }, [reverseGeocode, user?.country, user?.city]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return {
    coords,
    country,
    countryCode,
    city,
    region,
    isLoading,
    isDetected,
    error,
    locateMe: detectLocation,
  };
}
