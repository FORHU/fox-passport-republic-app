/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Link from "next/link";

export interface EventHostCardProps {
  owner?: {
    id?: string;
    name?: string;
    imgId?: string;
  } | null;
  variant?: "compact" | "full";
  eventId?: string;
  eventName?: string;
}

export function EventHostCard({
  owner,
  variant = "full",
  eventId,
  eventName,
}: EventHostCardProps) {
  const contextParams = eventId
    ? `&contextType=event&contextId=${encodeURIComponent(eventId)}&contextLabel=${encodeURIComponent(eventName || "Event")}`
    : "";
  const ownerName = owner?.name ?? "Organizer";
  const ownerInitial = ownerName.charAt(0).toUpperCase();

  if (variant === "compact") {
    return (
      <div className="bg-surface-highlight/30 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {owner?.imgId ? (
              <img
                src={owner.imgId}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                alt={ownerName}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center border-2 border-white/10">
                <span className="text-black text-2xl font-bold">
                  {ownerInitial}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-[#7c3aed] text-white rounded-full p-1 border-4 border-[#0f111a] flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[14px]">
                verified
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-white text-lg">
              Curated by {ownerName}
            </h3>
            <p className="text-accent text-xs font-bold uppercase tracking-wider">
              Event Organizer
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-start">
      <div className="relative shrink-0">
        {owner?.imgId ? (
          <img
            src={owner.imgId}
            className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
            alt={ownerName}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center border-2 border-white/10">
            <span className="text-black text-2xl font-bold">
              {ownerInitial}
            </span>
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 bg-[#7c3aed] text-white rounded-full p-1 border-4 border-[#0f111a] shadow-sm flex items-center justify-center">
          <span className="material-symbols-outlined text-[14px]">
            verified
          </span>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-1">
          Hosted by {ownerName}
        </h3>
        <p className="text-text-muted text-sm mb-4">
          FoxPassport Organizer
        </p>
        <div className="flex gap-4 text-sm text-white mb-4">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-accent">
              verified
            </span>{" "}
            Identity Verified
          </span>
        </div>
        {owner?.id ? (
          <Link
            href={`/messages?userId=${encodeURIComponent(owner.id)}${contextParams}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            Contact Organizer
          </Link>
        ) : (
          <button className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors cursor-pointer">
            Contact Organizer
          </button>
        )}
      </div>
    </div>
  );
}
