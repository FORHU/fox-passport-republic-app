"use client";

import React from "react";
import Link from "next/link";
import { ResourceItem } from "@/features/event/data/eventBuilderData";

interface ResourceCardProps {
  item: ResourceItem;
  onDragStart: (e: React.DragEvent, item: ResourceItem) => void;
  onSelect?: (item: ResourceItem) => void;
}

export function ResourceCard({
  item,
  onDragStart,
  onSelect,
}: ResourceCardProps) {
  // A venue without an approved affiliation can't be dragged/added — the
  // organizer must apply to (or be invited by) its owner first. See
  // EventTemplateSvc.attachVenue on the API for the check this UI mirrors.
  const isGatedVenue =
    item.resourceType === "venue" &&
    item.affiliationStatus &&
    item.affiliationStatus !== "approved";

  return (
    <div
      draggable={!isGatedVenue}
      onDragStart={(e) => !isGatedVenue && onDragStart(e, item)}
      className={`group bg-[#161b26] border border-white/5 rounded-2xl p-4 transition-colors relative ${
        isGatedVenue
          ? "opacity-60"
          : "hover:bg-[#1c2230] hover:border-white/10 cursor-grab"
      }`}
    >
      <div className="flex gap-4">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-12 w-12 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-black/40 flex items-center justify-center text-white/50 shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              {item.icon}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-white text-sm truncate pr-1">
              {item.name}
            </h4>
            <span className="text-xs text-accent font-bold font-mono shrink-0">
              ₱{item.cost.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
            {item.desc}
          </p>
          {isGatedVenue ? (
            <div className="mt-3 flex justify-end">
              {item.affiliationStatus === "pending" ? (
                <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 text-[11px] font-bold text-yellow-400">
                  Pending approval
                </span>
              ) : (
                <Link
                  href={`/foxer/affiliations?venueId=${item.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-accent hover:text-black text-[11px] font-bold text-white/80 transition-all cursor-pointer"
                >
                  Apply to host here
                </Link>
              )}
            </div>
          ) : (
            onSelect && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-accent hover:text-black text-[11px] font-bold text-white/80 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    add
                  </span>
                  Add
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
