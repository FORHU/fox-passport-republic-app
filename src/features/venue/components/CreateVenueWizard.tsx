"use client";

import React from "react";
import { useCreateVenueModal } from "@/features/venue/hooks/useCreateVenueModal";
import { X } from "lucide-react";

export default function CreateVenueWizard() {
  const { closeModal } = useCreateVenueModal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-[#1a1a24] rounded-2xl shadow-2xl border border-white/10 w-full max-w-2xl mx-4 p-8">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Create New Venue</h2>
          <p className="text-white/60">Use the full venue builder for more options</p>
        </div>

        {/* Redirect to full builder */}
        <div className="flex flex-col items-center gap-4">
          <a
            href="/mayor/create-venue"
            className="w-full py-4 bg-[#ccff00] text-black font-bold rounded-xl hover:brightness-110 transition-all text-center"
          >
            Open Venue Builder
          </a>
          <button
            onClick={closeModal}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
