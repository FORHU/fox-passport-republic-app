'use client';


import { useRouter } from 'next/navigation';
import RequireAuth from '@/features/auth/components/RequireAuth';
import { useEventBuilder } from '@/features/event/hooks/useEventBuilder';
import { useEventBuilderStore } from '@/features/event/store/useEventBuilderStore';
import {
  ResourcePalette,
  EventHeader,
  EventDetailsForm,
  EventGallery,
  CorePackageDropZone,
  EventBlueprint,
} from '@/features/event/components/event-builder';

export default function EventCreationBuilder() {
  const router = useRouter();
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
                cancellationPolicyId={cancellationPolicyId}
                onTitleChange={setEventTitle}
                onDescriptionChange={setDescription}
                onCategoryChange={setCategory}
                onDateChange={setDate}
                onLocationChange={setLocation}
                onTargetCityChange={setTargetCity}
                onTargetStateChange={setTargetState}
                onTargetCountryChange={setTargetCountry}
                onLatLngChange={(lat, lng) => { setLat(lat); setLng(lng); }}
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
        </div>
      </div>
    </RequireAuth>
  );
}
