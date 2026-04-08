import React from 'react';
import { useExperienceBuilder } from '@/hooks/venues/useVenueDetail';
import { SERVICE_CATEGORIES, AVAILABLE_FOXERS } from '@/data/venueDetailData';

interface ExperienceBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  venuePrice: number;
}

export function CustomExperienceBuilder({ isOpen, onClose, venuePrice }: ExperienceBuilderProps) {
  const {
    activeCategory,
    selectedFoxer,
    selectedServices,
    searchQuery,
    isSubmitting,
    isSuccess,
    isDragOver,
    filteredServices,
    currentCategoryLabel,
    total,
    selectedFoxerData,
    selectedServicesData,
    setActiveCategory,
    setSelectedFoxer,
    toggleService,
    setSearchQuery,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
    handleClose,
  } = useExperienceBuilder(venuePrice, onClose);

  if (!isOpen) return null;

  // Success Screen
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-md text-center">
          <div className="h-32 w-32 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-8 mx-auto shadow-[0_0_60px_rgba(204,255,0,0.2)]">
            <span className="material-symbols-outlined text-6xl animate-bounce">rocket_launch</span>
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-4">Request Launched!</h2>
          <p className="text-text-muted text-lg mb-10 leading-relaxed">
            Your custom experience blueprint has been sent to the creators. They will review the
            logistics and confirm within 24 hours.
          </p>
          <button
            onClick={handleClose}
            className="btn-neon px-10 py-4 rounded-full bg-accent text-black font-bold text-lg hover:scale-105 transition-transform w-full"
          >
            Return to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#02040a] text-white flex flex-col animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f111a]/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-accent rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]">
            <span className="material-symbols-outlined">design_services</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl leading-none">Experience Builder</h2>
            <p className="text-xs text-text-muted mt-1">Neon Nights: Custom Config</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Categories */}
        <aside className="w-20 md:w-64 shrink-0 border-r border-white/5 bg-[#0f111a]/30 flex flex-col">
          <div className="p-4 space-y-2 overflow-y-auto flex-1">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                  activeCategory === cat.id
                    ? 'bg-accent text-black font-bold shadow-[0_0_20px_rgba(204,255,0,0.2)]'
                    : 'hover:bg-white/5 text-text-muted hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">{cat.icon}</span>
                <span className="hidden md:block">{cat.label}</span>
                {activeCategory === cat.id && (
                  <span className="ml-auto hidden md:block material-symbols-outlined text-[16px]">
                    chevron_right
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-white/5 hidden md:block">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-text-muted mb-2">Need something else?</p>
              <button className="text-xs font-bold text-white underline decoration-accent underline-offset-4">
                Request Custom Item
              </button>
            </div>
          </div>
        </aside>

        {/* Center: Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative bg-gradient-to-b from-[#02040a] to-[#0f111a]">
          {activeCategory !== 'foxer' && (
            <div className="mb-8 sticky top-0 z-10 pt-2 pb-4 bg-[#02040a]/95 backdrop-blur-sm -mt-2 -mx-2 px-2">
              <div className="relative max-w-2xl">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted material-symbols-outlined">
                  search
                </span>
                <input
                  type="text"
                  placeholder={`Search ${currentCategoryLabel}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
                />
              </div>
            </div>
          )}

          {activeCategory === 'foxer' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-3xl font-display font-bold text-white">Select Your Curator</h3>
                <p className="text-text-muted text-sm hidden md:block">
                  Drag to the right or click to select.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {AVAILABLE_FOXERS.map((foxer) => (
                  <div
                    key={foxer.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, foxer.id, 'foxer')}
                    onClick={() => setSelectedFoxer(foxer.id)}
                    className={`relative group rounded-[2rem] p-6 border cursor-grab active:cursor-grabbing transition-all duration-300 hover:-translate-y-1 ${
                      selectedFoxer === foxer.id
                        ? 'bg-surface-highlight border-accent shadow-[0_0_30px_rgba(204,255,0,0.15)]'
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <img
                        src={foxer.avatar}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                        alt={foxer.name}
                      />
                      <div className="flex flex-col items-end">
                        <span className="text-accent font-bold font-display text-lg">
                          ₱{foxer.fee.toLocaleString()}
                        </span>
                        <div className="flex items-center text-yellow-400 text-xs font-bold gap-1 bg-black/30 px-2 py-1 rounded-full mt-1">
                          <span className="material-symbols-outlined text-[14px] fill-current">
                            star
                          </span>{' '}
                          {foxer.rating}
                        </div>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1">{foxer.name}</h4>
                    <p className="text-xs text-accent uppercase tracking-wider font-bold mb-3">
                      {foxer.role}
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {foxer.description}
                    </p>
                    <div
                      className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        selectedFoxer === foxer.id
                          ? 'bg-accent text-black'
                          : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'
                      }`}
                    >
                      {selectedFoxer === foxer.id ? 'Selected' : 'Select Foxer'}
                      {selectedFoxer === foxer.id && (
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-3xl font-display font-bold text-white">
                  Add {currentCategoryLabel}
                </h3>
                <p className="text-text-muted text-sm hidden md:block">
                  Drag to the sidebar to add to your build.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map((svc) => (
                  <div
                    key={svc.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, svc.id, 'service')}
                    onClick={() => toggleService(svc.id)}
                    className={`relative flex flex-col justify-between rounded-[2rem] p-6 border cursor-grab active:cursor-grabbing transition-all duration-300 hover:bg-white/5 ${
                      selectedServices.includes(svc.id)
                        ? 'border-white bg-white/10'
                        : 'border-white/10 bg-transparent'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                            selectedServices.includes(svc.id)
                              ? 'bg-white text-black'
                              : 'bg-surface-highlight text-text-muted'
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl">{svc.icon}</span>
                        </div>
                        <div
                          className={`h-6 w-6 rounded-full border border-white/20 flex items-center justify-center transition-all ${
                            selectedServices.includes(svc.id) ? 'bg-accent border-accent' : ''
                          }`}
                        >
                          {selectedServices.includes(svc.id) && (
                            <span className="material-symbols-outlined text-black text-[14px] font-bold">
                              check
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">{svc.name}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4">{svc.desc}</p>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-white font-display font-bold">
                        +₱{svc.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-text-muted uppercase tracking-wider font-bold">
                        Add to build
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar: Summary / Drop Zone */}
        <aside
          className={`w-80 shrink-0 bg-[#0f111a] border-l border-white/5 flex flex-col shadow-2xl relative z-10 transition-all duration-300 ${
            isDragOver
              ? 'bg-white/5 border-accent shadow-[inset_0_0_40px_rgba(204,255,0,0.1)]'
              : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
              <div className="text-center p-6 border-2 border-dashed border-accent rounded-3xl animate-pulse">
                <span className="material-symbols-outlined text-5xl text-accent mb-2">
                  add_circle
                </span>
                <p className="text-white font-bold text-lg">Drop to Add</p>
              </div>
            </div>
          )}

          <div className="p-6 border-b border-white/5">
            <h3 className="font-display font-bold text-white text-lg">Your Build</h3>
            <p className="text-xs text-text-muted">Estimated Cost</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Venue Base */}
            <div className="flex justify-between items-start group">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-[16px]">apartment</span>
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
            {selectedFoxerData ? (
              <div className="flex justify-between items-start animate-in fade-in slide-in-from-right-4 group relative">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded bg-accent/20 flex items-center justify-center text-accent">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{selectedFoxerData.name}</p>
                    <p className="text-xs text-text-muted">Curator Fee</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-white">
                  ₱{selectedFoxerData.fee.toLocaleString()}
                </span>
                <button
                  onClick={() => setSelectedFoxer(null)}
                  className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/20 p-4 text-center">
                <p className="text-xs text-text-muted mb-2">No curator selected</p>
                <button
                  onClick={() => setActiveCategory('foxer')}
                  className="text-xs font-bold text-accent hover:underline"
                >
                  Select One
                </button>
              </div>
            )}

            {/* Selected Services */}
            {selectedServicesData.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Add-ons
                </p>
                {selectedServicesData.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-start animate-in fade-in slide-in-from-right-4 group relative"
                  >
                    <p className="text-sm text-gray-300 w-2/3">{s.name}</p>
                    <span className="text-sm font-bold text-white">
                      ₱{s.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => toggleService(s.id)}
                      className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[16px]">cancel</span>
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
                ₱{total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full btn-neon py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  Request Booking{' '}
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-text-muted mt-3">
              You won't be charged yet.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
