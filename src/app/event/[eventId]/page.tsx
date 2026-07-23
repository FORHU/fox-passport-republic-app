'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEventBuilderStore } from '@/features/event/store/useEventBuilderStore';
import { LocationMap } from '@/shared/components/ui/LocationMap';
import { useExperienceBuilderData } from '@/features/venue/hooks/useExperienceBuilderData';

const SERVICE_CATEGORIES = [
  { id: 'foxer', label: 'Curator', icon: 'person_search' },
  { id: 'catering', label: 'Food & Drink', icon: 'restaurant' },
  { id: 'tech', label: 'Tech & AV', icon: 'speaker' },
  { id: 'decor', label: 'Decor & Style', icon: 'palette' },
  { id: 'media', label: 'Photo & Video', icon: 'videocam' },
];

const CustomExperienceBuilder: React.FC<{ isOpen: boolean; onClose: () => void; venuePrice: number }> = ({ isOpen, onClose, venuePrice }) => {
  const [activeCategory, setActiveCategory] = useState('foxer');
  const [selectedFoxer, setSelectedFoxer] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const { foxers, itemsByCategory } = useExperienceBuilderData();

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleServiceToggle = (id: string) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const calculateTotal = () => {
    let total = venuePrice * 2;
    if (selectedFoxer) {
      const foxer = foxers.find(f => f.id === selectedFoxer);
      if (foxer) total += foxer.fee;
    }
    Object.values(itemsByCategory).flat().forEach(svc => {
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
    return services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string, type: 'foxer' | 'service') => {
    e.dataTransfer.setData('id', id.toString());
    e.dataTransfer.setData('type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const id = e.dataTransfer.getData('id');
    const type = e.dataTransfer.getData('type');

    if (type === 'foxer') {
      setSelectedFoxer(id);
    } else if (type === 'service') {
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
            <span className="material-symbols-outlined text-6xl animate-bounce">rocket_launch</span>
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-4">Request Launched!</h2>
          <p className="text-text-muted text-lg mb-10 leading-relaxed">
            Your custom experience blueprint has been sent to the creators. They will review the logistics and confirm within 24 hours.
          </p>
          <button onClick={onClose} className="btn-neon px-10 py-4 rounded-full bg-accent text-black font-bold text-lg hover:scale-105 transition-transform w-full">
            Return to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-60 bg-[#02040a] text-white flex flex-col animate-in slide-in-from-bottom-4 duration-300">
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
        <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Categories */}
        <aside className="w-20 md:w-64 shrink-0 border-r border-white/5 bg-[#0f111a]/30 flex flex-col">
          <div className="p-4 space-y-2 overflow-y-auto flex-1">
            {SERVICE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                  activeCategory === cat.id 
                    ? 'bg-accent text-black font-bold shadow-[0_0_20px_rgba(204,255,0,0.2)]' 
                    : 'hover:bg-white/5 text-text-muted hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">{cat.icon}</span>
                <span className="hidden md:block">{cat.label}</span>
                {activeCategory === cat.id && (
                  <span className="ml-auto hidden md:block material-symbols-outlined text-[16px]">chevron_right</span>
                )}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-white/5 hidden md:block">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-text-muted mb-2">Need something else?</p>
              <button className="text-xs font-bold text-white underline decoration-accent underline-offset-4">Request Custom Item</button>
            </div>
          </div>
        </aside>

        {/* Center: Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative bg-linear-to-b from-[#02040a] to-[#0f111a]">
          {/* Search Bar */}
          {activeCategory !== 'foxer' && (
            <div className="mb-8 sticky top-0 z-10 pt-2 pb-4 bg-[#02040a]/95 backdrop-blur-sm -mt-2 -mx-2 px-2">
              <div className="relative max-w-2xl">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted material-symbols-outlined">search</span>
                <input 
                  type="text" 
                  placeholder={`Search ${SERVICE_CATEGORIES.find(c => c.id === activeCategory)?.label}...`}
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
                <p className="text-text-muted text-sm hidden md:block">Drag to the right or click to select.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {foxers.map(foxer => (
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
                      <img src={foxer.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" alt={foxer.name} />
                      <div className="flex flex-col items-end">
                        <span className="text-accent font-bold font-display text-lg">₱{foxer.fee.toLocaleString()}</span>
                        <div className="flex items-center text-yellow-400 text-xs font-bold gap-1 bg-black/30 px-2 py-1 rounded-full mt-1">
                          <span className="material-symbols-outlined text-[14px] fill-current">star</span> {foxer.rating}
                        </div>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1">{foxer.name}</h4>
                    <p className="text-xs text-accent uppercase tracking-wider font-bold mb-3">{foxer.role}</p>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">{foxer.description}</p>
                    
                    <div className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      selectedFoxer === foxer.id ? 'bg-accent text-black' : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'
                    }`}>
                      {selectedFoxer === foxer.id ? 'Selected' : 'Select Foxer'}
                      {selectedFoxer === foxer.id && <span className="material-symbols-outlined text-[18px]">check</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-3xl font-display font-bold text-white">Add {SERVICE_CATEGORIES.find(c => c.id === activeCategory)?.label}</h3>
                <p className="text-text-muted text-sm hidden md:block">Drag to the sidebar to add to your build.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {getFilteredServices().map(svc => (
                  <div 
                    key={svc.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, svc.id, 'service')}
                    onClick={() => handleServiceToggle(svc.id)}
                    className={`relative flex flex-col justify-between rounded-[2rem] p-6 border cursor-grab active:cursor-grabbing transition-all duration-300 hover:bg-white/5 ${
                      selectedServices.includes(svc.id) 
                        ? 'border-white bg-white/10' 
                        : 'border-white/10 bg-transparent'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                          selectedServices.includes(svc.id) ? 'bg-white text-black' : 'bg-surface-highlight text-text-muted'
                        }`}>
                          <span className="material-symbols-outlined text-2xl">{svc.icon}</span>
                        </div>
                        <div className={`h-6 w-6 rounded-full border border-white/20 flex items-center justify-center transition-all ${
                          selectedServices.includes(svc.id) ? 'bg-accent border-accent' : ''
                        }`}>
                          {selectedServices.includes(svc.id) && <span className="material-symbols-outlined text-black text-[14px] font-bold">check</span>}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">{svc.name}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4">{svc.desc}</p>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-white font-display font-bold">+₱{svc.price.toLocaleString()}</span>
                      <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Add to build</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar: Bill of Materials / Summary / Drop Zone */}
        <aside 
          className={`w-80 shrink-0 bg-[#0f111a] border-l border-white/5 flex flex-col shadow-2xl relative z-10 transition-all duration-300 ${
            isDragOver ? 'bg-white/5 border-accent shadow-[inset_0_0_40px_rgba(204,255,0,0.1)]' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
              <div className="text-center p-6 border-2 border-dashed border-accent rounded-3xl animate-pulse">
                <span className="material-symbols-outlined text-5xl text-accent mb-2">add_circle</span>
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
              <span className="text-sm font-bold text-white">₱{(venuePrice * 2).toLocaleString()}</span>
            </div>

            {/* Selected Foxer */}
            {selectedFoxer ? (
              <div className="flex justify-between items-start animate-in fade-in slide-in-from-right-4 group relative">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded bg-accent/20 flex items-center justify-center text-accent">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{foxers.find(f => f.id === selectedFoxer)?.name}</p>
                    <p className="text-xs text-text-muted">Curator Fee</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-white">₱{foxers.find(f => f.id === selectedFoxer)?.fee.toLocaleString()}</span>
                <button onClick={() => setSelectedFoxer(null)} className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-opacity">
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/20 p-4 text-center">
                <p className="text-xs text-text-muted mb-2">No curator selected</p>
                <button onClick={() => setActiveCategory('foxer')} className="text-xs font-bold text-accent hover:underline">Select One</button>
              </div>
            )}

            {/* Selected Services */}
            {selectedServices.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Add-ons</p>
                {Object.values(itemsByCategory).flat().filter(s => selectedServices.includes(s.id)).map(s => (
                  <div key={s.id} className="flex justify-between items-start animate-in fade-in slide-in-from-right-4 group relative">
                    <p className="text-sm text-gray-300 w-2/3">{s.name}</p>
                    <span className="text-sm font-bold text-white">₱{s.price.toLocaleString()}</span>
                    <button onClick={() => handleServiceToggle(s.id)} className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-opacity">
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
              <span className="text-3xl font-display font-bold text-accent">₱{calculateTotal().toLocaleString()}</span>
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
                  Request Booking <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-text-muted mt-3">You won&apos;t be charged yet.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const CATEGORY_ICONS: Record<string, string> = {
  music: 'music_note', sports: 'sports_soccer', food: 'restaurant',
  art: 'palette', tech: 'computer', business: 'work',
  wellness: 'spa', education: 'school', other: 'celebration',
};

function formatEventDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
}

const EventDetailsPage: React.FC = () => {
  const router = useRouter();
  const { eventId } = useParams();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCustomBookingOpen, setIsCustomBookingOpen] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancellationPolicy, setCancellationPolicy] = useState<{ name: string; description: string } | null>(null);
  const [clientMounted, setClientMounted] = useState(false);
  const storeItems = useEventBuilderStore((s) => s.baseItems);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!eventId) return;
    const id = eventId as string;
    if (isPreview) {
      import('@/features/booking/api/bookings').then(({ getOwnTemplate }) => {
        getOwnTemplate(id)
          .then(data => {
            if (!data) { setLoadError('Template not found.'); return; }
            setTemplate(data);
          })
          .catch((err) => setLoadError(err?.response?.data?.message ?? 'Failed to load preview.'));
      });
    } else {
      import('@/features/booking/api/bookings').then(({ getPublicTemplate }) => {
        getPublicTemplate(id)
          .then(data => {
            if (!data) { setLoadError('Template not found.'); return; }
            setTemplate(data);
          })
          .catch((err) => setLoadError(err?.response?.data?.message ?? 'Failed to load event.'));
      });
    }
  }, [eventId, isPreview]);

  // Fetch cancellation policy details when the template has one
  useEffect(() => {
    const policyId = template?.cancellationPolicyId;
    if (!policyId) { setCancellationPolicy(null); return; }
    import('@/features/cancellation-policy/api/cancellation-policies').then(({ fetchCancellationPolicyById }) => {
      fetchCancellationPolicyById(policyId)
        .then((p) => setCancellationPolicy({ name: p.name, description: p.description }))
        .catch(() => setCancellationPolicy({ name: 'Custom Policy', description: 'A cancellation policy applies to this event.' }));
    });
  }, [template?.cancellationPolicyId]);

  /* ── Derived data ── */
  const templateImages: string[] = (template?.images ?? []).map((img: any) => img.url).filter(Boolean);
  const hasImages = templateImages.length > 0;
  const location = [template?.targetCity, template?.targetState].filter(Boolean).join(', ') || null;
  const firstVenue = template?.templateVenues?.[0]?.venue;
  const mapLat: number | null = firstVenue?.lat ?? template?.lat ?? null;
  const mapLng: number | null = firstVenue?.lng ?? template?.lng ?? null;
  // In preview mode, calculate price from store items so it's always up-to-date
  const storePrice = storeItems.reduce((acc, item) => acc + (item.agreedPrice ?? item.cost), 0);
  const price: number = isPreview && storePrice > 0 ? storePrice : (template?.estimatedTotal > 0 ? template.estimatedTotal : 0);
  const ownerName: string = template?.owner?.name ?? 'Organizer';
  const ownerInitial = ownerName.charAt(0).toUpperCase();
  const eventDate = formatEventDate(template?.date);
  const maxAttendees: number | null = template?.maxAttendees ?? null;
  const category: string = template?.category ?? '';
  const isDraft = template?.status === 'draft' || template?.status === 'pending';

  const dbInclusions: { name: string; icon: string; desc: string; imageUrl?: string }[] = [
    ...(template?.templateVenues ?? []).map((v: any) => ({ name: v.venue?.name ?? 'Venue', icon: 'apartment', desc: v.venue?.description ?? '', imageUrl: v.venue?.images?.[0]?.url ?? undefined })),
    ...(template?.templateAssets ?? []).map((a: any) => ({ name: a.asset?.name ?? 'Asset', icon: 'category', desc: a.asset?.description ?? '', imageUrl: a.asset?.images?.[0]?.url ?? undefined })),
    ...(template?.templateServices ?? []).map((s: any) => ({ name: s.service?.name ?? 'Service', icon: 'star', desc: s.service?.description ?? '', imageUrl: s.service?.images?.[0]?.url ?? undefined })),
  ];
  // In preview mode always show store items (source of truth while building).
  // Fall back to DB inclusions only on the public listing page.
  // In preview: wait until client is mounted so the Zustand store is fully hydrated
  // from localStorage before deciding which source to use. Without this gate,
  // storeItems can be [] on first render even when the builder added 7 items.
  const inclusions: { name: string; icon: string; desc: string; imageUrl?: string }[] =
    isPreview && clientMounted && storeItems.length > 0
      ? storeItems.map((item) => ({ name: item.name, icon: item.icon, desc: item.desc ?? '', imageUrl: item.imageUrl }))
      : dbInclusions;

  if (loadError) return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white/40 text-center px-6">
        <span className="text-4xl">⚠️</span>
        <span className="text-sm text-white/60">{loadError}</span>
        <button onClick={() => router.back()} className="mt-2 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white hover:bg-white hover:text-black transition-all">Go back</button>
      </div>
    </div>
  );

  if (!template) return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white/40">
        <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        <span className="text-sm">Loading package…</span>
      </div>
    </div>
  );

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">

      <CustomExperienceBuilder isOpen={isCustomBookingOpen} onClose={() => setIsCustomBookingOpen(false)} venuePrice={price} />

      {/* Draft preview banner */}
      {isPreview && isDraft && (
        <div className="fixed top-0 left-0 right-0 z-200 h-9 bg-yellow-500/95 backdrop-blur-sm text-black text-xs font-bold text-center px-4 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[14px]">visibility</span>
          Draft Preview — this is how your listing will look when published
          <button onClick={() => router.back()} className="ml-4 underline opacity-70 hover:opacity-100">← Back to builder</button>
        </div>
      )}

      {/* Lightbox */}
      {galleryOpen && hasImages && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/50">
            <h3 className="font-display font-bold text-white">{template.name}</h3>
            <button onClick={() => setGalleryOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><span className="material-symbols-outlined text-white">close</span></button>
          </div>
          <div className="flex-1 relative flex items-center justify-center p-4">
            <img src={templateImages[activeImageIndex]} alt="Gallery" className="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-lg" />
            <button onClick={() => setActiveImageIndex((activeImageIndex - 1 + templateImages.length) % templateImages.length)} className="absolute left-4 p-4 rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/10"><span className="material-symbols-outlined">chevron_left</span></button>
            <button onClick={() => setActiveImageIndex((activeImageIndex + 1) % templateImages.length)} className="absolute right-4 p-4 rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/10"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      )}

      {/* Nav */}
      <header className={`fixed left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-20 ${isPreview && isDraft ? 'top-9' : 'top-0'}`}>
        <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold group-hover:rotate-180 transition-transform duration-700">
              <span className="material-symbols-outlined text-[24px]">explore</span>
            </div>
            <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">FoxPassport</h2>
          </Link>
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm font-medium text-white"><span className="material-symbols-outlined text-[18px]">share</span> Share</button>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm font-medium text-white"><span className="material-symbols-outlined text-[18px]">favorite_border</span> Save</button>
            <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white hover:text-black transition-all text-white"><span className="material-symbols-outlined">close</span></button>
          </div>
        </div>
      </header>

      <main className={`grow pb-20 px-4 sm:px-6 ${isPreview && isDraft ? 'pt-[132px]' : 'pt-28'}`}>
        <div className="max-w-7xl mx-auto">

          {/* Title */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[12px]">{CATEGORY_ICONS[category] ?? 'celebration'}</span>
                  {category}
                </span>
              )}
              {isPreview && isDraft && (
                <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">Draft</span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">{template.name || 'Untitled Event'}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
              {location && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-white/30">location_on</span>{location}</span>}
              {eventDate && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-white/30">calendar_today</span>{eventDate}</span>}
              {maxAttendees && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-white/30">group</span>Up to {maxAttendees} guests</span>}
            </div>
          </div>

          {/* Gallery */}
          {hasImages ? (
            <div className="grid grid-cols-4 grid-rows-2 gap-3 h-87.5 md:h-125 rounded-2xl overflow-hidden mb-12 relative">
              <div className="col-span-2 row-span-2 cursor-pointer group" onClick={() => { setActiveImageIndex(0); setGalleryOpen(true); }}>
                <img src={templateImages[0]} className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500" alt="Main" />
              </div>
              {templateImages.slice(1, 5).map((img: string, idx: number) => (
                <div key={idx} className="relative cursor-pointer group" onClick={() => { setActiveImageIndex(idx + 1); setGalleryOpen(true); }}>
                  <img src={img} className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500" alt={`View ${idx + 1}`} />
                  {idx === 3 && templateImages.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white font-bold text-lg">+{templateImages.length - 5}</span></div>
                  )}
                </div>
              ))}
              {templateImages.length > 1 && (
                <button onClick={() => { setActiveImageIndex(0); setGalleryOpen(true); }} className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-white hover:text-black transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">grid_view</span> Show all photos
                </button>
              )}
            </div>
          ) : (
            <div className="h-65 md:h-90 rounded-2xl mb-12 bg-white/3 border border-white/5 flex flex-col items-center justify-center gap-3 text-white/20">
              <span className="material-symbols-outlined text-5xl">photo_library</span>
              <p className="text-sm font-medium">No gallery images yet</p>
              {isPreview && <p className="text-xs text-white/15">Add photos in the Event Gallery section of the builder</p>}
            </div>
          )}

          <div className="grid lg:grid-cols-[1.8fr_1fr] gap-16">

            {/* Left */}
            <div className="space-y-10">

              {/* Host card */}
              <div className="bg-surface-highlight/30 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    {template.owner?.imgId ? (
                      <img src={template.owner.imgId} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" alt={ownerName} />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center border-2 border-white/10">
                        <span className="text-black text-2xl font-bold">{ownerInitial}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-[#7c3aed] text-white rounded-full p-1 border-4 border-[#0f111a] flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-white text-lg">Curated by {ownerName}</h3>
                    <p className="text-accent text-xs font-bold uppercase tracking-wider">Event Organizer</p>
                  </div>
                </div>
              </div>

              {/* Real event details */}
              {(eventDate || maxAttendees || location) && (
                <div className="space-y-5">
                  {eventDate && <div className="flex gap-4 items-start"><span className="material-symbols-outlined text-white text-2xl mt-0.5">calendar_today</span><div><h3 className="font-bold text-white text-base">Event Date</h3><p className="text-sm text-text-muted">{eventDate}</p></div></div>}
                  {maxAttendees && <div className="flex gap-4 items-start"><span className="material-symbols-outlined text-white text-2xl mt-0.5">group</span><div><h3 className="font-bold text-white text-base">Guest Capacity</h3><p className="text-sm text-text-muted">Up to {maxAttendees} guests</p></div></div>}
                  {location && <div className="flex gap-4 items-start"><span className="material-symbols-outlined text-white text-2xl mt-0.5">location_on</span><div><h3 className="font-bold text-white text-base">Location</h3><p className="text-sm text-text-muted">{location}</p></div></div>}
                </div>
              )}

              {(eventDate || maxAttendees || location) && <div className="h-px bg-white/10 w-full" />}

              {/* Description */}
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">About this experience</h3>
                {template.description
                  ? <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">{template.description}</p>
                  : <p className="text-white/20 italic text-sm">No description added yet.</p>
                }
              </div>

              <div className="h-px bg-white/10 w-full" />

              {/* Inclusions */}
              {inclusions.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-display font-bold text-white">Included in this Build</h3>
                    <button onClick={() => setIsCustomBookingOpen(true)} className="text-xs font-bold text-accent flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">edit</span> Customize</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {inclusions.map((svc, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        {svc.imageUrl ? (
                          <img src={svc.imageUrl} alt={svc.name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-surface-highlight flex items-center justify-center text-white/80 shrink-0"><span className="material-symbols-outlined">{svc.icon}</span></div>
                        )}
                        <div><h4 className="font-bold text-white text-sm">{svc.name}</h4><p className="text-xs text-text-muted mt-1 leading-relaxed">{svc.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isPreview ? (
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-4">Included in this Build</h3>
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/15 block mb-2">inventory_2</span>
                    <p className="text-sm text-white/25">No venues, gear, or services added yet.</p>
                    <p className="text-xs text-white/15 mt-1">Drag items into the builder to include them.</p>
                  </div>
                </div>
              ) : null}

              {(inclusions.length > 0 || isPreview) && <div className="h-px bg-white/10 w-full" />}

              {/* Map */}
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Where you&apos;ll be</h3>
                {location && <p className="text-text-muted text-sm mb-6">{location}</p>}
                {mapLat && mapLng ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10">
                    <LocationMap lat={mapLat} lng={mapLng} className="h-80 w-full" />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                      <span className="bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">Exact location provided after booking</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-52 rounded-2xl bg-white/3 border border-white/5 flex flex-col items-center justify-center gap-2 text-white/20">
                    <span className="material-symbols-outlined text-3xl">location_off</span>
                    <p className="text-sm">Set a location in the builder to show the map</p>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/10 w-full" />

              {/* Host bio */}
              <div className="flex gap-6 items-start">
                <div className="relative shrink-0">
                  {template.owner?.imgId ? (
                    <img src={template.owner.imgId} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" alt="Host" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center border-2 border-white/10">
                      <span className="text-black text-2xl font-bold">{ownerInitial}</span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-[#7c3aed] text-white rounded-full p-1 border-4 border-[#0f111a] shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Hosted by {ownerName}</h3>
                  <p className="text-text-muted text-sm mb-4">FoxPassport Organizer</p>
                  <div className="flex gap-4 text-sm text-white mb-4">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-accent">verified</span> Identity Verified</span>
                  </div>
                  <button className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors">Contact Host</button>
                </div>
              </div>

              <div className="h-px bg-white/10 w-full" />

              {/* Things to know */}
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-6">Things to know</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-white text-sm mb-3">Event Info</h4>
                    <div className="space-y-2 text-sm text-text-muted">
                      {maxAttendees && <p>Maximum {maxAttendees} guests</p>}
                      {category && <p>Category: {category.charAt(0).toUpperCase() + category.slice(1)}</p>}
                      {!maxAttendees && !category && <p className="italic text-white/20">No details set yet.</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-3">Cancellation Policy</h4>
                    <div className="space-y-2 text-sm text-text-muted">
                      {cancellationPolicy ? (
                        <>
                          <p className="font-semibold text-white/80">{cancellationPolicy.name}</p>
                          {cancellationPolicy.description && <p>{cancellationPolicy.description}</p>}
                        </>
                      ) : template?.cancellationPolicyId ? (
                        <p>Loading policy…</p>
                      ) : (
                        <p>Default policy: full refund if cancelled within 48 hours of booking.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Booking widget */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-glow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="mb-6 relative z-10">
                    {price > 0
                      ? <><span className="text-2xl font-display font-bold text-white">₱{price.toLocaleString()}</span><span className="text-sm text-text-muted"> est. total</span></>
                      : <span className="text-sm text-text-muted">Price on request</span>
                    }
                  </div>

                  {isPreview ? (
                    <div className="w-full rounded-xl border border-dashed border-white/15 py-3.5 text-white/30 text-sm font-bold text-center mb-4 relative z-10">
                      Booking available after publishing
                    </div>
                  ) : (
                    <>
                      <button onClick={() => router.push(`/booking/config?templateId=${eventId}`)} className="w-full btn-neon rounded-xl bg-accent py-3.5 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95 mb-4 relative z-10">Reserve</button>
                      <button onClick={() => setIsCustomBookingOpen(true)} className="w-full rounded-xl border border-white/20 py-3.5 text-white font-bold text-sm hover:bg-white hover:text-black transition-all active:scale-95 mb-4 relative z-10 flex items-center justify-center gap-2 group">
                        <span className="material-symbols-outlined text-accent group-hover:text-black transition-colors">design_services</span>Design Custom Experience
                      </button>
                      <p className="text-center text-xs text-text-muted mb-6 relative z-10">You won&apos;t be charged yet</p>
                    </>
                  )}

                  {price > 0 && (
                    <>
                      <div className="space-y-3 text-sm text-gray-300 relative z-10 pb-4">
                        <div className="flex justify-between"><span>Package estimate</span><span>₱{price.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Service fee</span><span>₱150</span></div>
                      </div>
                      <div className="h-px bg-white/10 mb-4 relative z-10" />
                      <div className="flex justify-between items-center text-white font-bold text-lg relative z-10"><span>Total</span><span>₱{(price + 150).toLocaleString()}</span></div>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="bg-black pt-20 pb-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-white">explore</span><span className="text-xl font-display font-bold text-white">FoxPassport</span></div>
            <p className="text-xs text-gray-500">© 2024 FoxPassport Republic. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-xs text-gray-500 hover:text-white transition-colors" href="#">Privacy</a>
              <a className="text-xs text-gray-500 hover:text-white transition-colors" href="#">Terms</a>
              <a className="text-xs text-gray-500 hover:text-white transition-colors" href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventDetailsPage;
