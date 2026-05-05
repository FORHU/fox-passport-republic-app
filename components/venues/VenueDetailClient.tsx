'use client';

import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  VenueNavHeader,
  VenueHero,
  VenueGalleryGrid,
  LightboxGallery,
  BookingWidget,
  AmenitiesSection,
  VenueCalendar,
  VenueReviews,
  VenueMap,
  HostBio,
  HouseRules,
} from "@/components/venues/detail";
import { useVenueDetailStore } from "@/store/useVenueDetailStore";

interface VenueDetailClientProps {
  venue: any;
  host: any;
}

export default function VenueDetailClient({ venue, host }: VenueDetailClientProps) {
  const router = useRouter();
  const store = useVenueDetailStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = useCallback(() => router.back(), [router]);

  const handleRequestBook = useCallback(({ eventDate, guests }: { eventDate: string; guests: number }) => {
    router.push(`/booking/venue?venueId=${venue.id}&date=${eventDate}&guests=${guests}`);
  }, [router, venue.id]);

  const handleContactOwner = useCallback(() => {
    router.push(`/messages?to=${venue.host?.id || ''}`);
  }, [router, venue.host?.id]);

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      <LightboxGallery
        isOpen={store.galleryOpen}
        images={venue.images || []}
        title={venue.title}
        activeIndex={store.activeImageIndex}
        onClose={() => store.setGalleryOpen(false)}
        onNext={() => store.nextImage(venue.images?.length || 0)}
        onPrev={() => store.prevImage(venue.images?.length || 0)}
      />

      <VenueNavHeader title={venue.title} onBack={handleBack} />

      <main className="grow pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <VenueHero
            title={venue.title}
            rating={venue.rating}
            reviews={venue.reviews}
            location={venue.location}
            province={venue.province}
          />

          <VenueGalleryGrid images={venue.images || []} onOpenGallery={store.openGallery} />

          <div className="grid lg:grid-cols-[1.8fr_1fr] gap-16 relative">
            {/* Left Column */}
            <div className="space-y-10">

              {/* Owner card */}
              <div className="bg-surface-highlight/30 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="relative shrink-0">
                    <img
                      src={host.avatar}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                      alt={host.name}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-accent text-black rounded-full p-1 border-4 border-[#0f111a] flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-white text-lg">Listed by {host.name}</h3>
                    <p className="text-[#ccff00] text-xs font-bold uppercase tracking-wider mb-2">Mayor · Space Provider</p>
                    <p className="text-sm text-text-muted leading-relaxed">"{host.bio}"</p>
                  </div>
                </div>
              </div>

              {/* Venue highlights */}
              <div className="space-y-6">
                {venue.capacity && (
                  <div className="flex gap-4 items-start">
                    <span className="material-symbols-outlined text-white text-2xl mt-1">groups</span>
                    <div>
                      <h3 className="font-bold text-white text-base">Up to {venue.cap || `${venue.capacity} guests`}</h3>
                      <p className="text-sm text-text-muted">Capacity for your event attendees.</p>
                    </div>
                  </div>
                )}
                {venue.spaceType?.length > 0 && (
                  <div className="flex gap-4 items-start">
                    <span className="material-symbols-outlined text-white text-2xl mt-1">apartment</span>
                    <div>
                      <h3 className="font-bold text-white text-base capitalize">
                        {venue.spaceType.map((s: string) => s.replace(/_/g, ' ')).join(', ')}
                      </h3>
                      <p className="text-sm text-text-muted">Space configuration available.</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-white text-2xl mt-1">event_available</span>
                  <div>
                    <h3 className="font-bold text-white text-base">Flexible booking</h3>
                    <p className="text-sm text-text-muted">Request a date and the owner will confirm availability.</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/10 w-full" />

              {/* About */}
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">About this venue</h3>
                <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
                  {venue.description || 'No description provided.'}
                </p>
              </div>

              <div className="h-px bg-white/10 w-full" />

              {/* Amenities */}
              {venue.amenities?.length > 0 && (
                <>
                  <AmenitiesSection offers={venue.amenities} />
                  <div className="h-px bg-white/10 w-full" />
                </>
              )}

              {/* Calendar */}
              <VenueCalendar
                checkInDate={store.checkInDate}
                checkOutDate={store.checkOutDate}
                onDateClick={store.handleDateClick}
                onClearDates={store.clearDates}
              />
              <div className="h-px bg-white/10 w-full" />

              <VenueReviews venueId={venue.id} rating={venue.rating} totalReviews={venue.reviews} />
              <div className="h-px bg-white/10 w-full" />

              <VenueMap location={venue.location} province={venue.province} />
              <div className="h-px bg-white/10 w-full" />

              <HostBio host={{ ...host, createdAt: venue.host?.createdAt }} />
              <div className="h-px bg-white/10 w-full" />

              <HouseRules policies={venue.policies || []} />
            </div>

            {/* Right Column: Venue Booking Widget */}
            <div className="lg:sticky lg:top-32 lg:h-fit">
              <BookingWidget
                price={venue.price}
                billingRate={venue.billingRate}
                rating={venue.rating || 0}
                reviews={venue.reviews || 0}
                capacity={venue.cap}
                onRequestBook={handleRequestBook}
                onContactOwner={handleContactOwner}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
