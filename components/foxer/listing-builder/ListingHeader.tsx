'use client';

import React from 'react';
import { ListingType } from '@/data/listingBuilderData';

interface ListingHeaderProps {
  activeType: ListingType;
  title: string;
  isSubmitting: boolean;
  error?: string | null;
  isNotification?: boolean;
  successMessage?: string;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function ListingHeader({
  activeType,
  title,
  isSubmitting,
  error,
  isNotification,
  successMessage,
  onBack,
  onSaveDraft,
  onPublish,
}: ListingHeaderProps) {
  const defaultSuccessMessage =
    activeType === "inventory"
      ? "Asset created successfully! Redirecting..."
      : "Service created successfully! Redirecting...";
  return (
    <>
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f111a] z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <h2 className="font-display font-bold text-lg flex items-center gap-2 capitalize">
              {activeType} Studio
              <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary-glow text-[9px] font-bold uppercase">
                Creator
              </span>
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeType === 'inventory' ? 'bg-primary' : 'bg-warning'
                } animate-pulse`}
              />
              {title || `New ${activeType === 'inventory' ? 'Item' : 'Service'}`} (Draft)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSaveDraft}
            className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold hover:bg-white/5"
          >
            Save Draft
          </button>
          <button
            onClick={onPublish}
            disabled={isSubmitting}
            className="btn-neon px-5 py-2 rounded-full bg-accent text-black text-xs font-bold flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-[16px]">
                progress_activity
              </span>
            ) : (
              'Publish Listing'
            )}
          </button>
        </div>
      </header>

      {/* Error Notification */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 px-4 py-2 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </div>
      )}

      {/* Success Notification */}
      {isNotification && (
        <div className="bg-green-500/10 border-b border-green-500/20 text-green-400 px-4 py-2 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          {successMessage ?? defaultSuccessMessage}
        </div>
      )}
    </>
  );
}
