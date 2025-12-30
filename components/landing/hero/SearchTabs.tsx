
import React from "react";
import { SEARCH_TABS } from "./useHeroSearch";

interface SearchTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SearchTabs: React.FC<SearchTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-2 pb-3 mb-1 overflow-x-auto no-scrollbar px-2 border-b border-gray-50">
      {SEARCH_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === tab
              ? "bg-pink-100 text-pink-500"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default SearchTabs;
