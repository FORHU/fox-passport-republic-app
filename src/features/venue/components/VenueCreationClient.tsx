"use client";

import React, { useState, useEffect } from "react";
import RequireAuth from "@/shared/auth/RequireAuth";
import { useVenueBuilder } from "@/features/venue/hooks/useVenueBuilder";
import { useVenueBuilderStore } from "@/features/venue/store/useVenueBuilderStore";
import {
  VenueHeader,
  VenueResourcePalette,
  VenueDetailsForm,
  FeatureDropZone,
  RevenueProjector,
  VenuePreviewModal,
} from "@/features/venue/components/venue-builder";

export default function VenueCreationClient() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<
    "details" | "resources" | "revenue"
  >("details");
  const resetStore = useVenueBuilderStore((s) => s.reset);

  useEffect(() => {
    resetStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    venueName,
    description,
    venueType,
    capacity,
    location,
    city,
    state,
    country,
    lat,
    lng,
    boundary,
    gallery,
    cancellationPolicyId,
    includedItems,
    addonItems,
    baseRate,
    occupancyRate,
    activeCategory,
    searchQuery,
    showGuide,
    isSubmitting,
    isDragOver,
    newItem,
    filteredResources,
    revenue,
    currentCategoryLabel,
    setVenueName,
    setDescription,
    setVenueType,
    setCapacity,
    setLocation,
    setCity,
    setState,
    setCountry,
    setLat,
    setLng,
    setBoundary,
    setCancellationPolicyId,
    removeIncludedItem,
    removeAddonItem,
    setBaseRate,
    setOccupancyRate,
    setActiveCategory,
    setSearchQuery,
    setShowGuide,
    setNewItem,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAddCustomItem,
    handleAddCatalogItem,
    handleRemoveCustomResource,
    addImageToGallery,
    removeImageFromGallery,
    handleBack,
    handleSaveDraft,
    handlePublish,
    catalogItems,
  } = useVenueBuilder();

  return (
    <RequireAuth>
      <VenuePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        venueName={venueName}
        description={description}
        venueType={venueType}
        capacity={capacity}
        location={location}
        city={city}
        state={state}
        country={country}
        gallery={gallery}
        includedItems={includedItems}
        addonItems={addonItems}
        baseRate={baseRate}
      />

      <div className="fixed inset-0 z-60 bg-[#02040a] text-white flex flex-col font-body">
        <VenueHeader
          venueName={venueName}
          isSubmitting={isSubmitting}
          onBack={handleBack}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />

        {/* Mobile View Selector Tabs */}
        <div className="xl:hidden flex items-center bg-[#0f111a] border-b border-white/10 px-3 py-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab("details")}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "details"
                ? "bg-[#ccff00] text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span>Details & Map</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("resources")}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "resources"
                ? "bg-[#ccff00] text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              category
            </span>
            <span>Resources</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("revenue")}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "revenue"
                ? "bg-[#ccff00] text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              payments
            </span>
            <span>Pricing</span>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Resource Palette (visible on desktop or when resources tab active) */}
          <div
            className={`${
              mobileTab === "resources" ? "flex w-full" : "hidden"
            } xl:flex overflow-hidden shrink-0`}
          >
            <VenueResourcePalette
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              filteredResources={filteredResources}
              catalogItems={catalogItems}
              newItem={newItem}
              currentCategoryLabel={currentCategoryLabel}
              onCategoryChange={setActiveCategory}
              onSearchChange={setSearchQuery}
              onNewItemChange={setNewItem}
              onAddCustomItem={handleAddCustomItem}
              onAddCatalogItem={handleAddCatalogItem}
              onRemoveResource={handleRemoveCustomResource}
              onDragStart={handleDragStart}
            />
          </div>

          {/* Column 2: Main Details Form & Polygon Map */}
          <main
            className={`${
              mobileTab === "details" ? "flex" : "hidden"
            } xl:flex flex-1 overflow-y-auto p-4 sm:p-8 bg-[#02040a] gap-8`}
          >
            <div className="flex-1 max-w-4xl mx-auto space-y-8">
              <VenueDetailsForm
                venueName={venueName}
                description={description}
                venueType={venueType}
                capacity={capacity}
                location={location}
                city={city}
                state={state}
                country={country}
                lat={lat}
                lng={lng}
                boundary={boundary}
                gallery={gallery}
                showGuide={showGuide}
                cancellationPolicyId={cancellationPolicyId}
                onNameChange={setVenueName}
                onDescriptionChange={setDescription}
                onTypeChange={setVenueType}
                onCapacityChange={setCapacity}
                onLocationChange={setLocation}
                onCityChange={setCity}
                onStateChange={setState}
                onCountryChange={setCountry}
                onLatLngChange={(lat, lng) => {
                  setLat(lat);
                  setLng(lng);
                }}
                onBoundaryChange={setBoundary}
                onCancellationPolicyChange={setCancellationPolicyId}
                onAddImage={addImageToGallery}
                onRemoveImage={removeImageFromGallery}
                onCloseGuide={() => setShowGuide(false)}
              />
              <FeatureDropZone
                type="included"
                items={includedItems}
                isDragOver={isDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemoveItem={removeIncludedItem}
              />
              <FeatureDropZone
                type="addon"
                items={addonItems}
                isDragOver={isDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemoveItem={removeAddonItem}
              />
            </div>
          </main>

          {/* Column 3: Revenue & Pricing */}
          <div
            className={`${
              mobileTab === "revenue" ? "flex w-full" : "hidden"
            } xl:flex shrink-0 overflow-y-auto`}
          >
            <RevenueProjector
              baseRate={baseRate}
              occupancyRate={occupancyRate}
              monthlyBase={revenue.monthlyBase}
              monthlyAddons={revenue.monthlyAddons}
              total={revenue.total}
              onBaseRateChange={setBaseRate}
              onOccupancyRateChange={setOccupancyRate}
              onPreview={() => setIsPreviewOpen(true)}
            />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
