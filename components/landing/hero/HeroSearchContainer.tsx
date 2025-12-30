
import React from "react";
import SearchTabs from "./SearchTabs";
import SearchInput from "./SearchInput";
import { useHeroSearch } from "./useHeroSearch";

const HeroSearchContainer: React.FC = () => {
  const {
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
  } = useHeroSearch();

  return (
    <div className="bg-white rounded-[2rem] p-3 shadow-2xl shadow-gray-200 border border-gray-100 w-full max-w-2xl relative z-10">
      <SearchTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <SearchInput
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        suggestions={suggestions}
        handleSearch={handleSearch}
        handleSuggestionClick={handleSuggestionClick}
        handleKeyDown={handleKeyDown}
        dropdownRef={dropdownRef}
        inputRef={inputRef}
      />
    </div>
  );
};

export default HeroSearchContainer;
