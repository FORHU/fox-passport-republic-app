"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { searchLocations } from "../api/locations";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

/**
 * Debounced location type-ahead.
 *
 * Owns the debounce, the in-flight request and the abort, so the component
 * renders suggestions and nothing else.
 *
 * Results are stored together with the query that produced them, and only
 * surfaced while that query is still the one being asked about. That keeps the
 * "query too short" and "query changed" cases correct without writing state
 * synchronously inside the effect, and means a slow response can never repaint
 * suggestions for a query the user has already moved past — the abort handles
 * the request, this handles the render.
 */
export function useLocationSearch(query: string): string[] {
  const [result, setResult] = useState<{ query: string; locations: string[] }>({
    query: "",
    locations: [],
  });

  useEffect(() => {
    if (!query || query.length < MIN_QUERY_LENGTH) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchLocations(query, controller.signal)
        .then((locations) => setResult({ query, locations }))
        .catch((err) => {
          if (axios.isCancel(err)) return;
          console.error("Failed to fetch locations:", err);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return result.query === query ? result.locations : [];
}
