"use client";

import React from "react";

interface EventHeaderProps {
  eventTitle: string;
  isSubmitting: boolean;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onTogglePalette?: () => void;
  onToggleBlueprint?: () => void;
}

export function EventHeader({
  eventTitle,
  isSubmitting,
  saveStatus = "idle",
  onBack,
  onSaveDraft,
  onPublish,
  onTogglePalette,
  onToggleBlueprint,
}: EventHeaderProps) {
  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Draft saved"
        : saveStatus === "error"
          ? "Save failed — retry?"
          : "Draft";

  const statusDot =
    saveStatus === "saving"
      ? "bg-yellow-400 animate-pulse"
      : saveStatus === "error"
        ? "bg-red-500"
        : "bg-green-500 animate-pulse";

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-[#0f111a] z-20">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onBack}
          aria-label="Back"
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
        </button>
        <div className="min-w-0">
          <h2 className="font-display font-bold text-base sm:text-lg flex items-center gap-2 truncate">
            Event Studio
            <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[9px] font-bold uppercase shrink-0">
              Beta
            </span>
          </h2>
          <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5 truncate">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} />
            <span className="truncate">{eventTitle || "Untitled Event"}</span> · {statusLabel}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile toggles for hidden sidebars */}
        {onTogglePalette && (
          <button
            type="button"
            onClick={onTogglePalette}
            aria-label="Toggle resources palette"
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-white/10 text-xs font-bold text-white/80 hover:bg-white/5 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">
              inventory_2
            </span>
            <span className="hidden xs:inline">Assets</span>
          </button>
        )}
        {onToggleBlueprint && (
          <button
            type="button"
            onClick={onToggleBlueprint}
            aria-label="Toggle financials blueprint"
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-white/10 text-xs font-bold text-white/80 hover:bg-white/5 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">
              analytics
            </span>
            <span className="hidden xs:inline">Blueprint</span>
          </button>
        )}

        <button
          onClick={onSaveDraft}
          className="px-3 sm:px-4 py-2 rounded-full border border-white/10 text-xs font-bold hover:bg-white/5 whitespace-nowrap"
        >
          Save Draft
        </button>
        <button
          onClick={onPublish}
          disabled={isSubmitting}
          className="btn-neon px-4 sm:px-5 py-2 rounded-full bg-accent text-black text-xs font-bold flex items-center gap-2 whitespace-nowrap"
        >
          {isSubmitting ? (
            <span className="material-symbols-outlined animate-spin text-[16px]">
              progress_activity
            </span>
          ) : (
            "Publish"
          )}
        </button>
      </div>
    </header>
  );
}
