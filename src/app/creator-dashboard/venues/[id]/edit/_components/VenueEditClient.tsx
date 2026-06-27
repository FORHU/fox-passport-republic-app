"use client";

import React, { Suspense } from "react";
import RequireAuth from "@/features/auth/components/RequireAuth";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  VenueHeader,
  VenueResourcePalette,
  VenueDetailsForm,
  FeatureDropZone,
  RevenueProjector,
} from "@/features/venue/components/venue-builder";
import { useHostVenueEdit } from "@/features/venue/hooks/useHostVenueEdit";

interface Props { id: string; }

function VenueEditContent({ id }: Props) {
  const {
    isPrefilling, prefillError,
    venueName, description, venueType, capacity, location, city, state, country,
    gallery, includedItems, addonItems, baseRate, occupancyRate, activeCategory,
    searchQuery, showGuide, isSubmitting, isDragOver, newItem, filteredResources,
    revenue, currentCategoryLabel,
    setVenueName, setDescription, setVenueType, setCapacity, setLocation, setCity,
    setState, setCountry, removeIncludedItem, removeAddonItem, setBaseRate,
    setOccupancyRate, setActiveCategory, setSearchQuery, setShowGuide, setNewItem,
    handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleAddCustomItem,
    handleRemoveCustomResource, addImageToGallery, removeImageFromGallery,
    handleBack, handleSaveDraft, handlePublish,
  } = useHostVenueEdit(id);

  return (
    <RequireAuth>
      {!id ? (
        <div className="fixed inset-0 z-[80] bg-[#02040a] text-white flex items-center justify-center">
          <div className="glass-panel rounded-[2rem] p-12 border border-red-500/20">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div className="text-sm font-bold">Invalid venue id</div>
            </div>
          </div>
        </div>
      ) : prefillError ? (
        <div className="fixed inset-0 z-[80] bg-[#02040a]/90 text-white flex items-center justify-center">
          <div className="glass-panel rounded-[2rem] p-12 border border-red-500/20 text-center max-w-lg w-full">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div className="text-sm font-bold">Unable to load this venue</div>
              <div className="text-xs text-white/50">{prefillError}</div>
              <button onClick={handleBack} className="mt-4 px-4 py-2 rounded-full border border-white/10 text-xs font-bold hover:bg-white hover:text-black">Back to Venues</button>
            </div>
          </div>
        </div>
      ) : isPrefilling ? (
        <div className="fixed inset-0 z-[80] bg-[#02040a]/90 text-white flex items-center justify-center">
          <div className="glass-panel rounded-[2rem] p-12 border border-white/5">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-[#ccff00] animate-spin" />
              <div className="text-sm text-white/50">Loading venue...</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-60 bg-[#02040a] text-white flex flex-col font-body">
          <VenueHeader venueName={venueName} isSubmitting={isSubmitting} onBack={handleBack} onSaveDraft={handleSaveDraft} onPublish={handlePublish} />
          <div className="flex-1 flex overflow-hidden">
            <VenueResourcePalette activeCategory={activeCategory} searchQuery={searchQuery} filteredResources={filteredResources} newItem={newItem} currentCategoryLabel={currentCategoryLabel} onCategoryChange={setActiveCategory} onSearchChange={setSearchQuery} onNewItemChange={setNewItem} onAddCustomItem={handleAddCustomItem} onRemoveResource={handleRemoveCustomResource} onDragStart={handleDragStart} />
            <main className="flex-1 overflow-y-auto p-8 bg-[#02040a] flex gap-8">
              <div className="flex-1 max-w-4xl mx-auto space-y-8">
                <VenueDetailsForm venueName={venueName} description={description} venueType={venueType} capacity={capacity} location={location} city={city} state={state} country={country} gallery={gallery} showGuide={showGuide} onNameChange={setVenueName} onDescriptionChange={setDescription} onTypeChange={setVenueType} onCapacityChange={setCapacity} onLocationChange={setLocation} onCityChange={setCity} onStateChange={setState} onCountryChange={setCountry} onAddImage={addImageToGallery} onRemoveImage={removeImageFromGallery} onCloseGuide={() => setShowGuide(false)} />
                <FeatureDropZone type="included" items={includedItems} isDragOver={isDragOver} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onRemoveItem={removeIncludedItem} />
                <FeatureDropZone type="addon" items={addonItems} isDragOver={isDragOver} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onRemoveItem={removeAddonItem} />
              </div>
            </main>
            <RevenueProjector baseRate={baseRate} occupancyRate={occupancyRate} monthlyBase={revenue.monthlyBase} monthlyAddons={revenue.monthlyAddons} total={revenue.total} onBaseRateChange={setBaseRate} onOccupancyRateChange={setOccupancyRate} onPreview={() => {}} />
          </div>
        </div>
      )}
    </RequireAuth>
  );
}

export default function VenueEditClient({ id }: Props) {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#02040a]" />}>
      <VenueEditContent id={id} />
    </Suspense>
  );
}
