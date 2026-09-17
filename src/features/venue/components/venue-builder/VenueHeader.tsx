"use client";

import React from "react";

interface VenueHeaderProps {
  venueName: string;
  /** The venue's real, already-fetched status — drives the status label
   * and which action(s) are offered. Defaults to "pending" (new venue). */
  status?: string;
  isSubmitting: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

const STATUS_META: Record<
  string,
  { label: string; dotClass: string }
> = {
  draft: { label: "Draft", dotClass: "bg-white/40" },
  pending: { label: "Pending Review", dotClass: "bg-accent animate-pulse" },
  available: { label: "Live", dotClass: "bg-green-400" },
  rejected: { label: "Rejected", dotClass: "bg-red-400" },
  archived: { label: "Archived", dotClass: "bg-white/30" },
};

export function VenueHeader({
  venueName,
  status = "pending",
  isSubmitting,
  onBack,
  onSaveDraft,
  onPublish,
}: VenueHeaderProps) {
  const isLive = status === "available";
  const meta = STATUS_META[status] ?? STATUS_META.pending;

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f111a] sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
        </button>
        <div>
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            Venue Studio
            <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[9px] font-bold uppercase">
              Venue Foxer
            </span>
          </h2>
          <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
            {venueName || "New Venue"} ({meta.label})
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!isLive && (
          <button
            onClick={onSaveDraft}
            className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold hover:bg-white/5"
          >
            Save Draft
          </button>
        )}
        <button
          onClick={onPublish}
          disabled={isSubmitting}
          className="btn-neon px-5 py-2 rounded-full bg-accent text-black text-xs font-bold flex items-center gap-2"
        >
          {isSubmitting ? (
            <span className="material-symbols-outlined animate-spin text-[16px]">
              progress_activity
            </span>
          ) : isLive ? (
            <>
              <span className="material-symbols-outlined text-[16px]">
                save
              </span>
              Update Details
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">
                send
              </span>
              Submit for Review
            </>
          )}
        </button>
      </div>
    </header>
  );
}
