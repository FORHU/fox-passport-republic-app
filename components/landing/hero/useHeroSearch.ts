import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HARDCODED_VENUES } from "@/data/hardcodedVenues";

export interface SearchSuggestion {
  type: "location" | "province" | "venue" | "category";
  value: string;
  label: string;
  sublabel?: string;
}

export const SEARCH_TABS = [
  "All",
  "Events",
  "Adventures",
  "Music",
  "Food",
  "Camping",
  "Venues",
];

export const useHeroSearch = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Generate unique suggestions based on search query
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchSuggestion[] = [];
    const seen = new Set<string>();

    // Get unique locations
    HARDCODED_VENUES.forEach((venue) => {
      const locationKey = `location:${venue.location.toLowerCase()}`;
      if (
        !seen.has(locationKey) &&
        venue.location.toLowerCase().includes(query)
      ) {
        seen.add(locationKey);
        results.push({
          type: "location",
          value: venue.location,
          label: venue.location,
          sublabel: venue.province,
        });
      }
    });

    // Get unique provinces
    HARDCODED_VENUES.forEach((venue) => {
      const provinceKey = `province:${venue.province.toLowerCase()}`;
      if (
        !seen.has(provinceKey) &&
        venue.province.toLowerCase().includes(query)
      ) {
        seen.add(provinceKey);
        results.push({
          type: "province",
          value: venue.province,
          label: venue.province,
          sublabel: "Province",
        });
      }
    });

    // Get matching venues by title
    HARDCODED_VENUES.forEach((venue) => {
      if (venue.title.toLowerCase().includes(query) && results.length < 15) {
        const venueKey = `venue:${venue.id}`;
        if (!seen.has(venueKey)) {
          seen.add(venueKey);
          results.push({
            type: "venue",
            value: venue.id,
            label: venue.title,
            sublabel: `${venue.location}, ${venue.province}`,
          });
        }
      }
    });

    // Get unique categories
    const categories = new Set<string>();
    HARDCODED_VENUES.forEach((venue) => {
      if (venue.category.toLowerCase().includes(query)) {
        categories.add(venue.category);
      }
    });
    categories.forEach((cat) => {
      const catKey = `category:${cat.toLowerCase()}`;
      if (!seen.has(catKey)) {
        seen.add(catKey);
        results.push({
          type: "category",
          value: cat,
          label: cat,
          sublabel: "Category",
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowDropdown(false);
    setSearchQuery("");

    if (suggestion.type === "venue") {
      router.push(`/venues/${suggestion.value}`);
    } else if (
      suggestion.type === "location" ||
      suggestion.type === "province"
    ) {
      router.push(`/?location=${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.type === "category") {
      router.push(`/categories?type=${encodeURIComponent(suggestion.value)}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/?location=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showDropdown,
    setShowDropdown,
    selectedIndex,
    setSelectedIndex,
    dropdownRef,
    inputRef,
    suggestions,
    handleSearch,
    handleSuggestionClick,
    handleKeyDown,
  };
};
