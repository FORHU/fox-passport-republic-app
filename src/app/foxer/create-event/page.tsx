"use client";

import { useRouter } from "next/navigation";
import RequireAuth from "@/shared/auth/RequireAuth";
import { useEventBuilder } from "@/features/event/hooks/useEventBuilder";
import { useEventBuilderStore } from "@/features/event/store/useEventBuilderStore";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import {
  ResourcePalette,
  EventHeader,
  EventDetailsForm,
  EventGallery,
  CorePackageDropZone,
  EventBlueprint,
} from "@/features/event/components/event-builder";

export default function EventCreationBuilder() {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [blueprintOpen, setBlueprintOpen] = useState(false);

  const {
    // State
    eventTitle,
    description,
    category,
    date,
    location,
    maxAttendees,
    gallery,
    cancellationPolicyId,
    baseItems,
    targetMargin,
    activeCategory,
    searchQuery,
    showGuide,
    isSubmitting,
    saveStatus,
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
    setTargetCity,
    setTargetState,
    setTargetCountry,
    setLat,
    setLng,
    setMaxAttendees,
    setCancellationPolicyId,
    setActiveCategory,
    setSearchQuery,
    setShowGuide,
    setTargetMargin,
    removeBaseItem,
    updateBaseItem,
    removeGalleryItem,

    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    addResourceToCore,
    addImageToGallery,
    handleBack,
    handleSaveDraft,
    handlePublish,
  } = useEventBuilder();

  const handlePreview = async () => {
    // Save with inclusions sync so the preview reflects the full Core Package
    await handleSaveDraft({ syncInclusions: true });
    const id = useEventBuilderStore.getState().draftId;
    if (id) {
      router.push(`/event/${id}?preview=1`);
    }
  };

  return (
    <RequireAuth>
      <div className="fixed inset-0 z-60 bg-[#02040a] text-white flex flex-col font-body">
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
          {/* Desktop docked palette */}
          <ResourcePalette
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            filteredResources={filteredResources}
            onCategoryChange={setActiveCategory}
            onSearchChange={setSearchQuery}
            onDragStart={handleDragStart}
            onSelectItem={addResourceToCore}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#02040a] flex gap-8">
            <div className="flex-1 max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12 sm:pb-0">
              <EventDetailsForm
                eventTitle={eventTitle}
                description={description}
                category={category}
                date={date}
                location={location}
                maxAttendees={maxAttendees}
                showGuide={showGuide}
                cancellationPolicyId={cancellationPolicyId}
                onTitleChange={setEventTitle}
                onDescriptionChange={setDescription}
                onCategoryChange={setCategory}
                onDateChange={setDate}
                onLocationChange={setLocation}
                onTargetCityChange={setTargetCity}
                onTargetStateChange={setTargetState}
                onTargetCountryChange={setTargetCountry}
                onLatLngChange={(lat, lng) => {
                  setLat(lat);
                  setLng(lng);
                }}
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
            </div>
          </main>

          {/* Desktop docked blueprint */}
          <EventBlueprint
            targetMargin={targetMargin}
            baseCost={financials.baseCost}
            suggestedPrice={financials.suggestedPrice}
            venueCost={financials.venueCost}
            talentCost={financials.talentCost}
            blueprintHealth={blueprintHealth}
            onMarginChange={setTargetMargin}
            onPreview={handlePreview}
          />

          {/* Mobile Palette Drawer */}
          <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
            <SheetContent
              side="left"
              className="bg-[#0f111a] border-white/10 w-[88vw] sm:max-w-md p-0 flex flex-col h-full"
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

          {/* Mobile Blueprint Drawer */}
          <Sheet open={blueprintOpen} onOpenChange={setBlueprintOpen}>
            <SheetContent
              side="right"
              className="bg-[#0f111a] border-white/10 w-[88vw] sm:max-w-md p-0 flex flex-col h-full"
            >
              <SheetTitle className="sr-only">Financial Blueprint</SheetTitle>
              <div className="flex-1 overflow-y-auto flex flex-col pt-8">
                <EventBlueprint
                  targetMargin={targetMargin}
                  baseCost={financials.baseCost}
                  suggestedPrice={financials.suggestedPrice}
                  venueCost={financials.venueCost}
                  talentCost={financials.talentCost}
                  blueprintHealth={blueprintHealth}
                  onMarginChange={setTargetMargin}
                  onPreview={handlePreview}
                  inDrawer
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </RequireAuth>
  );
}
