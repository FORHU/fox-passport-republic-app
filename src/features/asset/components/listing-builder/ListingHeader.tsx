"use client";

import React from "react";
import Link from "next/link";
import { ListingType } from "@/features/asset/data/listingBuilderData";
import { LISTING_LABELS, type ListingLabels } from "./listingLabels";
import { BackButton } from "@/shared/components/ui/BackButton";

interface ListingHeaderProps {
  activeType: ListingType;
  /** Overrides the Studio wording, e.g. the Gig Studio. */
  labels?: ListingLabels;
  title: string;
  isSubmitting: boolean;
  error?: string | null;
  isNotification?: boolean;
  successMessage?: string;
  onBack: () => void;
  /** Left out on a live listing's edit page, which mustn't drop back to draft. */
  onSaveDraft?: () => void;
  onPublish: () => void;
  /** The owner's list, filtered to drafts. The Studio's only draft link. */
  myDraftsHref?: string;
}

export function ListingHeader({
  activeType,
  labels: labelsProp,
  title,
  isSubmitting,
  error,
  isNotification,
  successMessage,
  onBack,
  onSaveDraft,
  onPublish,
  myDraftsHref,
}: ListingHeaderProps) {
  const labels = labelsProp ?? LISTING_LABELS[activeType];
  const defaultSuccessMessage = `${labels.noun} created successfully! Redirecting...`;
  return (
    <>
      <header className="h-16 border-b border-white/5 flex items-center justify-between gap-2 px-4 sm:px-6 bg-surface z-20">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <BackButton onClick={onBack} />
          <div className="min-w-0">
            <h2 className="font-display font-bold text-base sm:text-lg flex items-center gap-2">
              <span className="truncate">{labels.studio}</span>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-primary/20 text-primary-glow text-[9px] font-bold uppercase shrink-0">
                Creator
              </span>
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  activeType === "inventory" ? "bg-primary" : "bg-warning"
                } animate-pulse`}
              />
              <span className="truncate">
                {title || `New ${labels.noun}`} (Draft)
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {myDraftsHref && (
            <Link
              href={myDraftsHref}
              aria-label="My Drafts"
              className="px-2.5 sm:px-4 py-2 rounded-full border border-white/10 text-xs font-bold hover:bg-white/5 flex items-center gap-1.5 whitespace-nowrap"
            >
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[16px]"
              >
                inventory_2
              </span>
              <span className="hidden sm:inline">My Drafts</span>
            </Link>
          )}
          {onSaveDraft && (
            <button
              onClick={onSaveDraft}
              disabled={isSubmitting}
              className="px-3 sm:px-4 py-2 rounded-full border border-white/10 text-xs font-bold hover:bg-white/5 disabled:opacity-50 whitespace-nowrap"
            >
              Save<span className="hidden sm:inline"> Draft</span>
            </button>
          )}
          <button
            onClick={onPublish}
            disabled={isSubmitting}
            className="btn-neon px-4 sm:px-5 py-2 rounded-full bg-accent text-black text-xs font-bold flex items-center gap-2 whitespace-nowrap"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-[16px]">
                progress_activity
              </span>
            ) : (
              <span>
                Publish<span className="hidden sm:inline"> Listing</span>
              </span>
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
          <span className="material-symbols-outlined text-[16px]">
            check_circle
          </span>
          {successMessage ?? defaultSuccessMessage}
        </div>
      )}
    </>
  );
}
