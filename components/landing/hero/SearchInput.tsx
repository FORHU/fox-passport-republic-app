
import React from "react";
import { Search, MapPin, Building, Tag } from "lucide-react";
import { SearchSuggestion } from "./useHeroSearch";

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  suggestions: SearchSuggestion[];
  handleSearch: (e: React.FormEvent) => void;
  handleSuggestionClick: (suggestion: SearchSuggestion) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>; // Changed to match React.RefObject
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  setSearchQuery,
  showDropdown,
  setShowDropdown,
  selectedIndex,
  setSelectedIndex,
  suggestions,
  handleSearch,
  handleSuggestionClick,
  handleKeyDown,
  dropdownRef,
  inputRef,
}) => {
  const getIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "location":
        return <MapPin className="w-4 h-4 text-pink-500" />;
      case "province":
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case "venue":
        return <Building className="w-4 h-4 text-gray-500" />;
      case "category":
        return <Tag className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row gap-3 items-center"
    >
      <div className="flex-1 w-full relative" ref={dropdownRef}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search experiences, venues, or locations..."
          className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-pink-200 text-sm outline-none"
        />

        {/* Autocomplete Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  index === selectedIndex ? "bg-pink-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex-shrink-0">{getIcon(suggestion.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.label}
                  </p>
                  {suggestion.sublabel && (
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.sublabel}
                    </p>
                  )}
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {suggestion.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-pink-500/25"
      >
        Search
      </button>
    </form>
  );
};

export default SearchInput;
