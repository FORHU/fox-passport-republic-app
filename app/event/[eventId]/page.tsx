'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Mock Data for Customization ---
const AVAILABLE_FOXERS = [
  { id: 1, name: 'Jinx', role: 'Visual Director', fee: 5000, rating: 5.0, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', description: 'Specializes in neon aesthetics and cyberpunk themes.' },
  { id: 2, name: 'Kael', role: 'Audio Engineer', fee: 4500, rating: 4.8, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop', description: 'Expert in immersive soundscapes and bass-heavy setups.' },
  { id: 3, name: 'Luna', role: 'Stylist', fee: 6000, rating: 4.9, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop', description: 'Fashion and venue styling for the perfect photo op.' },
  { id: 4, name: 'Orion', role: 'Lighting Tech', fee: 5500, rating: 4.9, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', description: 'Laser shows and projection mapping wizard.' },
  { id: 5, name: 'Nova', role: 'Mixologist', fee: 4000, rating: 4.7, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop', description: 'Crafts custom themed cocktails for your event.' },
];

const SERVICE_CATEGORIES = [
  { id: 'foxer', label: 'Curator', icon: 'person_search' },
  { id: 'catering', label: 'Food & Drink', icon: 'restaurant' },
  { id: 'tech', label: 'Tech & AV', icon: 'speaker' },
  { id: 'decor', label: 'Decor & Style', icon: 'palette' },
  { id: 'media', label: 'Photo & Video', icon: 'videocam' },
];

const CUSTOM_SERVICES: Record<string, any[]> = {
  catering: [
    { id: 'cat1', name: 'Neon Cocktail Bar', price: 15000, icon: 'local_bar', desc: 'Unlimited signature cocktails for 4 hours.' },
    { id: 'cat2', name: 'Midnight Ramen Station', price: 12000, icon: 'ramen_dining', desc: 'Hot ramen bar with 3 broth choices.' },
    { id: 'cat3', name: 'Sushi Platter Deluxe', price: 8000, icon: 'set_meal', desc: 'Fresh sashimi and rolls for 20 pax.' },
  ],
  tech: [
    { id: 'tech1', name: 'Funktion-One Sound', price: 25000, icon: 'speaker', desc: 'Club-standard audio system setup.' },
    { id: 'tech2', name: 'Laser & Fog Show', price: 8000, icon: 'blur_on', desc: 'Synchronized light show with heavy fog.' },
    { id: 'tech3', name: 'Silent Disco Gear', price: 10000, icon: 'headphones', desc: '50 headsets and 3-channel transmitter.' },
  ],
  decor: [
    { id: 'dec1', name: 'Cyberpunk Props', price: 5000, icon: 'smart_toy', desc: 'Futuristic barrels, wires, and neon signs.' },
    { id: 'dec2', name: 'Lounge Seating', price: 7000, icon: 'chair', desc: 'Velvet sofas and LED tables.' },
  ],
  media: [
    { id: 'med1', name: 'Aftermovie (Drone)', price: 10000, icon: 'videocam', desc: '4K drone shots and cinematic editing.' },
    { id: 'med2', name: 'Film Photo Booth', price: 5000, icon: 'camera', desc: 'Unlimited prints with custom border.' },
  ]
};

// Default inclusions for this specific event
const DEFAULT_INCLUSIONS = [
  { name: 'Standard Audio', icon: 'speaker', desc: 'High-fidelity sound system suitable for 200 pax.' },
  { name: 'Ambient Lighting', icon: 'light_mode', desc: 'Static wash lighting to set the mood.' },
  { name: 'Welcome Drinks', icon: 'local_bar', desc: '2 signature cocktails per guest upon entry.' },
  { name: 'Event Photography', icon: 'photo_camera', desc: 'Roaming photographer for 2 hours.' },
];

const CustomExperienceBuilder: React.FC<{ isOpen: boolean; onClose: () => void; venuePrice: number }> = ({ isOpen, onClose, venuePrice }) => {
  const [activeCategory, setActiveCategory] = useState('foxer');
  const [selectedFoxer, setSelectedFoxer] = useState<number | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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
    let total = venuePrice * 2; // Base
    if (selectedFoxer) {
      const foxer = AVAILABLE_FOXERS.find(f => f.id === selectedFoxer);
      if (foxer) total += foxer.fee;
    }
    Object.values(CUSTOM_SERVICES).flat().forEach(svc => {
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
    const services = CUSTOM_SERVICES[activeCategory] || [];
    if (!searchQuery) return services;
    return services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string | number, type: 'foxer' | 'service') => {
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
      setSelectedFoxer(Number(id));
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
                {AVAILABLE_FOXERS.map(foxer => (
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
                    <p className="text-sm font-bold text-white">{AVAILABLE_FOXERS.find(f => f.id === selectedFoxer)?.name}</p>
                    <p className="text-xs text-text-muted">Curator Fee</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-white">₱{AVAILABLE_FOXERS.find(f => f.id === selectedFoxer)?.fee.toLocaleString()}</span>
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
                {Object.values(CUSTOM_SERVICES).flat().filter(s => selectedServices.includes(s.id)).map(s => (
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
            <p className="text-[10px] text-center text-text-muted mt-3">You won't be charged yet.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?w=800&auto=format&fit=crop",
];

const EventDetailsPage: React.FC = () => {
  const router = useRouter();
  const { eventId } = useParams();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCustomBookingOpen, setIsCustomBookingOpen] = useState(false);
  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (eventId) {
      import('@/lib/api/bookings').then(({ getPublicTemplate }) => {
        getPublicTemplate(eventId as string)
          .then(data => setTemplate(data))
          .catch(() => {});
      });
    }
  }, [eventId]);

  const templateImages: string[] = template?.images?.map((img: any) => img.url).filter(Boolean) ?? [];
  const displayImages = templateImages.length > 0 ? templateImages : FALLBACK_IMAGES;
  const location = [template?.targetCity, template?.targetState].filter(Boolean).join(', ') || 'Philippines';

  const venue = {
    title:       template?.name        ?? "Event Package",
    location,
    province:    template?.targetState ?? "Philippines",
    category:    template?.category    ?? "event",
    description: template?.description ?? "",
    price:       template?.estimatedTotal > 0 ? template.estimatedTotal : 0,
    images:      displayImages,
    // static placeholders — not in the template model
    rating: 4.92, reviews: 124,
    offers: ["VIP Access", "2 Free Drinks", "Pro Photography", "Air Conditioning", "Secure Parking", "Meet & Greet"],
  };

  const host = {
    name:         template?.owner?.name  ?? "Organizer",
    avatar:       null as string | null,
    description:  `Organizer of ${venue.title}`,
    isCertified:  true,
    rating: 4.98, reviews: 240, yearsHosting: 3,
    responseRate: 100, responseTime: "within an hour",
  };

  const openGallery = (index: number) => {
    setActiveImageIndex(index);
    setGalleryOpen(true);
  };

  if (!template) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/40">
          <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          <span className="text-sm">Loading package…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">

      <CustomExperienceBuilder
        isOpen={isCustomBookingOpen}
        onClose={() => setIsCustomBookingOpen(false)} 
        venuePrice={venue.price}
      />

      {/* Lightbox Gallery Overlay */}
      {galleryOpen && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/50">
            <h3 className="font-display font-bold text-white">{venue.title}</h3>
            <button onClick={() => setGalleryOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center p-4">
            <img src={venue.images[activeImageIndex]} alt="Gallery" className="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-lg" />
            <button onClick={() => setActiveImageIndex((activeImageIndex - 1 + venue.images.length) % venue.images.length)} className="absolute left-4 p-4 rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/10 transition-all">
              <span className="material-symbols-outlined text-white">chevron_left</span>
            </button>
            <button onClick={() => setActiveImageIndex((activeImageIndex + 1) % venue.images.length)} className="absolute right-4 p-4 rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/10 transition-all">
              <span className="material-symbols-outlined text-white">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-20 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:rotate-180 transition-transform duration-700">
              <span className="material-symbols-outlined text-[24px]">explore</span>
            </div>
            <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">FoxPassport</h2>
          </Link>
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-white">
              <span className="material-symbols-outlined text-[18px]">share</span> Share
            </button>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-white">
              <span className="material-symbols-outlined text-[18px]">favorite_border</span> Save
            </button>
            <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white hover:text-black transition-all text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </header>

      <main className="grow pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Title Section */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">{venue.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-1 font-bold text-white">
                <span className="material-symbols-outlined text-[18px] fill-current text-white">star</span>
                {venue.rating}
                <span className="text-text-muted font-normal underline decoration-dotted cursor-pointer ml-1">{venue.reviews} reviews</span>
              </div>
              <span>·</span>
              <span className="flex items-center gap-1 text-white underline decoration-dotted cursor-pointer">
                {venue.location}, {venue.province}
              </span>
            </div>
          </div>

          {/* Hero Image Grid */}
          <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[350px] md:h-[500px] rounded-2xl overflow-hidden mb-12 relative">
            <div className="col-span-2 row-span-2 relative cursor-pointer group" onClick={() => openGallery(0)}>
              <img src={venue.images[0]} className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500" alt="Main" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>
            {venue.images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative cursor-pointer group" onClick={() => openGallery(idx + 1)}>
                <img src={img} className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500" alt={`View ${idx}`} />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>
            ))}
            <button 
              onClick={() => openGallery(0)}
              className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-white hover:text-black transition-all flex items-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              Show all photos
            </button>
          </div>

          <div className="grid lg:grid-cols-[1.8fr_1fr] gap-16 relative">
            
            {/* Left Column: Details */}
            <div className="space-y-10">
              
              {/* Curator Section */}
              <div className="bg-surface-highlight/30 border border-white/5 rounded-3xl p-6 mb-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>
                  <div className="flex items-start gap-4 relative z-10">
                      <div className="relative shrink-0">
                          {host.avatar ? (
                            <img src={host.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" alt={host.name} />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-[#ccff00] flex items-center justify-center border-2 border-white/10">
                              <span className="text-black text-2xl font-bold">{host.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 border-4 border-[#0f111a] flex items-center justify-center shadow-sm">
                              <span className="material-symbols-outlined text-[14px]">verified</span>
                          </div>
                      </div>
                      <div className="flex-1">
                          <div className="flex justify-between items-start">
                              <div>
                                  <h3 className="font-display font-bold text-white text-lg">Curated by {host.name}</h3>
                                  <p className="text-accent text-xs font-bold uppercase tracking-wider mb-2">Visual Director</p>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-black/40 px-2 py-1 rounded-lg">
                                  <span className="material-symbols-outlined text-[14px] fill-current">star</span> {host.rating}
                              </div>
                          </div>
                          <p className="text-sm text-text-muted leading-relaxed">
                              "{host.description}"
                          </p>
                      </div>
                  </div>
              </div>

              {/* Highlights */}
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                    <span className="material-symbols-outlined text-white text-2xl mt-1">verified</span>
                    <div>
                        <h3 className="font-bold text-white text-base">Certified Foxer</h3>
                        <p className="text-sm text-text-muted">Experienced host with verified identity and skills.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <span className="material-symbols-outlined text-white text-2xl mt-1">location_on</span>
                    <div>
                        <h3 className="font-bold text-white text-base">Great Location</h3>
                        <p className="text-sm text-text-muted">95% of recent guests gave the location a 5-star rating.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <span className="material-symbols-outlined text-white text-2xl mt-1">calendar_today</span>
                    <div>
                        <h3 className="font-bold text-white text-base">Free cancellation for 48 hours</h3>
                        <p className="text-sm text-text-muted">Get a full refund if you change your mind.</p>
                    </div>
                </div>
              </div>

              <div className="h-px bg-white/10 w-full"></div>

              {/* Description */}
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">About this experience</h3>
                <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line mb-4">
                    {venue.description}
                </p>
                <button className="text-white font-bold underline decoration-accent underline-offset-4 flex items-center gap-1 hover:text-accent transition-colors">
                    Show more <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>

              <div className="h-px bg-white/10 w-full"></div>

              {/* Included Services Section */}
              <div>
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-display font-bold text-white">Included in this Build</h3>
                      <button onClick={() => setIsCustomBookingOpen(true)} className="text-xs font-bold text-accent hover:text-white transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">edit</span> Customize
                      </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {DEFAULT_INCLUSIONS.map((svc, i) => (
                          <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                              <div className="h-10 w-10 rounded-xl bg-surface-highlight flex items-center justify-center text-white/80 shrink-0">
                                  <span className="material-symbols-outlined">{svc.icon}</span>
                              </div>
                              <div>
                                  <h4 className="font-bold text-white text-sm">{svc.name}</h4>
                                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{svc.desc}</p>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-4 bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3 items-start">
                      <span className="material-symbols-outlined text-accent shrink-0">info</span>
                      <div>
                          <p className="text-sm text-white font-bold mb-1">Not your vibe?</p>
                          <p className="text-xs text-text-muted">
                              You can swap the curator, upgrade the sound, or add crazy extras like a ramen bar in the 
                              <button onClick={() => setIsCustomBookingOpen(true)} className="text-white font-bold underline decoration-accent decoration-2 underline-offset-2 ml-1 hover:text-accent transition-colors">Experience Builder</button>.
                          </p>
                      </div>
                  </div>
              </div>

              <div className="h-px bg-white/10 w-full"></div>

              {/* Amenities */}
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-6">What this place offers</h3>
                <div className="grid grid-cols-2 gap-4">
                    {venue.offers.map((offer, i) => (
                        <div key={i} className="flex items-center gap-3 text-gray-300">
                            <span className="material-symbols-outlined text-[24px] text-white/70">
                                {offer.includes('Wifi') ? 'wifi' : 
                                 offer.includes('Parking') ? 'local_parking' : 
                                 offer.includes('Kitchen') ? 'kitchen' : 
                                 offer.includes('Air') ? 'ac_unit' : 
                                 offer.includes('Pool') ? 'pool' : 
                                 'check_circle'}
                            </span>
                            {offer}
                        </div>
                    ))}
                </div>
                <button className="mt-8 px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors">
                    Show all 15 amenities
                </button>
              </div>

              <div className="h-px bg-white/10 w-full"></div>

              {/* Calendar Visual */}
              <div>
                 <h3 className="text-2xl font-display font-bold text-white mb-2">Select check-in and check-out dates</h3>
                 <p className="text-text-muted text-sm mb-6">Add your travel dates for exact pricing</p>
                 <div className="bg-surface-highlight/30 rounded-2xl p-6 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-white">October 2024</span>
                        <div className="flex gap-2">
                            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white"><span className="material-symbols-outlined">chevron_left</span></button>
                            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white"><span className="material-symbols-outlined">chevron_right</span></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-400 mb-2">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    </div>
                    <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-medium">
                        <span className="p-2 text-white/20">29</span>
                        <span className="p-2 text-white/20">30</span>
                        {[...Array(31)].map((_, i) => {
                            const day = i + 1;
                            const isAvailable = day > 10;
                            // Mock range selection logic: Oct 12 - 14
                            const isSelected = day >= 12 && day <= 14;
                            const isRangeStart = day === 12;
                            const isRangeEnd = day === 14;
                            
                            return (
                                <div key={day} className="relative py-1">
                                    {/* Range Background Connector */}
                                    {isSelected && (
                                        <div className={`absolute inset-y-1 bg-accent/20 ${
                                            isRangeStart ? 'left-1/2 right-0 rounded-l-full' :
                                            isRangeEnd ? 'left-0 right-1/2 rounded-r-full' :
                                            'inset-x-0'
                                        }`}></div>
                                    )}
                                    
                                    {/* Day Circle */}
                                    <span 
                                        className={`relative z-10 w-9 h-9 mx-auto flex items-center justify-center rounded-full transition-all ${
                                            isSelected ? 'bg-accent text-black font-bold shadow-[0_0_10px_#ccff00]' : 
                                            isAvailable ? 'text-white hover:bg-white/10 cursor-pointer' : 
                                            'text-white/30 line-through decoration-white/20'
                                        }`}
                                    >
                                        {day}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-end mt-6">
                        <button className="text-xs font-bold text-white underline decoration-white/30 hover:decoration-white transition-all">Clear dates</button>
                    </div>
                 </div>
              </div>

              <div className="h-px bg-white/10 w-full"></div>

              {/* Ratings & Reviews */}
              <div id="reviews">
                 <div className="flex items-center gap-2 mb-8">
                    <span className="material-symbols-outlined text-4xl text-white fill-current">star</span>
                    <h2 className="text-5xl font-display font-bold text-white">{venue.rating}</h2>
                    <div className="flex flex-col justify-center h-full ml-4 pl-4 border-l border-white/10">
                        <span className="text-lg font-bold text-white leading-none">Guest favorite</span>
                        <p className="text-sm text-text-muted mt-1">One of the most loved homes on FoxPassport</p>
                    </div>
                 </div>

                 {/* Rating Bars */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-10">
                    {[
                        { stars: 5, count: '92%' },
                        { stars: 4, count: '6%' },
                        { stars: 3, count: '2%' },
                        { stars: 2, count: '0%' },
                        { stars: 1, count: '0%' },
                    ].map((row) => (
                        <div key={row.stars} className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white w-3">{row.stars}</span>
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-accent rounded-full shadow-[0_0_8px_rgba(204,255,0,0.5)]" style={{ width: row.count }}></div>
                            </div>
                            <span className="text-xs font-medium text-text-muted w-8 text-right">{row.count}</span>
                        </div>
                    ))}
                 </div>

                 {/* Review Cards */}
                 <div className="grid md:grid-cols-2 gap-6">
                    {[
                        { name: "Sarah K.", date: "January 2024", text: "So cozy! The real highlight was the host. Neon Vertex made sure we had everything we needed. 10/10 would vibe again.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U" },
                        { name: "Mike T.", date: "December 2023", text: "Great location, very quiet despite being in the center of the district. The photography add-on is a must!", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgd--zxF5w1ZztnRmVlmV-feUqN_qBWaBYUT5CujXc0w-0AUuWAmHt_hqnGMMe6m_fRhEWkVx4s-GPtdMKYzlfSOQqHXDOj1gZA2nyUJx9g-k_T2GXeIiYRFWE4OhzISNwTdKHnUtx3za3LKNh05jbmOS4npA_2XzCQ6-b0jqwzXF4Zy5LKfBRtJpHKvZknn8VWcB24VzWfO5VUZJ4zVgdHD766vR4O1OP3A6j3meIxBZLNL5KDybSUXLKzRdPbfxAQ2NIKRBRKsA" }
                    ].map((review, i) => (
                        <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <img src={review.img} className="w-10 h-10 rounded-full object-cover" alt={review.name} />
                                <div>
                                    <h4 className="font-bold text-white text-sm">{review.name}</h4>
                                    <p className="text-xs text-text-muted">{review.date}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">{review.text}</p>
                        </div>
                    ))}
                 </div>
                 
                 <button className="mt-8 px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors">
                    Show all {venue.reviews} reviews
                 </button>
              </div>

              <div className="h-px bg-white/10 w-full"></div>

              {/* Map Section */}
              <div>
                 <h3 className="text-2xl font-display font-bold text-white mb-2">Where you'll be</h3>
                 <p className="text-text-muted text-sm mb-6">{venue.location}, {venue.province}</p>
                 <div className="h-80 w-full rounded-2xl bg-[#1f2235] relative overflow-hidden flex items-center justify-center border border-white/10 group">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                    <div className="absolute inset-0 bg-linear-to-t from-[#02040a] via-transparent to-transparent opacity-50"></div>
                    <div className="relative z-10 flex flex-col items-center gap-2 group-hover:-translate-y-2 transition-transform duration-300">
                        <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
                            <div className="h-4 w-4 bg-accent rounded-full shadow-[0_0_20px_#ccff00]"></div>
                        </div>
                        <span className="bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">Exact location provided after booking</span>
                    </div>
                 </div>
              </div>

              <div className="h-px bg-white/10 w-full"></div>

              {/* Host Bio */}
              <div className="flex gap-6">
                 <div className="relative shrink-0">
                    {host.avatar ? (
                      <img src={host.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" alt="Host" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#ccff00] flex items-center justify-center border-2 border-white/10">
                        <span className="text-black text-2xl font-bold">{host.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 border-4 border-[#0f111a] shadow-sm flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white mb-1">Hosted by {host.name}</h3>
                    <p className="text-text-muted text-sm mb-4">Joined May 2021</p>
                    <div className="flex gap-4 text-sm text-white mb-4">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-accent">star</span> {host.reviews} Reviews</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-accent">verified</span> Identity Verified</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-accent">work</span> Superhost</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">{host.description}</p>
                    <div className="flex items-center gap-4">
                        <button className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors">
                            Contact Host
                        </button>
                    </div>
                 </div>
              </div>

              <div className="h-px bg-white/10 w-full"></div>

              {/* Things to Know */}
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-6">Things to know</h3>
                <div className="grid md:grid-cols-3 gap-8">
                   <div>
                      <h4 className="font-bold text-white text-sm mb-3">House Rules</h4>
                      <div className="space-y-2 text-sm text-text-muted">
                        <p>Check-in after 2:00 PM</p>
                        <p>Checkout before 12:00 PM</p>
                        <p>3 guests maximum</p>
                      </div>
                   </div>
                   <div>
                      <h4 className="font-bold text-white text-sm mb-3">Safety & Property</h4>
                      <div className="space-y-2 text-sm text-text-muted">
                        <p>Carbon monoxide alarm</p>
                        <p>Smoke alarm</p>
                        <p>Security camera on property</p>
                      </div>
                   </div>
                   <div>
                      <h4 className="font-bold text-white text-sm mb-3">Cancellation Policy</h4>
                      <div className="space-y-2 text-sm text-text-muted">
                        <p>Free cancellation for 48 hours.</p>
                        <p>Review the full policy for details.</p>
                      </div>
                   </div>
                </div>
              </div>

            </div>

            {/* Right Column: Booking Widget */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-glow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-end mb-6 relative z-10">
                    <div>
                      {venue.price > 0 ? (
                        <>
                          <span className="text-2xl font-display font-bold text-white">₱{venue.price.toLocaleString()}</span>
                          <span className="text-sm text-text-muted"> est. total</span>
                        </>
                      ) : (
                        <span className="text-sm text-text-muted">Price on request</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white font-bold">
                        <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                        {venue.rating} · <span className="text-text-muted underline cursor-pointer">{venue.reviews} reviews</span>
                    </div>
                  </div>

                  <div className="border border-white/20 rounded-xl overflow-hidden mb-4 relative z-10">
                    <div className="grid grid-cols-2 border-b border-white/20">
                      <div className="p-3 border-r border-white/20 hover:bg-white/5 cursor-pointer transition-colors relative group">
                        <label className="block text-[10px] font-bold uppercase text-text-muted mb-1 group-hover:text-white">Check-in</label>
                        <div className="text-sm text-white font-medium">Oct 12</div>
                      </div>
                      <div className="p-3 hover:bg-white/5 cursor-pointer transition-colors group">
                        <label className="block text-[10px] font-bold uppercase text-text-muted mb-1 group-hover:text-white">Checkout</label>
                        <div className="text-sm text-white font-medium">Oct 14</div>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-white/5 cursor-pointer transition-colors group">
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1 group-hover:text-white">Guests</label>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white font-medium">1 guest</span>
                        <span className="material-symbols-outlined text-[18px] text-white">expand_more</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push(`/booking/config?templateId=${eventId}`)}
                    className="w-full btn-neon rounded-xl bg-accent py-3.5 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95 mb-4 relative z-10"
                  >
                    Reserve
                  </button>

                  <button 
                    onClick={() => setIsCustomBookingOpen(true)}
                    className="w-full rounded-xl border border-white/20 py-3.5 text-white font-bold text-sm hover:bg-white hover:text-black transition-all active:scale-95 mb-4 relative z-10 flex items-center justify-center gap-2 group"
                  >
                    <span className="material-symbols-outlined text-accent group-hover:text-black transition-colors">design_services</span>
                    Design Custom Experience
                  </button>

                  <p className="text-center text-xs text-text-muted mb-6 relative z-10">You won't be charged yet</p>

                  {venue.price > 0 && (
                    <>
                      <div className="space-y-3 text-sm text-gray-300 relative z-10 pb-4">
                        <div className="flex justify-between">
                          <span className="underline decoration-dotted cursor-pointer">Package estimate</span>
                          <span>₱{venue.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="underline decoration-dotted cursor-pointer">Service fee</span>
                          <span>₱150</span>
                        </div>
                      </div>
                      <div className="h-px bg-white/10 mb-4 relative z-10"></div>
                      <div className="flex justify-between items-center text-white font-bold text-lg relative z-10">
                        <span>Total</span>
                        <span>₱{(venue.price + 150).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
                    <span className="material-symbols-outlined text-[14px]">flag</span>
                    <span className="underline cursor-pointer hover:text-white">Report this listing</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black pt-20 pb-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white">explore</span>
              <span className="text-xl font-display font-bold text-white">FoxPassport</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">© 2024 FoxPassport Republic All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">Privacy</a>
              <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">Terms</a>
              <a className="text-xs text-gray-500 hover:text-white font-medium transition-colors" href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventDetailsPage;
