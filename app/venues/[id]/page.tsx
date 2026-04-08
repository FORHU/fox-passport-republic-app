"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useVenueDetail } from "@/hooks/venues/useVenueDetail";
import { MOCK_VENUE, MOCK_HOST } from "@/data/venueDetailData";
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

export default function EventDetailsPage() {
  const { id } = useParams();
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
  }, [id]);

  const venue = MOCK_VENUE;
  const host = MOCK_HOST;

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      <CustomExperienceBuilder
        isOpen={isCustomBookingOpen}
        onClose={() => setCustomBookingOpen(false)}
        venuePrice={venue.price}
      />

      <LightboxGallery
        isOpen={galleryOpen}
        images={venue.images}
        title={venue.title}
        activeIndex={activeImageIndex}
        onClose={() => setGalleryOpen(false)}
        onNext={() => nextImage(venue.images.length)}
        onPrev={() => prevImage(venue.images.length)}
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

          <VenueGalleryGrid images={venue.images} onOpenGallery={openGallery} />

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
              <AmenitiesSection offers={venue.offers} />
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
            <div className="relative">
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

      {/* Footer */}
      <footer className="bg-black pt-20 pb-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white">explore</span>
              <span className="text-xl font-display font-bold text-white">FoxPassport</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              © 2024 FoxPassport Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                className="text-xs text-gray-500 hover:text-white font-medium transition-colors"
                href="#"
              >
                Privacy
              </a>
              <a
                className="text-xs text-gray-500 hover:text-white font-medium transition-colors"
                href="#"
              >
                Terms
              </a>
              <a
                className="text-xs text-gray-500 hover:text-white font-medium transition-colors"
                href="#"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}