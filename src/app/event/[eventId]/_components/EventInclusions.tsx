/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";

export interface InclusionItem {
  name: string;
  icon: string;
  desc: string;
  imageUrl?: string;
}

export interface EventInclusionsProps {
  inclusions: InclusionItem[];
  isPreview?: boolean;
  onCustomizeClick?: () => void;
}

export function EventInclusions({
  inclusions,
  isPreview = false,
  onCustomizeClick,
}: EventInclusionsProps) {
  if (inclusions.length === 0 && !isPreview) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-display font-bold text-white">
          Included in this Build
        </h3>
        {onCustomizeClick && (
          <button
            onClick={onCustomizeClick}
            className="text-xs font-bold text-accent flex items-center gap-1 cursor-pointer hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>{" "}
            Customize
          </button>
        )}
      </div>

      {inclusions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inclusions.map((svc, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
            >
              {svc.imageUrl ? (
                <img
                  src={svc.imageUrl}
                  alt={svc.name}
                  className="h-10 w-10 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-surface-highlight flex items-center justify-center text-white/80 shrink-0">
                  <span className="material-symbols-outlined">{svc.icon}</span>
                </div>
              )}
              <div>
                <h4 className="font-bold text-white text-sm">{svc.name}</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {svc.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-white/15 block mb-2">
            inventory_2
          </span>
          <p className="text-sm text-white/25">
            No venues, gear, or services added yet.
          </p>
          <p className="text-xs text-white/15 mt-1">
            Drag items into the builder to include them.
          </p>
        </div>
      )}
    </div>
  );
}
