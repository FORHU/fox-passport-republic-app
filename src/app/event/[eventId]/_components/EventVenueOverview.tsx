"use client";

import React from "react";
import { LocationMap } from "@/shared/components/ui/LocationMap";

export interface EventVenueOverviewProps {
  description?: string;
  location?: string | null;
  mapLat?: number | null;
  mapLng?: number | null;
  maxAttendees?: number | null;
  category?: string;
  cancellationPolicy?: {
    name: string;
    description: string;
  } | null;
  cancellationPolicyId?: string | null;
}

export function EventVenueOverview({
  description,
  location,
  mapLat,
  mapLng,
  maxAttendees,
  category,
  cancellationPolicy,
  cancellationPolicyId,
}: EventVenueOverviewProps) {
  return (
    <div className="space-y-10">
      {/* Description */}
      <div>
        <h3 className="text-2xl font-display font-bold text-white mb-4">
          About this experience
        </h3>
        {description ? (
          <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
            {description}
          </p>
        ) : (
          <p className="text-white/20 italic text-sm">
            No description added yet.
          </p>
        )}
      </div>

      <div className="h-px bg-white/10 w-full" />

      {/* Map */}
      <div>
        <h3 className="text-2xl font-display font-bold text-white mb-2">
          Where you&apos;ll be
        </h3>
        {location && <p className="text-text-muted text-sm mb-6">{location}</p>}
        {mapLat && mapLng ? (
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            <LocationMap lat={mapLat} lng={mapLng} className="h-80 w-full" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <span className="bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                Exact location provided after booking
              </span>
            </div>
          </div>
        ) : (
          <div className="h-52 rounded-2xl bg-white/3 border border-white/5 flex flex-col items-center justify-center gap-2 text-white/20">
            <span className="material-symbols-outlined text-3xl">
              location_off
            </span>
            <p className="text-sm">
              Set a location in the builder to show the map
            </p>
          </div>
        )}
      </div>

      <div className="h-px bg-white/10 w-full" />

      {/* Things to know */}
      <div>
        <h3 className="text-2xl font-display font-bold text-white mb-6">
          Things to know
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Event Info</h4>
            <div className="space-y-2 text-sm text-text-muted">
              {maxAttendees && <p>Maximum {maxAttendees} guests</p>}
              {category && (
                <p>
                  Category:{" "}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </p>
              )}
              {!maxAttendees && !category && (
                <p className="italic text-white/20">No details set yet.</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-3">
              Cancellation Policy
            </h4>
            <div className="space-y-2 text-sm text-text-muted">
              {cancellationPolicy ? (
                <>
                  <p className="font-semibold text-white/80">
                    {cancellationPolicy.name}
                  </p>
                  {cancellationPolicy.description && (
                    <p>{cancellationPolicy.description}</p>
                  )}
                </>
              ) : cancellationPolicyId ? (
                <p>Loading policy…</p>
              ) : (
                <p>
                  Default policy: full refund if cancelled within 48 hours of
                  booking.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
