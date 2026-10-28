"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getEffectiveMapboxToken } from "@/shared/lib/mapbox";
import { mapboxGeocode } from "@/shared/lib/geocoding";
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
  const userCountry = useAuthStore((s) => s.user?.country);
  const userCity = useAuthStore((s) => s.user?.city);

  const [coords, setCoords] = useState<[number, number]>(DEFAULT_GLOBAL);
  const [country, setCountry] = useState<string>("Detecting Country...");
  const [countryCode, setCountryCode] = useState<string>("PH");
  const [city, setCity] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDetected, setIsDetected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const userProfileRef = useRef({ country: userCountry, city: userCity });

  useEffect(() => {
    userProfileRef.current = { country: userCountry, city: userCity };
  }, [userCountry, userCity]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    const token = getEffectiveMapboxToken();
    if (!token) {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const features = await mapboxGeocode([lng, lat], {
        types: "country,place,region",
        signal: controller.signal,
      });
      if (!features.length) throw new Error("Geocoding failed");

      if (!isMountedRef.current) return;

      let detectedCountry = "Philippines";
      let detectedCode = "PH";
      let detectedCity = "";
      let detectedRegion = "";

      if (features.length > 0) {
        for (const feature of features) {
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
      if (err?.name === "AbortError") {
        return;
      }
      console.warn("Reverse geocode fallback:", err);
    } finally {
      if (isMountedRef.current && abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  const detectLocation = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsLoading(true);
    setError(null);

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMountedRef.current) return;
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords([lng, lat]);
          reverseGeocode(lng, lat);
        },
        (err) => {
          if (!isMountedRef.current) return;
          console.log(
            "Geolocation permission not granted, using fallback:",
            err.message,
          );
          setError(err.message);

          const { country: profileCountry, city: profileCity } =
            userProfileRef.current;

          // Fallback: Check user profile country
          const matchedCountryCode = profileCountry
            ? Object.keys(COUNTRY_CENTROIDS).find(
                (code) =>
                  COUNTRY_CENTROIDS[code].name.toLowerCase() ===
                  profileCountry.toLowerCase(),
              ) || "PH"
            : "PH";

          const fallback =
            COUNTRY_CENTROIDS[matchedCountryCode] || COUNTRY_CENTROIDS.PH;
          setCoords(fallback.coords);
          setCountry(profileCountry || fallback.name);
          setCountryCode(matchedCountryCode);
          setCity(profileCity || "");
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    } else {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [reverseGeocode]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // Sync fallback if user profile becomes available and geolocation wasn't detected
  useEffect(() => {
    if (isDetected || !userCountry) return;

    const matchedCountryCode = Object.keys(COUNTRY_CENTROIDS).find(
      (code) =>
        COUNTRY_CENTROIDS[code].name.toLowerCase() ===
        userCountry.toLowerCase(),
    );

    if (matchedCountryCode && COUNTRY_CENTROIDS[matchedCountryCode]) {
      const fallback = COUNTRY_CENTROIDS[matchedCountryCode];
      setCoords(fallback.coords);
      setCountry(userCountry);
      setCountryCode(matchedCountryCode);
      if (userCity) setCity(userCity);
    }
  }, [userCountry, userCity, isDetected]);

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
