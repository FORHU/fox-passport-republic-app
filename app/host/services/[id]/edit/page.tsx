"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import RequireAuth from "@/components/authentication/RequireAuth";
import {
  ListingHeader,
  ListingSidebar,
  ListingPreviewCard,
  ListingStatusPanel,
} from "@/components/foxer/listing-builder";
import { useHostServiceEdit } from "@/hooks/dashboards/useHostServiceEdit";

function HostServiceEditPageContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? String(params.id) : "";

  const {
    isPrefilling,
    prefillError,
    successMessage,

    activeType,
    title,
    description,
    category,
    customCategory,
    price,
    unit,
    status,
    image,
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
    setCategory,
    setCustomCategory,
    setPrice,
    setUnit,
    setStatus,
    setShowGuide,
    handleBack,
    handleSaveDraft,
    handlePublish,
    handleCategorySelect,
    handleImageUpload,
  } = useHostServiceEdit(id);

  if (!id) {
    return (
      <div className="fixed inset-0 z-[80] bg-[#02040a] text-white flex items-center justify-center">
        <div className="glass-panel rounded-[2rem] p-12 border border-red-500/20">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <div className="text-sm font-bold">Invalid service id</div>
          </div>
        </div>
      </div>
    );
  }

  if (prefillError) {
    return (
      <div className="fixed inset-0 z-[80] bg-[#02040a]/90 text-white flex items-center justify-center">
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
  }

  if (isPrefilling) {
    return (
      <div className="fixed inset-0 z-[80] bg-[#02040a]/90 text-white flex items-center justify-center">
        <div className="glass-panel rounded-[2rem] p-12 border border-white/5">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-[#ccff00] animate-spin" />
            <div className="text-sm text-white/50">Loading service...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="fixed inset-0 z-60 bg-[#02040a] text-white flex flex-col font-body">
        <ListingHeader
          activeType={activeType}
          title={title}
          isSubmitting={isSubmitting}
          error={error}
          isNotification={isNotification}
          successMessage={successMessage}
          onBack={handleBack}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />

        <div className="flex-1 flex overflow-hidden">
          <ListingSidebar
            activeType={activeType}
            categories={categories}
            currentStatuses={currentStatuses}
            category={category}
            customCategory={customCategory}
            condition={""}
            price={price}
            unit={unit}
            status={status}
            onCategorySelect={handleCategorySelect}
            onCustomCategoryChange={setCustomCategory}
            onConditionChange={() => {}}
            onPriceChange={setPrice}
            onUnitChange={setUnit}
            onStatusChange={setStatus}
          />

          <ListingPreviewCard
            activeType={activeType}
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
            activeType={activeType}
            categories={categories}
            category={category}
            customCategory={customCategory}
            condition={""}
            price={price}
            unit={unit}
            completionPercentage={completionPercentage}
            isReadyToPublish={isReadyToPublish}
          />
        </div>
      </div>
    </RequireAuth>
  );
}

export default function HostServiceEditPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#02040a]" />}>
      <HostServiceEditPageContent />
    </Suspense>
  );
}

