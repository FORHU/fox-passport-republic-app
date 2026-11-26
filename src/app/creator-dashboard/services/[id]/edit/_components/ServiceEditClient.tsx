"use client";

import React, { Suspense, useCallback, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import RequireAuth from "@/shared/auth/RequireAuth";
import {
  ListingHeader,
  ListingSidebar,
  ListingPreviewCard,
  ListingStatusPanel,
} from "@/features/asset/components/listing-builder";
import {
  LISTING_LABELS,
  PERFORMER_LABELS,
} from "@/features/asset/components/listing-builder/listingLabels";
import { useHostServiceEdit } from "@/features/service/hooks/useHostServiceEdit";
import { ServiceAvailabilitySection } from "@/features/service/components/ServiceAvailabilitySection";
import { ServicePreviewModal } from "@/features/service/components/ServicePreviewModal";

interface Props {
  id: string;
}

function ServiceEditContent({ id }: Props) {
  const {
    isPrefilling,
    prefillError,
    successMessage,
    activeType,
    mode,
    title,
    description,
    category,
    customCategory,
    price,
    unit,
    status,
    image,
    cancellationPolicyId,
    showGuide,
    isSubmitting,
    error,
    isNotification,
    categories,
    currentStatuses,
    completionPercentage,
    isReadyToPublish,
    displayCategory,
    setTitle,
    setDescription,
    setCustomCategory,
    setPrice,
    setUnit,
    setStatus,
    setCancellationPolicyId,
    setShowGuide,
    handleBack,
    handleSaveDraft,
    isDraft,
    handlePublish,
    handleCategorySelect,
    handleImageUpload,
  } = useHostServiceEdit(id);
  // A gig is edited in the Gig Studio's words.
  const labels = mode === "performer" ? PERFORMER_LABELS : undefined;
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const closePreview = useCallback(() => setPreviewOpen(false), []);

  if (!id)
    return (
      <div className="fixed inset-0 z-[80] bg-canvas text-white flex items-center justify-center">
        <div className="glass-panel rounded-[2rem] p-12 border border-red-500/20">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <div className="text-sm font-bold">Invalid service id</div>
          </div>
        </div>
      </div>
    );

  if (prefillError)
    return (
      <div className="fixed inset-0 z-[80] bg-canvas/90 text-white flex items-center justify-center">
        <div className="glass-panel rounded-[2rem] p-12 border border-red-500/20 text-center max-w-lg w-full">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <div className="text-sm font-bold">Unable to load this service</div>
            <div className="text-xs text-white/50">{prefillError}</div>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 rounded-full border border-white/10 text-xs font-bold hover:bg-white hover:text-black"
            >
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );

  if (isPrefilling)
    return (
      <div className="fixed inset-0 z-[80] bg-canvas/90 text-white flex items-center justify-center">
        <div className="glass-panel rounded-[2rem] p-12 border border-white/5">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-accent animate-spin" />
            <div className="text-sm text-white/50">Loading service...</div>
          </div>
        </div>
      </div>
    );

  return (
    <RequireAuth>
      <div className="fixed inset-0 z-60 bg-canvas text-white flex flex-col font-body">
        <ListingHeader
          activeType={activeType}
          labels={labels}
          title={title}
          isSubmitting={isSubmitting}
          error={error}
          isNotification={isNotification}
          successMessage={successMessage}
          onBack={handleBack}
          onSaveDraft={isDraft ? handleSaveDraft : undefined}
          onPublish={handlePublish}
        />
        <div className="flex-1 flex overflow-hidden">
          <ListingSidebar
            activeType={activeType}
            labels={labels}
            categories={categories}
            currentStatuses={currentStatuses}
            category={category}
            customCategory={customCategory}
            condition={""}
            price={price}
            unit={unit}
            status={status}
            cancellationPolicyId={cancellationPolicyId}
            onCategorySelect={handleCategorySelect}
            onCustomCategoryChange={setCustomCategory}
            onConditionChange={() => {}}
            onPriceChange={setPrice}
            onUnitChange={setUnit}
            onStatusChange={setStatus}
            onCancellationPolicyChange={setCancellationPolicyId}
          />
          <ListingPreviewCard
            activeType={activeType}
            labels={labels}
            title={title}
            description={description}
            price={price}
            unit={unit}
            status={status}
            image={image}
            displayCategory={displayCategory}
            showGuide={showGuide}
            onCloseGuide={() => setShowGuide(false)}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onImageUpload={handleImageUpload}
          >
            <ServiceAvailabilitySection serviceId={id} />
          </ListingPreviewCard>
          <ListingStatusPanel
            activeType={activeType}
            labels={labels}
            categories={categories}
            category={category}
            customCategory={customCategory}
            condition={""}
            price={price}
            unit={unit}
            completionPercentage={completionPercentage}
            isReadyToPublish={isReadyToPublish}
            onPreview={() => setPreviewOpen(true)}
          />
        </div>
        {/* No location: this page doesn't load or save it. */}
        <ServicePreviewModal
          open={isPreviewOpen}
          onClose={closePreview}
          lowerNoun={(labels ?? LISTING_LABELS.service).lowerNoun}
          title={title}
          description={description}
          displayCategory={displayCategory}
          image={image}
          price={price}
          unit={unit}
          status={status}
          cancellationPolicyId={cancellationPolicyId}
        />
      </div>
    </RequireAuth>
  );
}

export default function ServiceEditClient({ id }: Props) {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-canvas" />}>
      <ServiceEditContent id={id} />
    </Suspense>
  );
}
