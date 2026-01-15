'use client';

import React from 'react';
import { useEventBuilder } from '@/hooks/events/useEventBuilder';
import {
  ResourcePalette,
  EventHeader,
  EventDetailsForm,
  EventGallery,
  CorePackageDropZone,
  EventBlueprint,
} from '@/components/foxer/event-builder';

export default function EventCreationBuilder() {
  const {
    // State
    eventTitle,
    description,
    category,
    date,
    location,
    gallery,
    baseItems,
    targetMargin,
    activeCategory,
    searchQuery,
    showGuide,
    isSubmitting,
    isDragOver,
    filteredResources,
    financials,
    blueprintHealth,
    
    // Actions
    setEventTitle,
    setDescription,
    setCategory,
    setDate,
    setLocation,
    setActiveCategory,
    setSearchQuery,
    setShowGuide,
    setTargetMargin,
    removeBaseItem,
    removeGalleryItem,
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    addImageToGallery,
    handleBack,
    handleSaveDraft,
    handlePublish,
  } = useEventBuilder();

  return (
    <div className="fixed inset-0 z-[60] bg-[#02040a] text-white flex flex-col font-body">
      <EventHeader
        eventTitle={eventTitle}
        isSubmitting={isSubmitting}
        onBack={handleBack}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      <div className="flex-1 flex overflow-hidden">
        <ResourcePalette
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          filteredResources={filteredResources}
          onCategoryChange={setActiveCategory}
          onSearchChange={setSearchQuery}
          onDragStart={handleDragStart}
        />

        <main className="flex-1 overflow-y-auto p-8 bg-[#02040a] flex gap-8">
          <div className="flex-1 max-w-4xl mx-auto space-y-8">
            <EventDetailsForm
              eventTitle={eventTitle}
              description={description}
              category={category}
              date={date}
              location={location}
              showGuide={showGuide}
              onTitleChange={setEventTitle}
              onDescriptionChange={setDescription}
              onCategoryChange={setCategory}
              onDateChange={setDate}
              onLocationChange={setLocation}
              onCloseGuide={() => setShowGuide(false)}
            />

            <EventGallery
              gallery={gallery}
              onAddImage={addImageToGallery}
              onRemoveImage={removeGalleryItem}
            />

            <CorePackageDropZone
              baseItems={baseItems}
              isDragOver={isDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onRemoveItem={removeBaseItem}
            />
          </div>
        </main>

        <EventBlueprint
          baseItems={baseItems}
          targetMargin={targetMargin}
          baseCost={financials.baseCost}
          suggestedPrice={financials.suggestedPrice}
          venueCost={financials.venueCost}
          talentCost={financials.talentCost}
          blueprintHealth={blueprintHealth}
          galleryCount={gallery.length}
          onMarginChange={setTargetMargin}
        />
      </div>
    </div>
  );
}
