'use client';

import React from 'react';
import RequireAuth from '@/features/auth/components/RequireAuth';
import { useServicesBuilder } from '@/features/service/hooks/useServicesBuilder';
import {
  ListingHeader,
  ListingSidebar,
  ListingPreviewCard,
  ListingStatusPanel,
} from '@/features/asset/components/listing-builder';

function ServiceBuilderContent() {
  const {
    activeType,
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
    handlePublish,
    handleImageUpload,
    handleCategorySelect,
  } = useServicesBuilder();

  return (
    <div className="fixed inset-0 z-60 bg-[#02040a] text-white flex flex-col font-body">
      <ListingHeader
        activeType="service"
        title={title}
        isSubmitting={isSubmitting}
        error={error}
        isNotification={isNotification}
        onBack={handleBack}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
      <div className="flex-1 flex overflow-hidden">
        <ListingSidebar
          activeType="service"
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
      <ServiceBuilderContent />
    </RequireAuth>
  );
}
