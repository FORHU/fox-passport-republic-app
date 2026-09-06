"use client";

import { useEffect, useRef, useState } from "react";
import { FeedTab } from "../types";

interface RepublicTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  orientation?: "horizontal" | "vertical" | "dropdown";
}

export function RepublicTabs({
  activeTab,
  onTabChange,
  orientation = "horizontal",
}: RepublicTabsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only the dropdown variant needs outside-click-to-close; skip wiring the
  // listener for the other orientations, which have no open/close state.
  useEffect(() => {
    if (orientation !== "dropdown" || !isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [orientation, isOpen]);
  const tabs: Array<{
    id: FeedTab;
    label: string;
    icon: string;
    badge?: string;
    description: string;
  }> = [
    {
      id: "all",
      label: "All Feeds",
      icon: "dynamic_feed",
      description: "Everything across the Republic",
    },
    {
      id: "community",
      label: "Community",
      icon: "diversity_3",
      description: "Citizen experiences & reviews",
    },
    {
      id: "marketplace",
      label: "Marketplace",
      icon: "storefront",
      description: "Venues, Gear, Services & Events",
    },
    {
      id: "partners",
      label: "Partners",
      icon: "workspace_premium",
      badge: "PRO",
      description: "Backing, funding & co-hosting",
    },
  ];

  // Shared between "vertical" (always-visible sidebar card) and "dropdown"
  // (same list, opened from a trigger) so the two stay visually identical.
  const renderOptions = (onSelect: (tab: FeedTab) => void) =>
    tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all text-left cursor-pointer group relative ${
            isActive
              ? "bg-zinc-800/90 text-white shadow-lg border border-lime-400/50 shadow-[0_0_20px_rgba(204,255,0,0.1)]"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent"
          }`}
        >
          {isActive && (
            <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-lime-400 rounded-full shadow-[0_0_8px_#ccff00]" />
          )}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isActive
                ? "bg-lime-400/15 text-lime-400 border border-lime-400/30"
                : "bg-zinc-800/60 text-zinc-400 group-hover:text-zinc-200"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {tab.icon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black tracking-tight truncate">
                {tab.label}
              </span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider ${
                    isActive
                      ? "bg-amber-400 text-black shadow-sm"
                      : "bg-zinc-700 text-amber-300"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 truncate mt-0.5">
              {tab.description}
            </p>
          </div>
        </button>
      );
    });

  if (orientation === "dropdown") {
    const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];
    return (
      <div ref={containerRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-lime-400 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[13px]">
            {active.icon}
          </span>
          <span className="truncate max-w-[70px] sm:max-w-none">
            {active.label}
          </span>
          <span
            className={`material-symbols-outlined text-[13px] transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            expand_more
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 z-50 space-y-1.5 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-2 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">
              Feed Streams
            </div>
            {renderOptions((tab) => {
              onTabChange(tab);
              setIsOpen(false);
            })}
          </div>
        )}
      </div>
    );
  }

  if (orientation === "vertical") {
    return (
      <div className="w-full space-y-1.5 bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-2 shadow-xl">
        <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">
          Feed Streams
        </div>
        {renderOptions(onTabChange)}
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-1.5 shadow-xl">
      <div className="flex sm:grid sm:grid-cols-4 gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 sm:px-2.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-zinc-800 text-white shadow-lg border border-lime-400/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              {isActive && (
                <span className="hidden sm:block absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-lime-400 rounded-full shadow-[0_0_10px_#ccff00]" />
              )}

              <span
                className={`material-symbols-outlined text-[18px] sm:text-[20px] ${
                  isActive ? "text-lime-400" : "text-zinc-500"
                }`}
              >
                {tab.icon}
              </span>

              <span className="text-xs font-bold tracking-tight flex items-center gap-1">
                {tab.label}
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider ${
                      isActive
                        ? "bg-amber-400 text-black shadow-sm"
                        : "bg-zinc-700 text-amber-300"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
