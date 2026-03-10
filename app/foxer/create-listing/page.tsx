'use client';

import React, { Suspense } from 'react';
import RequireAuth from '@/components/authentication/RequireAuth';
import { useListingBuilder } from '@/hooks/listings/useListingBuilder';
import {
  ListingHeader,
  ListingSidebar,
  ListingPreviewCard,
  ListingStatusPanel,
} from '@/components/foxer/listing-builder';

function ListingBuilderContent() {
  const {
    // State
    activeType,
    title,
    description,
    category,
    customCategory,
    price,
    unit,
    condition,
    status,
    image,
    showGuide,
    isSubmitting,
    categories,
    currentStatuses,
    completionPercentage,
    isReadyToPublish,
    displayCategory,
    
    // Actions
    setTitle,
    setDescription,
    setCustomCategory,
    setPrice,
    setUnit,
    setCondition,
    setStatus,
    setShowGuide,
    
    // Handlers
    handleBack,
    handleSaveDraft,
    handlePublish,
    handleImageUpload,
    handleCategorySelect,
  } = useListingBuilder();

  return (
    <div className="fixed inset-0 z-60 bg-[#02040a] text-white flex flex-col font-body">
      <ListingHeader
        activeType={activeType}
        title={title}
        isSubmitting={isSubmitting}
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
          condition={condition}
          price={price}
          unit={unit}
          status={status}
          onCategorySelect={handleCategorySelect}
          onCustomCategoryChange={setCustomCategory}
          onConditionChange={setCondition}
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
          condition={condition}
          price={price}
          unit={unit}
          completionPercentage={completionPercentage}
          isReadyToPublish={isReadyToPublish}
        />
      </div>
    </div>
  );
}

export default function ListingBuilder() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="fixed inset-0 bg-[#02040a] flex items-center justify-center"><span className="text-white">Loading...</span></div>}>
        <ListingBuilderContent />
      </Suspense>
    </RequireAuth>
  );
}
