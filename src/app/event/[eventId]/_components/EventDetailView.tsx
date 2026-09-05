"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileEventDetail from "@/features/event/components/MobileEventDetail";
import { CustomExperienceBuilderModal } from "./CustomExperienceBuilderModal";
import { EventGallery } from "./EventGallery";
import { EventHostCard } from "./EventHostCard";
import { EventInclusions, InclusionItem } from "./EventInclusions";
import { EventVenueOverview } from "./EventVenueOverview";
import { EventBookingSidebar } from "./EventBookingSidebar";

const CATEGORY_ICONS: Record<string, string> = {
  music: "music_note",
  sports: "sports_soccer",
  food: "restaurant",
  art: "palette",
  tech: "computer",
  business: "work",
  wellness: "spa",
  education: "school",
  other: "celebration",
};

export interface EventDetailViewProps {
  eventId: string;
  template: any;
  isPreview?: boolean;
  isDraft?: boolean;
  price: number;
  inclusions: InclusionItem[];
  cancellationPolicy: {
    name: string;
    description: string;
  } | null;
  eventDate: string | null;
  location: string | null;
  mapLat: number | null;
  mapLng: number | null;
}

export function EventDetailView({
  eventId,
  template,
  isPreview = false,
  isDraft = false,
  price,
  inclusions,
  cancellationPolicy,
  eventDate,
  location,
  mapLat,
  mapLng,
}: EventDetailViewProps) {
  const router = useRouter();
  const [isCustomBookingOpen, setIsCustomBookingOpen] = useState(false);

  const templateImages: string[] = (template?.images ?? [])
    .map((img: any) => img.url)
    .filter(Boolean);

  const maxAttendees: number | null = template?.maxAttendees ?? null;
  const category: string = template?.category ?? "";

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      {/* Mobile-only redesigned view */}
      <div className="lg:hidden">
        <MobileEventDetail event={template} isPreview={isPreview} />
      </div>

      {/* Desktop / Tablet View */}
      <div className="hidden lg:contents">
        <CustomExperienceBuilderModal
          isOpen={isCustomBookingOpen}
          onClose={() => setIsCustomBookingOpen(false)}
          venuePrice={price}
        />

        {/* Draft Preview Top Banner */}
        {isPreview && isDraft && (
          <div className="fixed top-0 left-0 right-0 z-200 h-9 bg-yellow-500/95 backdrop-blur-sm text-black text-xs font-bold text-center px-4 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[14px]">
              visibility
            </span>
            Draft Preview — this is how your listing will look when published
            <button
              onClick={() => router.back()}
              className="ml-4 underline opacity-70 hover:opacity-100 cursor-pointer"
            >
              ← Back to builder
            </button>
          </div>
        )}

        {/* Top Header */}
        <header
          className={`fixed left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-14 sm:h-20 ${
            isPreview && isDraft ? "top-9" : "top-0"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/foxonlylogo.png"
                  alt="FoxPassport Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <h2 className="text-lg sm:text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">
                FoxPassport
              </h2>
            </Link>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm font-medium text-white cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">
                  share
                </span>{" "}
                Share
              </button>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm font-medium text-white cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">
                  favorite_border
                </span>{" "}
                Save
              </button>
              <button
                onClick={() => router.back()}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white hover:text-black transition-all text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          className={`grow pb-28 sm:pb-20 px-4 sm:px-6 ${
            isPreview && isDraft ? "pt-26.25 sm:pt-33" : "pt-20 sm:pt-28"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {/* Title & Metadata */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {category && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[12px]">
                      {CATEGORY_ICONS[category] ?? "celebration"}
                    </span>
                    {category}
                  </span>
                )}
                {isPreview && isDraft && (
                  <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                    Draft
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
                {template.name || "Untitled Event"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                {location && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-white/30">
                      location_on
                    </span>
                    {location}
                  </span>
                )}
                {eventDate && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-white/30">
                      calendar_today
                    </span>
                    {eventDate}
                  </span>
                )}
                {maxAttendees && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-white/30">
                      group
                    </span>
                    Up to {maxAttendees} guests
                  </span>
                )}
              </div>
            </div>

            {/* Gallery Grid & Lightbox */}
            <EventGallery
              eventName={template.name || "Event Gallery"}
              images={templateImages}
              isPreview={isPreview}
            />

            {/* 2-Column Responsive Layout */}
            <div className="grid lg:grid-cols-[1.8fr_1fr] gap-16">
              {/* Left Column */}
              <div className="space-y-10">
                {/* Host summary card */}
                <EventHostCard
                  owner={template.owner}
                  variant="compact"
                  eventId={eventId}
                  eventName={template.name}
                />

                {/* Event detail pills */}
                {(eventDate || maxAttendees || location) && (
                  <div className="space-y-5">
                    {eventDate && (
                      <div className="flex gap-4 items-start">
                        <span className="material-symbols-outlined text-white text-2xl mt-0.5">
                          calendar_today
                        </span>
                        <div>
                          <h3 className="font-bold text-white text-base">
                            Event Date
                          </h3>
                          <p className="text-sm text-text-muted">{eventDate}</p>
                        </div>
                      </div>
                    )}
                    {maxAttendees && (
                      <div className="flex gap-4 items-start">
                        <span className="material-symbols-outlined text-white text-2xl mt-0.5">
                          group
                        </span>
                        <div>
                          <h3 className="font-bold text-white text-base">
                            Guest Capacity
                          </h3>
                          <p className="text-sm text-text-muted">
                            Up to {maxAttendees} guests
                          </p>
                        </div>
                      </div>
                    )}
                    {location && (
                      <div className="flex gap-4 items-start">
                        <span className="material-symbols-outlined text-white text-2xl mt-0.5">
                          location_on
                        </span>
                        <div>
                          <h3 className="font-bold text-white text-base">
                            Location
                          </h3>
                          <p className="text-sm text-text-muted">{location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(eventDate || maxAttendees || location) && (
                  <div className="h-px bg-white/10 w-full" />
                )}

                {/* Inclusions & Custom Experience Trigger */}
                <EventInclusions
                  inclusions={inclusions}
                  isPreview={isPreview}
                  onCustomizeClick={() => setIsCustomBookingOpen(true)}
                />

                {(inclusions.length > 0 || isPreview) && (
                  <div className="h-px bg-white/10 w-full" />
                )}

                {/* Venue Description, Interactive Map & Policies */}
                <EventVenueOverview
                  description={template.description}
                  location={location}
                  mapLat={mapLat}
                  mapLng={mapLng}
                  maxAttendees={maxAttendees}
                  category={category}
                  cancellationPolicy={cancellationPolicy}
                  cancellationPolicyId={template?.cancellationPolicyId}
                />

                <div className="h-px bg-white/10 w-full" />

                {/* Full Host Bio & Messaging */}
                <EventHostCard
                  owner={template.owner}
                  variant="full"
                  eventId={eventId}
                  eventName={template.name}
                />
              </div>

              {/* Right Column: Sticky Booking Widget & Mobile Action Bar */}
              <EventBookingSidebar
                eventId={eventId}
                price={price}
                isPreview={isPreview}
                onCustomExperienceClick={() => setIsCustomBookingOpen(true)}
              />
            </div>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="bg-black pt-20 pb-10 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white">
                  explore
                </span>
                <span className="text-xl font-display font-bold text-white">
                  FoxPassport
                </span>
              </div>
              <p className="text-xs text-gray-500">
                © 2024 FoxPassport Republic. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                  href="#"
                >
                  Privacy
                </a>
                <a
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                  href="#"
                >
                  Terms
                </a>
                <a
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                  href="#"
                >
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
