'use client';

import React from 'react';
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
    gallery,
    includedItems,
    addonItems,
    baseRate,
    occupancyRate,
    activeCategory,
    searchQuery,
    showGuide,
    showCustomForm,
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
    removeGalleryItem,
    removeIncludedItem,
    removeAddonItem,
    setBaseRate,
    setOccupancyRate,
    setActiveCategory,
    setSearchQuery,
    setShowGuide,
    setShowCustomForm,
    setNewItem,
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAddCustomItem,
    addImageToGallery,
    handleBack,
    handleSaveDraft,
    handlePublish,
  } = useVenueBuilder();

  return (
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
          showCustomForm={showCustomForm}
          newItem={newItem}
          currentCategoryLabel={currentCategoryLabel}
          onCategoryChange={setActiveCategory}
          onSearchChange={setSearchQuery}
          onShowCustomForm={setShowCustomForm}
          onNewItemChange={setNewItem}
          onAddCustomItem={handleAddCustomItem}
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
              gallery={gallery}
              showGuide={showGuide}
              onNameChange={setVenueName}
              onDescriptionChange={setDescription}
              onTypeChange={setVenueType}
              onCapacityChange={setCapacity}
              onLocationChange={setLocation}
              onAddImage={addImageToGallery}
              onRemoveImage={removeGalleryItem}
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
  );
}
