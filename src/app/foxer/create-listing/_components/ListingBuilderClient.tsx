"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RequireAuth from "@/shared/auth/RequireAuth";
import { useInventoryBuilder } from "@/features/asset/hooks/useInventoryBuilder";
import { useServicesBuilder } from "@/features/service/hooks/useServicesBuilder";

import {
  ListingHeader,
  ListingSidebar,
  ListingPreviewCard,
  ListingStatusPanel,
} from "@/features/asset/components/listing-builder";

type Builder =
  | ReturnType<typeof useInventoryBuilder>
  | ReturnType<typeof useServicesBuilder>;

// One builder per page, chosen by `?type=`. Both share one store, so mounting
// both (as this page used to) let the services builder flip an Assets Studio
// into service mode, and My Drafts then opened Services.
function InventoryStudio() {
  return <ListingBuilderView builder={useInventoryBuilder()} />;
}

function ServiceStudio() {
  return <ListingBuilderView builder={useServicesBuilder()} />;
}

function ListingBuilderContent() {
  const searchParams = useSearchParams();
  return searchParams.get("type") === "service" ? (
    <ServiceStudio />
  ) : (
    <InventoryStudio />
  );
}

function ListingBuilderView({ builder }: { builder: Builder }) {
  const {
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
    city,
    state,
    country,
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
    setCondition,
    setStatus,
    setCity,
    setState,
    setCountry,
    setLat,
    setLng,
    setCancellationPolicyId,
    setShowGuide,
    handleBack,
    handleSaveDraft,
    myDraftsHref,
    handlePublish,
    handleImageUpload,
    handleCategorySelect,
  } = builder;

  return (
    <div className="fixed inset-0 z-60 bg-canvas text-white flex flex-col font-body">
      <ListingHeader
        activeType={activeType}
        title={title}
        isSubmitting={isSubmitting}
        error={error}
        isNotification={isNotification}
        onBack={handleBack}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        myDraftsHref={myDraftsHref}
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
          city={city}
          state={state}
          country={country}
          cancellationPolicyId={cancellationPolicyId}
          onCategorySelect={handleCategorySelect}
          onCustomCategoryChange={setCustomCategory}
          onConditionChange={setCondition}
          onPriceChange={setPrice}
          onUnitChange={setUnit}
          onStatusChange={setStatus}
          onCityChange={setCity}
          onStateChange={setState}
          onCountryChange={setCountry}
          onLatLngChange={(lat, lng) => {
            setLat(lat);
            setLng(lng);
          }}
          onCancellationPolicyChange={setCancellationPolicyId}
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

export default function ListingBuilderClient() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-canvas flex items-center justify-center">
            <span className="text-white">Loading...</span>
          </div>
        }
      >
        <ListingBuilderContent />
      </Suspense>
    </RequireAuth>
  );
}
