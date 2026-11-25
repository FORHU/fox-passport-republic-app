"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RequireAuth from "@/shared/auth/RequireAuth";
import { useServicesBuilder } from "@/features/service/hooks/useServicesBuilder";
import {
  ListingHeader,
  ListingSidebar,
  ListingPreviewCard,
  ListingStatusPanel,
} from "@/features/asset/components/listing-builder";
import { PERFORMER_LABELS } from "@/features/asset/components/listing-builder/listingLabels";

function ServiceBuilderContent() {
  // Every "add a gig" button opens `?type=performer`: the gig categories,
  // titled for a gig. Without it, the operational Service Studio.
  const isPerformer = useSearchParams().get("type") === "performer";
  const labels = isPerformer ? PERFORMER_LABELS : undefined;
  const {
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
    categories,
    currentStatuses,
    completionPercentage,
    isReadyToPublish,
    displayCategory,
    error,
    isNotification,
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
    myDraftsHref,
    handlePublish,
    handleImageUpload,
    handleCategorySelect,
  } = useServicesBuilder({ mode: isPerformer ? "performer" : "service" });

  return (
    <div className="fixed inset-0 z-60 bg-canvas text-white flex flex-col font-body">
      <ListingHeader
        activeType="service"
        labels={labels}
        title={title}
        isSubmitting={isSubmitting}
        error={error}
        isNotification={isNotification}
        onBack={handleBack}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        myDraftsHref={myDraftsHref}
      />
      <div className="flex-1 flex flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <ListingSidebar
          activeType="service"
          labels={labels}
          categories={categories}
          currentStatuses={currentStatuses}
          category={category}
          customCategory={customCategory}
          condition=""
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
          activeType="service"
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
        />
        <ListingStatusPanel
          activeType="service"
          labels={labels}
          categories={categories}
          category={category}
          customCategory={customCategory}
          condition=""
          price={price}
          unit={unit}
          completionPercentage={completionPercentage}
          isReadyToPublish={isReadyToPublish}
        />
      </div>
    </div>
  );
}

export default function CreateServicePage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-canvas flex items-center justify-center">
            <span className="text-white">Loading...</span>
          </div>
        }
      >
        <ServiceBuilderContent />
      </Suspense>
    </RequireAuth>
  );
}
