"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/authentication/RequireAuth";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  ResourcePalette,
  EventHeader,
  EventDetailsForm,
  EventGallery,
  CorePackageDropZone,
  EventBlueprint,
} from "@/components/foxer/event-builder";
import { useHostEventEdit } from "@/hooks/dashboards/useHostEventEdit";

function HostEventEditPageContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? String(params.id) : "";

  const {
    // Prefill
    isPrefilling,
    prefillError,

    // Event details
    eventTitle,
    description,
    category,
    date,
    location,
    maxAttendees,
    showGuide,

    // Palette/real resources
    activeCategory,
    searchQuery,
    filteredResources,
    financials,
    blueprintHealth,
    gallery,
    baseItems,
    targetMargin,
    isSubmitting,
    isDragOver,
    // Handlers (create UI + edit overrides)
    setActiveCategory,
    setEventTitle,
    setDescription,
    setCategory,
    setDate,
    setLocation,
    setMaxAttendees,
    setShowGuide,
    setSearchQuery,
    setTargetMargin,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    addImageToGallery,
    removeGalleryItem,
    removeBaseItem,
    updateBaseItem,
    // Overridden handlers
    handleBack,
    handleSaveDraft,
    handlePublish,
  } = useHostEventEdit(id);

  return (
    <RequireAuth>
      {!id ? (
        <div className="fixed inset-0 z-[80] bg-[#02040a] text-white flex items-center justify-center">
          <div className="glass-panel rounded-[2rem] p-12 border border-red-500/20">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div className="text-sm font-bold">Invalid event id</div>
            </div>
          </div>
        </div>
      ) : prefillError ? (
        <div className="fixed inset-0 z-[80] bg-[#02040a]/90 text-white flex items-center justify-center">
          <div className="glass-panel rounded-[2rem] p-12 border border-red-500/20 text-center max-w-lg w-full">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div className="text-sm font-bold">Unable to load this event</div>
              <div className="text-xs text-white/50">{prefillError}</div>
              <button
                onClick={handleBack}
                className="mt-4 px-4 py-2 rounded-full border border-white/10 text-xs font-bold hover:bg-white hover:text-black"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>
      ) : isPrefilling ? (
        <div className="fixed inset-0 z-[80] bg-[#02040a]/90 text-white flex items-center justify-center">
          <div className="glass-panel rounded-[2rem] p-12 border border-white/5">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-[#ccff00] animate-spin" />
              <div className="text-sm text-white/50">Loading event...</div>
            </div>
          </div>
        </div>
      ) : (
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
                  maxAttendees={maxAttendees}
                  showGuide={showGuide}
                  onTitleChange={setEventTitle}
                  onDescriptionChange={setDescription}
                  onCategoryChange={setCategory}
                  onDateChange={setDate}
                  onLocationChange={setLocation}
                  onMaxAttendeesChange={setMaxAttendees}
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
                  onUpdateItem={updateBaseItem}
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
              onMarginChange={(m: number) => setTargetMargin(m)}
            />
          </div>
        </div>
      )}
    </RequireAuth>
  );
}

export default function HostEventEditPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#02040a]" />}>
      <HostEventEditPageContent />
    </Suspense>
  );
}

