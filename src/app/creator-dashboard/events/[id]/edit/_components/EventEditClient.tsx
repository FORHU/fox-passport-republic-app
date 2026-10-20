"use client";

import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/shared/auth/RequireAuth";
import { Loader2, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet";
import {
  ResourcePalette,
  EventHeader,
  EventDetailsForm,
  EventGallery,
  CorePackageDropZone,
  EventBlueprint,
} from "@/features/event/components/event-builder";
import { TeamPanel } from "@/features/appointment/components/TeamPanel";
import { useHostEventEdit } from "@/features/event/hooks/useHostEventEdit";

interface Props {
  id: string;
}

function EventEditContent({ id }: Props) {
  const router = useRouter();
  // Below `md` the palette and blueprint live in drawers, and resources are
  // added with a tap — drag and drop does not fire on touch screens.
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [blueprintOpen, setBlueprintOpen] = useState(false);
  const {
    isPrefilling,
    prefillError,
    eventTitle,
    description,
    category,
    categoryOther,
    date,
    location,
    targetCity,
    targetState,
    targetCountry,
    maxAttendees,
    showGuide,
    cancellationPolicyId,
    activeCategory,
    searchQuery,
    filteredResources,
    financials,
    blueprintHealth,
    gallery,
    baseItems,
    targetMargin,
    isSubmitting,
    saveStatus,
    isDragOver,
    activeEventId,
    setActiveCategory,
    setEventTitle,
    setDescription,
    setCategory,
    setCategoryOther,
    setDate,
    setLocation,
    setTargetCity,
    setTargetState,
    setTargetCountry,
    setMaxAttendees,
    setCancellationPolicyId,
    setShowGuide,
    setSearchQuery,
    setTargetMargin,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    addResourceToCore,
    addImageToGallery,
    removeGalleryItem,
    removeBaseItem,
    updateBaseItem,
    handleBack,
    handleSaveDraft,
    handlePublish,
  } = useHostEventEdit(id);

  return (
    <RequireAuth>
      {!id ? (
        <div className="fixed inset-0 z-80 bg-canvas text-white flex items-center justify-center">
          <div className="glass-panel rounded-[2rem] p-12 border border-red-500/20">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div className="text-sm font-bold">Invalid event id</div>
            </div>
          </div>
        </div>
      ) : prefillError ? (
        <div className="fixed inset-0 z-80 bg-canvas/90 text-white flex items-center justify-center">
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
        <div className="fixed inset-0 z-80 bg-canvas/90 text-white flex items-center justify-center">
          <div className="glass-panel rounded-[2rem] p-12 border border-white/5">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
              <div className="text-sm text-white/50">Loading event...</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-60 bg-canvas text-white flex flex-col font-body">
          <EventHeader
            eventTitle={eventTitle}
            isSubmitting={isSubmitting}
            saveStatus={saveStatus}
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            onTogglePalette={() => setPaletteOpen(true)}
            onToggleBlueprint={() => setBlueprintOpen(true)}
          />
          <div className="flex-1 flex overflow-hidden relative">
            <ResourcePalette
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              filteredResources={filteredResources}
              onCategoryChange={setActiveCategory}
              onSearchChange={setSearchQuery}
              onDragStart={handleDragStart}
              onSelectItem={addResourceToCore}
            />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-canvas flex gap-8">
              <div className="flex-1 min-w-0 space-y-6 sm:space-y-8 pb-12 sm:pb-0">
                <EventDetailsForm
                  eventTitle={eventTitle}
                  description={description}
                  category={category}
                  categoryOther={categoryOther}
                  date={date}
                  location={location}
                  targetCity={targetCity}
                  targetState={targetState}
                  targetCountry={targetCountry}
                  maxAttendees={maxAttendees}
                  showGuide={showGuide}
                  cancellationPolicyId={cancellationPolicyId}
                  onTitleChange={setEventTitle}
                  onDescriptionChange={setDescription}
                  onCategoryChange={setCategory}
                  onCategoryOtherChange={setCategoryOther}
                  onDateChange={setDate}
                  onLocationChange={setLocation}
                  onTargetCityChange={setTargetCity}
                  onTargetStateChange={setTargetState}
                  onTargetCountryChange={setTargetCountry}
                  onMaxAttendeesChange={setMaxAttendees}
                  onCancellationPolicyChange={setCancellationPolicyId}
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
                <TeamPanel
                  target={
                    activeEventId ? { type: "event", id: activeEventId } : null
                  }
                  unavailableMessage="You can add organizers and helpers once this event is booked and scheduled."
                />
              </div>
            </main>
            <EventBlueprint
              targetMargin={targetMargin}
              baseCost={financials.baseCost}
              listingCost={financials.listingCost}
              suggestedPrice={financials.suggestedPrice}
              venueCost={financials.venueCost}
              talentCost={financials.talentCost}
              serviceCost={financials.serviceCost}
              baseItems={baseItems}
              blueprintHealth={blueprintHealth}
              onMarginChange={(m: number) => setTargetMargin(m)}
              onPreview={async () => {
                await handleSaveDraft();
                router.push(`/event/${id}?preview=1`);
              }}
            />

            {/* Mobile palette drawer */}
            <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
              <SheetContent
                side="left"
                className="bg-surface border-white/10 w-[88vw] sm:max-w-md p-0 flex flex-col h-full"
              >
                <SheetTitle className="sr-only">Resource Palette</SheetTitle>
                <div className="flex-1 overflow-y-auto flex flex-col pt-8">
                  <ResourcePalette
                    activeCategory={activeCategory}
                    searchQuery={searchQuery}
                    filteredResources={filteredResources}
                    onCategoryChange={setActiveCategory}
                    onSearchChange={setSearchQuery}
                    onDragStart={handleDragStart}
                    onSelectItem={(item) => {
                      const ok = addResourceToCore(item);
                      if (ok) setPaletteOpen(false);
                    }}
                    inDrawer
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile blueprint drawer */}
            <Sheet open={blueprintOpen} onOpenChange={setBlueprintOpen}>
              <SheetContent
                side="right"
                className="bg-surface border-white/10 w-[88vw] sm:max-w-md p-0 flex flex-col h-full"
              >
                <SheetTitle className="sr-only">Financial Blueprint</SheetTitle>
                <div className="flex-1 overflow-y-auto flex flex-col pt-8">
                  <EventBlueprint
                    targetMargin={targetMargin}
                    baseCost={financials.baseCost}
                    listingCost={financials.listingCost}
                    suggestedPrice={financials.suggestedPrice}
                    venueCost={financials.venueCost}
                    talentCost={financials.talentCost}
                    serviceCost={financials.serviceCost}
                    baseItems={baseItems}
                    blueprintHealth={blueprintHealth}
                    onMarginChange={(m: number) => setTargetMargin(m)}
                    onPreview={async () => {
                      await handleSaveDraft();
                      router.push(`/event/${id}?preview=1`);
                    }}
                    inDrawer
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}
    </RequireAuth>
  );
}

export default function EventEditClient({ id }: Props) {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-canvas" />}>
      <EventEditContent id={id} />
    </Suspense>
  );
}
