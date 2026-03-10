'use client';

import React from 'react';
import RequireAuth from '@/components/authentication/RequireAuth';
import { useVenueBuilder } from '@/hooks/venues/useVenueBuilder';
import {
  VenueHeader,
  VenueResourcePalette,
  VenueDetailsForm,
  FeatureDropZone,
  RevenueProjector,
} from '@/components/mayor/venue-builder';

export default function VenueCreationBuilder() {
  const {
    // State
    venueName,
    description,
    venueType,
    capacity,
    location,
    city,
    state,
    country,
    gallery,
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

    // Actions
    setVenueName,
    setDescription,
    setVenueType,
    setCapacity,
    setLocation,
    setCity,
    setState,
    setCountry,
    removeGalleryItem,
    removeIncludedItem,
    removeAddonItem,
    setBaseRate,
    setOccupancyRate,
    setActiveCategory,
    setSearchQuery,
    setShowGuide,
    setNewItem,

    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAddCustomItem,
    handleRemoveCustomResource,
    addImageToGallery,
    removeImageFromGallery,
    handleBack,
    handleSaveDraft,
    handlePublish,
  } = useVenueBuilder();

  return (
    <RequireAuth>
      <div className="fixed inset-0 z-60 bg-[#02040a] text-white flex flex-col font-body">
        <VenueHeader
          venueName={venueName}
          isSubmitting={isSubmitting}
          onBack={handleBack}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />

        <div className="flex-1 flex overflow-hidden">
          <VenueResourcePalette
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            filteredResources={filteredResources}
            newItem={newItem}
            currentCategoryLabel={currentCategoryLabel}
            onCategoryChange={setActiveCategory}
            onSearchChange={setSearchQuery}
            onNewItemChange={setNewItem}
            onAddCustomItem={handleAddCustomItem}
            onRemoveResource={handleRemoveCustomResource}
            onDragStart={handleDragStart}
          />

          <main className="flex-1 overflow-y-auto p-8 bg-[#02040a] flex gap-8">
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
                gallery={gallery}
                showGuide={showGuide}
                onNameChange={setVenueName}
                onDescriptionChange={setDescription}
                onTypeChange={setVenueType}
                onCapacityChange={setCapacity}
                onLocationChange={setLocation}
                onCityChange={setCity}
                onStateChange={setState}
                onCountryChange={setCountry}
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

          <RevenueProjector
            baseRate={baseRate}
            occupancyRate={occupancyRate}
            monthlyBase={revenue.monthlyBase}
            monthlyAddons={revenue.monthlyAddons}
            total={revenue.total}
            onBaseRateChange={setBaseRate}
            onOccupancyRateChange={setOccupancyRate}
          />
        </div>
      </div>
    </RequireAuth>
  );
}
