'use client';

import React, { useEffect } from "react";
import { useVenueDetail } from "@/hooks/venues/useVenueDetail";
import {
  VenueNavHeader,
  VenueHero,
  VenueGalleryGrid,
  LightboxGallery,
  BookingWidget,
  CuratorSection,
  HighlightsSection,
  DescriptionSection,
  InclusionsSection,
  AmenitiesSection,
  VenueCalendar,
  VenueReviews,
  VenueMap,
  HostBio,
  HouseRules,
  CustomExperienceBuilder,
} from "@/components/venues/detail";

interface VenueDetailClientProps {
  venue: any;
  host: any;
}

export default function VenueDetailClient({ venue, host }: VenueDetailClientProps) {
  const {
    galleryOpen,
    activeImageIndex,
    isCustomBookingOpen,
    checkInDate,
    checkOutDate,
    nights,
    openGallery,
    setGalleryOpen,
    nextImage,
    prevImage,
    setCustomBookingOpen,
    handleDateClick,
    clearDates,
    handleReserve,
    handleBack,
  } = useVenueDetail();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      <CustomExperienceBuilder
        isOpen={isCustomBookingOpen}
        onClose={() => setCustomBookingOpen(false)}
        venuePrice={venue.price}
      />

      <LightboxGallery
        isOpen={galleryOpen}
        images={venue.images || []}
        title={venue.title}
        activeIndex={activeImageIndex}
        onClose={() => setGalleryOpen(false)}
        onNext={() => nextImage(venue.images?.length || 0)}
        onPrev={() => prevImage(venue.images?.length || 0)}
      />

      <VenueNavHeader title={venue.title} onBack={handleBack} />

      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <VenueHero
            title={venue.title}
            rating={venue.rating}
            reviews={venue.reviews}
            location={venue.location}
            province={venue.province}
          />

          <VenueGalleryGrid images={venue.images || []} onOpenGallery={openGallery} />

          <div className="grid lg:grid-cols-[1.8fr_1fr] gap-16 relative">
            {/* Left Column: Details */}
            <div className="space-y-10">
              <CuratorSection host={host} />
              <HighlightsSection />
              <div className="h-px bg-white/10 w-full" />
              <DescriptionSection description={venue.description} />
              <div className="h-px bg-white/10 w-full" />
              <InclusionsSection onOpenCustomBuilder={() => setCustomBookingOpen(true)} />
              <div className="h-px bg-white/10 w-full" />
              <AmenitiesSection offers={venue.offers || []} />
              <div className="h-px bg-white/10 w-full" />
              <VenueCalendar
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                onDateClick={handleDateClick}
                onClearDates={clearDates}
              />
              <div className="h-px bg-white/10 w-full" />
              <VenueReviews rating={venue.rating} totalReviews={venue.reviews} />
              <div className="h-px bg-white/10 w-full" />
              <VenueMap location={venue.location} province={venue.province} />
              <div className="h-px bg-white/10 w-full" />
              <HostBio host={host} />
              <div className="h-px bg-white/10 w-full" />
              <HouseRules />
            </div>

            {/* Right Column: Booking Widget */}
            <div className="lg:sticky lg:top-32 lg:h-fit">
              <BookingWidget
                price={venue.price}
                rating={venue.rating}
                reviews={venue.reviews}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                nights={nights}
                onReserve={handleReserve}
                onOpenCustomBuilder={() => setCustomBookingOpen(true)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}