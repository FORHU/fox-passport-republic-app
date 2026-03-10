// src/hooks/usePhilippineLocations.ts
import { useState, useMemo } from "react";
import { ALL_LOCATIONS, LocationItem } from "@/data/location";

export function usePhilippineLocations() {
  const [query, setQuery] = useState("");

  const filteredList = useMemo(() => {
    if (!query) return [];

    const lowerQuery = query.toLowerCase().trim();
    
    return ALL_LOCATIONS.filter((loc) => 
      loc.searchTerms.includes(lowerQuery)
    ).slice(0, 50);
  }, [query]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, LocationItem[]> = {};
    
    filteredList.forEach((loc) => {
      if (!groups[loc.province]) {
        groups[loc.province] = [];
      }
      groups[loc.province].push(loc);
    });

    // Sort provinces alphabetically
    return Object.keys(groups).sort().reduce((acc, province) => {
      acc[province] = groups[province];
      return acc;
    }, {} as Record<string, LocationItem[]>);
  }, [filteredList]);

  return {
    query,
    setQuery,
    results: groupedResults,
    hasResults: filteredList.length > 0,
    isEmpty: query.length > 0 && filteredList.length === 0
  };
}