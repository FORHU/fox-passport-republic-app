"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- Mock Data for Creator Assets ---
const RESOURCE_CATEGORIES = [
  { id: 'venue', label: 'Venues', icon: 'apartment' },
  { id: 'talent', label: 'Talent', icon: 'groups' },
  { id: 'service', label: 'Services', icon: 'room_service' },
  { id: 'equipment', label: 'Equipment', icon: 'speaker' },
  { id: 'vibe', label: 'Vibe Elements', icon: 'shutter_speed' },
];

const AVAILABLE_RESOURCES = {
  venue: [
    { id: 'v1', name: 'Skyline Loft', cost: 15000, icon: 'location_city', desc: 'Modern rooftop with city views. 50pax capacity.' },
    { id: 'v2', name: 'The Bunker', cost: 25000, icon: 'warehouse', desc: 'Underground industrial space. 200pax capacity.' },
    { id: 'v3', name: 'Secret Garden', cost: 18000, icon: 'forest', desc: 'Lush outdoor setting in the city. 80pax.' },
    { id: 'v4', name: 'Neon Studio', cost: 12000, icon: 'palette', desc: 'Cyberpunk themed photo studio. 30pax.' },
  ],
  talent: [
    { id: 't1', name: 'DJ K-OS', cost: 8000, icon: 'music_note', desc: 'Techno & House specialist. 4 hour set.' },
    { id: 't2', name: 'Mixologist Marco', cost: 5000, icon: 'local_bar', desc: 'Custom cocktail menu creation + service.' },
    { id: 't3', name: 'Visuals by Sarah', cost: 6000, icon: 'movie_filter', desc: 'Projection mapping and live visuals.' },
    { id: 't4', name: 'Host/Emcee', cost: 3500, icon: 'mic', desc: 'Engaging host to keep the energy up.' },
  ],
  service: [
    { id: 's1', name: 'Full Catering', cost: 20000, icon: 'restaurant', desc: 'Buffet style dinner for 50 pax.' },
    { id: 's2', name: 'Security Detail', cost: 4000, icon: 'security', desc: '2 bouncers for 4 hours.' },
    { id: 's3', name: 'Valet Service', cost: 3000, icon: 'local_parking', desc: 'Professional parking management.' },
    { id: 's4', name: 'Cleanup Crew', cost: 2500, icon: 'cleaning_services', desc: 'Post-event cleaning service.' },
  ],
  equipment: [
    { id: 'e1', name: 'Funktion-One System', cost: 15000, icon: 'speaker_group', desc: 'Club standard audio setup.' },
    { id: 'e2', name: 'Laser Rig', cost: 5000, icon: 'light_mode', desc: '3-point laser setup with controller.' },
    { id: 'e3', name: 'Fog Machines', cost: 2000, icon: 'cloud', desc: 'Heavy fog for atmosphere.' },
    { id: 'e4', name: 'Photo Booth', cost: 4500, icon: 'camera_alt', desc: 'Digital booth with instant sharing.' },
  ],
  vibe: [
    { id: 'vb1', name: 'Neon Signage', cost: 1500, icon: 'bolt', desc: 'Custom neon signs for photo ops.' },
    { id: 'vb2', name: 'Bean Bags', cost: 1000, icon: 'chair', desc: 'Chill zone seating.' },
    { id: 'vb3', name: 'Art Installation', cost: 5000, icon: 'palette', desc: 'Centerpiece art structure.' },
  ]
};

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop'
];

const EventCreationBuilder: React.FC = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('venue');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  
  // Builder State
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0]);
  
  const [baseItems, setBaseItems] = useState<any[]>([]);
  const [upsellItems, setUpsellItems] = useState<any[]>([]);
  const [targetMargin, setTargetMargin] = useState(20); // Percentage

  // Drag State
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const getFilteredResources = () => {
    const resources = AVAILABLE_RESOURCES[activeCategory as keyof typeof AVAILABLE_RESOURCES] || [];
    if (!searchQuery) return resources;
    return resources.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'copy';
    // Transparent drag image or default
  };

  const handleDragOver = (e: React.DragEvent, zone: 'base' | 'upsell') => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent, zone: 'base' | 'upsell') => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (draggedItem) {
      if (zone === 'base') {
        if (!baseItems.find(i => i.id === draggedItem.id)) {
          setBaseItems(prev => [...prev, draggedItem]);
        }
      } else {
        if (!upsellItems.find(i => i.id === draggedItem.id)) {
          setUpsellItems(prev => [...prev, draggedItem]);
        }
      }
    }
    setDraggedItem(null);
  };

  const removeItem = (id: string, zone: 'base' | 'upsell') => {
    if (zone === 'base') {
      setBaseItems(prev => prev.filter(i => i.id !== id));
    } else {
      setUpsellItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const rotateCover = () => {
    const currentIdx = COVER_PRESETS.indexOf(coverImage);
    setCoverImage(COVER_PRESETS[(currentIdx + 1) % COVER_PRESETS.length]);
  };

  const calculateFinancials = () => {
    const baseCost = baseItems.reduce((acc, item) => acc + item.cost, 0);
    const suggestedPrice = baseCost * (1 + targetMargin / 100);
    return { baseCost, suggestedPrice };
  };

  const { baseCost, suggestedPrice } = calculateFinancials();

  const handlePublish = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push('/foxer');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#02040a] text-white flex flex-col font-body">
      {/* Header */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f111a]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/foxer')} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="font-display font-bold text-xl leading-none flex items-center gap-2">
              Event Studio <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] uppercase tracking-wider">Beta</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               {eventTitle || 'Untitled Event'} (Draft)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-2.5 rounded-full border border-white/10 text-sm font-bold hover:bg-white/5 transition-colors">
            Save Draft
          </button>
          <button 
            onClick={handlePublish}
            disabled={isSubmitting}
            className="btn-neon px-6 py-2.5 rounded-full bg-accent text-black text-sm font-bold hover:shadow-[0_0_15px_rgba(204,255,0,0.4)] transition-all flex items-center gap-2"
          >
            {isSubmitting ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : 'Publish Event'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar 1: Categories Strip */}
        <nav className="w-24 flex-shrink-0 bg-[#0f111a] border-r border-white/5 flex flex-col items-center py-6 gap-4 overflow-y-auto hide-scrollbar z-20">
          {RESOURCE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 group relative ${
                activeCategory === cat.id 
                  ? 'bg-accent text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' 
                  : 'text-text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-2xl mb-1">{cat.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">{cat.label.split(' ')[0]}</span>
              {activeCategory === cat.id && (
                <div className="absolute right-[-18px] top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-l-full"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Left Sidebar 2: Asset List Drawer */}
        <aside className="w-72 flex-shrink-0 border-r border-white/5 bg-[#0f111a]/50 flex flex-col relative z-10">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-display font-bold text-lg text-white mb-1">
              {RESOURCE_CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h3>
            <p className="text-xs text-text-muted">Drag items to the canvas</p>
          </div>

          <div className="p-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted material-symbols-outlined text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {getFilteredResources().map(item => (
              <div 
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                className="group bg-surface hover:bg-surface-highlight border border-white/5 hover:border-white/20 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-1 relative shadow-sm hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-white/10 transition-colors shrink-0 overflow-hidden">
                      <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                      <span className="text-xs text-accent font-mono block">₱{item.cost.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-white/20 text-[18px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">drag_indicator</span>
                </div>
                <p className="text-[10px] text-text-muted line-clamp-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Canvas / Drop Zones */}
        <main className="flex-1 overflow-y-auto p-8 relative bg-gradient-to-br from-[#02040a] to-[#0f111a] flex gap-8">
          
          <div className="flex-1 max-w-4xl mx-auto space-y-8">
            
            {/* Guide Banner */}
            {showGuide && (
               <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-start gap-4 relative">
                  <div className="h-8 w-8 rounded-full bg-accent text-black flex items-center justify-center font-bold shrink-0">i</div>
                  <div>
                     <h4 className="font-bold text-white text-sm mb-1">Welcome to the Studio</h4>
                     <p className="text-xs text-text-muted leading-relaxed">
                        Start by filling out your <strong>Event Header</strong> below (Title, Date, Location). Then, <strong>drag and drop</strong> resources from the left sidebar into the "Core Package" or "Optional Add-ons" boxes to build your offer.
                     </p>
                  </div>
                  <button onClick={() => setShowGuide(false)} className="absolute top-2 right-2 text-white/30 hover:text-white transition-colors">
                     <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
               </div>
            )}

            {/* Event Header Editor Card */}
            <div className="relative h-[380px] rounded-[2.5rem] overflow-hidden group border border-white/10 shrink-0 shadow-2xl transition-all hover:border-white/20">
                <img src={coverImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80" alt="Event Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-black/40 to-transparent"></div>
                
                <button onClick={rotateCover} className="absolute top-6 right-6 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all z-20 border border-white/10 group/btn shadow-lg flex items-center gap-2">
                   <span className="material-symbols-outlined text-[18px]">image</span>
                   <span className="text-xs font-bold">Change Cover</span>
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-8 z-10 flex flex-col gap-4">
                   <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <div className="mb-4">
                         <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-1 block">Event Title</label>
                         <input 
                            type="text"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="Enter your event title..."
                            className="bg-transparent border-b border-white/20 p-0 pb-2 text-3xl md:text-4xl font-display font-bold text-white placeholder-white/20 focus:ring-0 focus:border-accent w-full leading-tight transition-colors"
                         />
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mb-4">
                         <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest mb-1 block">When</label>
                            <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/10 focus-within:border-accent transition-colors">
                               <span className="material-symbols-outlined text-white/70 text-[18px]">calendar_today</span>
                               <input 
                                  value={date}
                                  onChange={(e) => setDate(e.target.value)}
                                  placeholder="e.g. Oct 24, 9PM"
                                  className="bg-transparent border-none p-0 text-sm font-bold text-white placeholder-white/30 focus:ring-0 w-full"
                               />
                            </div>
                         </div>
                         <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest mb-1 block">Where</label>
                            <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/10 focus-within:border-accent transition-colors">
                               <span className="material-symbols-outlined text-white/70 text-[18px]">location_on</span>
                               <input 
                                  value={location}
                                  onChange={(e) => setLocation(e.target.value)}
                                  placeholder="e.g. BGC, Taguig"
                                  className="bg-transparent border-none p-0 text-sm font-bold text-white placeholder-white/30 focus:ring-0 w-full"
                               />
                            </div>
                         </div>
                      </div>

                      <div>
                         <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest mb-1 block">Description</label>
                         <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the vibe..."
                            className="bg-transparent border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 focus:ring-1 focus:ring-accent focus:border-accent w-full resize-none h-20 leading-relaxed hover:bg-white/5 transition-colors"
                         />
                      </div>
                   </div>
                </div>
            </div>

            {/* Drop Zone: Core Package */}
            <div 
              onDragOver={(e) => handleDragOver(e, 'base')}
              onDrop={(e) => handleDrop(e, 'base')}
              className={`min-h-[200px] rounded-[2rem] border-2 border-dashed transition-all p-8 relative ${
                isDragOver ? 'border-accent bg-accent/5' : 'border-white/10 bg-surface/30'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent">package_2</span> 
                    Core Package
                  </h3>
                  <p className="text-sm text-text-muted">Included in the base ticket price.</p>
                </div>
                <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold">{baseItems.length} Items</span>
              </div>

              {baseItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-text-muted pointer-events-none">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">add_circle_outline</span>
                  <p>Drop venues, talent, and core services here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {baseItems.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="bg-surface-highlight border border-white/5 rounded-2xl p-4 flex items-center justify-between group animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{item.name}</p>
                          <p className="text-xs text-text-muted">Cost: ₱{item.cost.toLocaleString()}</p>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id, 'base')} className="text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-400/10 p-2 rounded-full transition-all">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drop Zone: Upsells */}
            <div 
              onDragOver={(e) => handleDragOver(e, 'upsell')}
              onDrop={(e) => handleDrop(e, 'upsell')}
              className={`min-h-[150px] rounded-[2rem] border-2 border-dashed transition-all p-8 relative ${
                isDragOver ? 'border-secondary bg-secondary/5' : 'border-white/10 bg-surface/30'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">extension</span> 
                    Optional Add-ons
                  </h3>
                  <p className="text-sm text-text-muted">Available as paid upgrades for guests.</p>
                </div>
                <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold">{upsellItems.length} Items</span>
              </div>

              {upsellItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-text-muted pointer-events-none">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">monetization_on</span>
                  <p>Drop upsells and extra amenities here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upsellItems.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="bg-surface-highlight border border-white/5 rounded-2xl p-4 flex items-center justify-between group animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{item.name}</p>
                          <p className="text-xs text-text-muted">Cost: ₱{item.cost.toLocaleString()}</p>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id, 'upsell')} className="text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-400/10 p-2 rounded-full transition-all">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar: Blueprint Summary */}
        <aside className="w-96 flex-shrink-0 border-l border-white/5 bg-[#0f111a] flex flex-col shadow-2xl z-10">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-display font-bold text-white text-lg">Event Blueprint</h3>
            <p className="text-xs text-text-muted">Financial Overview</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Cost Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Cost Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Venue & Infrastructure</span>
                  <span className="text-white font-mono">₱{baseItems.filter(i => i.icon === 'location_city' || i.icon === 'warehouse' || i.icon === 'forest').reduce((a, b) => a + b.cost, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Talent & Entertainment</span>
                  <span className="text-white font-mono">₱{baseItems.filter(i => ['music_note', 'local_bar', 'movie_filter', 'mic'].includes(i.icon)).reduce((a, b) => a + b.cost, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Services & Ops</span>
                  <span className="text-white font-mono">₱{baseItems.filter(i => ['restaurant', 'security', 'local_parking', 'cleaning_services'].includes(i.icon)).reduce((a, b) => a + b.cost, 0).toLocaleString()}</span>
                </div>
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-white">Total Base Cost</span>
                  <span className="text-white font-mono">₱{baseCost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Pricing Strategy */}
            <div className="bg-surface-highlight rounded-2xl p-5 border border-white/5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-accent text-[16px]">price_check</span> Pricing Strategy
              </h4>
              
              <div className="mb-4">
                <label className="text-xs text-text-muted block mb-2">Target Margin (%)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={targetMargin} 
                    onChange={(e) => setTargetMargin(Number(e.target.value))}
                    className="flex-1 h-2 bg-black rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <span className="text-accent font-bold font-mono w-10 text-right">{targetMargin}%</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Suggested Price</span>
                  <span className="text-lg font-bold text-white font-mono">₱{suggestedPrice.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-text-muted italic">Per guest break-even at 1 pax (Simulated)</p>
              </div>
            </div>

            {/* Add-ons Potential */}
            {upsellItems.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Upsell Potential</h4>
                <div className="flex flex-wrap gap-2">
                  {upsellItems.map((item, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-secondary/10 border border-secondary/20 text-secondary text-xs">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/5 bg-[#0f111a]">
            <div className="flex items-center gap-3 mb-4">
               <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-black font-bold">
                  {Math.round(baseCost > 0 ? 85 : 10)}%
               </div>
               <div>
                  <p className="text-xs text-text-muted uppercase font-bold">Blueprint Health</p>
                  <div className="h-1.5 w-32 bg-white/10 rounded-full mt-1 overflow-hidden">
                     <div className={`h-full bg-accent rounded-full transition-all duration-500`} style={{ width: `${baseCost > 0 ? 85 : 10}%` }}></div>
                  </div>
               </div>
            </div>
            <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all text-sm font-bold text-white">
               Preview Listing
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EventCreationBuilder;
