"use client";

import React from "react";
import { ModeTab } from "./types";

interface ScannerModeTabsProps {
  activeTab: ModeTab;
  onSelectTab: (tab: ModeTab) => void;
}

export function ScannerModeTabs({
  activeTab,
  onSelectTab,
}: ScannerModeTabsProps) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white/5 p-1 mb-6 border border-white/10">
      <button
        type="button"
        onClick={() => onSelectTab("manual")}
        className={`py-2 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
          activeTab === "manual"
            ? "bg-[#ccff00] text-black shadow-md"
            : "text-white/60 hover:text-white"
        }`}
      >
        <span className="material-symbols-outlined text-[15px] sm:text-[16px]">
          keyboard
        </span>
        <span className="truncate">Manual</span>
      </button>
      <button
        type="button"
        onClick={() => onSelectTab("upload")}
        className={`py-2 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
          activeTab === "upload"
            ? "bg-[#ccff00] text-black shadow-md"
            : "text-white/60 hover:text-white"
        }`}
      >
        <span className="material-symbols-outlined text-[15px] sm:text-[16px]">
          upload_file
        </span>
        <span className="truncate">Upload / Snap</span>
      </button>
      <button
        type="button"
        onClick={() => onSelectTab("camera")}
        className={`py-2 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
          activeTab === "camera"
            ? "bg-[#ccff00] text-black shadow-md"
            : "text-white/60 hover:text-white"
        }`}
      >
        <span className="material-symbols-outlined text-[15px] sm:text-[16px]">
          photo_camera
        </span>
        <span className="truncate">Live Cam</span>
      </button>
    </div>
  );
}
