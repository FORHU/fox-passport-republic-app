"use client";

import React, { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useEventDetail } from "./_hooks/useEventDetail";
import { EventDetailView } from "./_components/EventDetailView";

function EventDetailContent() {
  const { eventId } = useParams();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";

  const {
    template,
    loadError,
    price,
    inclusions,
    cancellationPolicy,
    eventDate,
    location,
    mapLat,
    mapLng,
    isDraft,
    router,
  } = useEventDetail(eventId as string, isPreview);

  if (loadError) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/40 text-center px-6">
          <span className="text-4xl">⚠️</span>
          <span className="text-sm text-white/60">{loadError}</span>
          <button
            onClick={() => router.back()}
            className="mt-2 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white hover:bg-white hover:text-black transition-all cursor-pointer"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/40">
          <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          <span className="text-sm">Loading package…</span>
        </div>
      </div>
    );
  }

  return (
    <EventDetailView
      eventId={eventId as string}
      template={template}
      isPreview={isPreview}
      isDraft={isDraft}
      price={price}
      inclusions={inclusions}
      cancellationPolicy={cancellationPolicy}
      eventDate={eventDate}
      location={location}
      mapLat={mapLat}
      mapLng={mapLng}
    />
  );
}

export default function EventDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background min-h-screen flex items-center justify-center">
          <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        </div>
      }
    >
      <EventDetailContent />
    </Suspense>
  );
}
