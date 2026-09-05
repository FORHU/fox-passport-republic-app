/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { useExperienceBuilderData } from "@/features/venue/hooks/useExperienceBuilderData";

const SERVICE_CATEGORIES = [
  { id: "foxer", label: "Curator", icon: "person_search" },
  { id: "catering", label: "Food & Drink", icon: "restaurant" },
  { id: "tech", label: "Tech & AV", icon: "speaker" },
  { id: "decor", label: "Decor & Style", icon: "palette" },
  { id: "media", label: "Photo & Video", icon: "videocam" },
];

export interface CustomExperienceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  venuePrice: number;
}

export function CustomExperienceBuilderModal({
  isOpen,
  onClose,
  venuePrice,
}: CustomExperienceBuilderModalProps) {
  const [activeCategory, setActiveCategory] = useState("foxer");
  const [selectedFoxer, setSelectedFoxer] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const { foxers, itemsByCategory } = useExperienceBuilderData(isOpen);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleServiceToggle = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const calculateTotal = () => {
    let total = venuePrice * 2;
    if (selectedFoxer) {
      const foxer = foxers.find((f) => f.id === selectedFoxer);
      if (foxer) total += foxer.fee;
    }
    Object.values(itemsByCategory)
      .flat()
      .forEach((svc) => {
        if (selectedServices.includes(svc.id)) total += svc.price;
      });
    return total;
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  const getFilteredServices = () => {
    const services = itemsByCategory[activeCategory] || [];
    if (!searchQuery) return services;
    return services.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  // Drag and Drop Handlers
  const handleDragStart = (
    e: React.DragEvent,
    id: string,
    type: "foxer" | "service",
  ) => {
    e.dataTransfer.setData("id", id.toString());
    e.dataTransfer.setData("type", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const id = e.dataTransfer.getData("id");
    const type = e.dataTransfer.getData("type");

    if (type === "foxer") {
      setSelectedFoxer(id);
    } else if (type === "service") {
      if (!selectedServices.includes(id)) {
        handleServiceToggle(id);
      }
    }
  };

  // Success Screen
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-60 bg-background flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-md text-center">
          <div className="h-32 w-32 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-8 mx-auto shadow-[0_0_60px_rgba(204,255,0,0.2)]">
            <span className="material-symbols-outlined text-6xl animate-bounce">
              rocket_launch
            </span>
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            Request Launched!
          </h2>
          <p className="text-text-muted text-lg mb-10 leading-relaxed">
            Your custom experience blueprint has been sent to the creators. They
            will review the logistics and confirm within 24 hours.
          </p>
          <button
            onClick={onClose}
            className="btn-neon px-10 py-4 rounded-full bg-accent text-black font-bold text-lg hover:scale-105 transition-transform w-full"
          >
            Return to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-60 bg-[#02040a] text-white flex flex-col animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-[#080b14]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <span className="material-symbols-outlined text-[20px]">
              design_services
            </span>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">
              Design Custom Experience
            </h2>
            <p className="text-xs text-text-muted">
              Add services, gear, and curators to your event
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-white/60 hover:text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Category selector navigation */}
        <aside className="w-64 border-r border-white/5 bg-[#080b14] flex flex-col p-4 gap-2">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-3 mb-1">
            Service Palette
          </p>
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-accent text-black font-bold"
                  : "text-text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {cat.icon}
              </span>
              <span>{cat.label}</span>
            </button>
          ))}
        </aside>

        {/* Center: Interactive catalog */}
        <main
          className="flex-1 overflow-y-auto p-6 bg-[#04060c]"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-white capitalize">
                Select {activeCategory}
              </h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-accent w-64"
              />
            </div>

            {/* Foxer List */}
            {activeCategory === "foxer" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {foxers.map((foxer) => (
                  <div
                    key={foxer.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, foxer.id, "foxer")}
                    onClick={() =>
                      setSelectedFoxer(
                        selectedFoxer === foxer.id ? null : foxer.id,
                      )
                    }
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                      selectedFoxer === foxer.id
                        ? "bg-accent/10 border-accent text-white"
                        : "bg-white/5 border-white/5 hover:border-white/20 text-white/80"
                    }`}
                  >
                    <img
                      src={foxer.avatar || (foxer as any).image}
                      alt={foxer.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-sm">
                          {foxer.name}
                        </h4>
                        <span className="text-xs font-bold text-accent">
                          ₱{foxer.fee.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        {foxer.role}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-text-muted">
                        <span className="material-symbols-outlined text-[12px] text-yellow-400">
                          star
                        </span>
                        <span>{foxer.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Other Services */}
            {activeCategory !== "foxer" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getFilteredServices().map((svc) => (
                  <div
                    key={svc.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, svc.id, "service")}
                    onClick={() => handleServiceToggle(svc.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                      selectedServices.includes(svc.id)
                        ? "bg-accent/10 border-accent text-white"
                        : "bg-white/5 border-white/5 hover:border-white/20 text-white/80"
                    }`}
                  >
                    <div className="h-16 w-16 rounded-xl bg-white/5 flex items-center justify-center text-accent shrink-0">
                      <span className="material-symbols-outlined text-3xl">
                        {svc.icon || "inventory_2"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-sm">
                          {svc.name}
                        </h4>
                        <span className="text-xs font-bold text-accent">
                          ₱{svc.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                        {svc.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar: Your Build */}
        <aside className="hidden md:flex w-80 border-l border-white/5 bg-[#080b14] flex-col">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-display font-bold text-white text-lg">
              Your Build
            </h3>
            <p className="text-xs text-text-muted">Estimated Cost</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Venue Base */}
            <div className="flex justify-between items-start group">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-[16px]">
                    apartment
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Venue Base</p>
                  <p className="text-xs text-text-muted">2 Nights</p>
                </div>
              </div>
              <span className="text-sm font-bold text-white">
                ₱{(venuePrice * 2).toLocaleString()}
              </span>
            </div>

            {/* Selected Foxer */}
            {selectedFoxer ? (
              <div className="flex justify-between items-start animate-in fade-in slide-in-from-right-4 group relative">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded bg-accent/20 flex items-center justify-center text-accent">
                    <span className="material-symbols-outlined text-[16px]">
                      person
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {foxers.find((f) => f.id === selectedFoxer)?.name}
                    </p>
                    <p className="text-xs text-text-muted">Curator Fee</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-white">
                  ₱
                  {foxers
                    .find((f) => f.id === selectedFoxer)
                    ?.fee.toLocaleString()}
                </span>
                <button
                  onClick={() => setSelectedFoxer(null)}
                  className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    cancel
                  </span>
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/20 p-4 text-center">
                <p className="text-xs text-text-muted mb-2">
                  No curator selected
                </p>
              </div>
            )}

            {/* Selected Services */}
            {selectedServices.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Selected Add-ons
                </p>
                {Object.values(itemsByCategory)
                  .flat()
                  .filter((s) => selectedServices.includes(s.id))
                  .map((svc) => (
                    <div
                      key={svc.id}
                      className="flex justify-between items-center text-xs relative group"
                    >
                      <span className="text-gray-300 truncate max-w-[140px]">
                        {svc.name}
                      </span>
                      <span className="text-white font-bold">
                        ₱{svc.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleServiceToggle(svc.id)}
                        className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          cancel
                        </span>
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Footer Total */}
          <div className="p-6 bg-surface-highlight border-t border-white/5">
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm text-text-muted">Total Estimate</span>
              <span className="text-3xl font-display font-bold text-accent">
                ₱{calculateTotal().toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full btn-neon py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
              ) : (
                <>
                  Request Booking{" "}
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-text-muted mt-3">
              You won&apos;t be charged yet.
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile submit bar — replaces the hidden right sidebar on small screens */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0f111a] border-t border-white/10 shrink-0">
        <div>
          <p className="text-[10px] text-white/40">Total Estimate</p>
          <span className="text-lg font-display font-bold text-accent">
            ₱{calculateTotal().toLocaleString()}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <span className="material-symbols-outlined animate-spin text-[18px]">
              progress_activity
            </span>
          ) : (
            "Request Booking"
          )}
        </button>
      </div>
    </div>
  );
}
