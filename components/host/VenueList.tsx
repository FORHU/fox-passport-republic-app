import Image from "next/image";
import Link from "next/link";
import React from "react";

interface VenueListProps {
  className?: string;
}

const VenueList: React.FC<VenueListProps> = ({ className = '' }) => {
  return (
    <section className={`flex flex-col h-full ${className}`}>
      {/* Wrap everything in a single glass card container */}
      <div className="glass-card rounded-[2rem] p-6 flex flex-col h-full border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-accent animate-spin-slow text-[20px]">
              storefront
            </span>
            My Venues
          </h2>
          <Link
            className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
            href="#"
          >
            View all
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Venue Card 1 - GREEN LEFT BORDER */}
          <div className="glass-panel p-4 rounded-2xl hover:bg-white/5 transition-all group relative overflow-hidden flex-1 flex flex-col justify-center" style={{ borderLeft: '4px solid #22c55e' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-[40px] pointer-events-none"></div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-32 aspect-video sm:aspect-square rounded-xl overflow-hidden shrink-0">
                <Image
                  alt="Venue"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=2072&auto=format&fit=crop"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-bold text-white uppercase border border-white/10 z-10">
                  Nightclub
                </div>
              </div>
              <div className="flex-grow flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">
                        The Underground Bunker
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            location_on
                          </span>
                          Makati City
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            groups
                          </span>
                          200 Cap
                        </span>
                      </div>
                    </div>
                    {/* GREEN ACTIVE BADGE */}
                    <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e] text-black text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-black/30"></span>
                      Active
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-2">
                  <div>
                    <div className="text-[9px] text-text-muted uppercase tracking-wider">
                      Bookings
                    </div>
                    <div className="text-xs font-bold text-white">
                      12 <span className="text-text-muted font-normal">this week</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-text-muted uppercase tracking-wider">
                      Revenue
                    </div>
                    <div className="text-xs font-bold text-white">₱150k</div>
                  </div>
                  <div className="flex justify-end items-end gap-2">
                    <button
                      className="h-7 w-7 rounded-full bg-white/5 hover:bg-white hover:text-black flex items-center justify-center transition-all"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        edit
                      </span>
                    </button>
                    <button
                      className="h-7 w-7 rounded-full bg-white/5 hover:bg-accent hover:text-black flex items-center justify-center transition-all"
                      title="Analytics"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        bar_chart
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Venue Card 2 - YELLOW LEFT BORDER */}
          <div className="glass-panel p-4 rounded-2xl hover:bg-white/5 transition-all group relative overflow-hidden flex-1 flex flex-col justify-center" style={{ borderLeft: '4px solid #eab308' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-[40px] pointer-events-none"></div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-32 aspect-video sm:aspect-square rounded-xl overflow-hidden shrink-0">
                <Image
                  alt="Venue"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-bold text-white uppercase border border-white/10 z-10">
                  Studio
                </div>
              </div>
              <div className="flex-grow flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-warning transition-colors">
                        Skyline Loft Studio
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            location_on
                          </span>
                          BGC
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            groups
                          </span>
                          50 Cap
                        </span>
                      </div>
                    </div>
                    {/* YELLOW MAINTENANCE BADGE */}
                    <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eab308] text-black text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-black/30"></span>
                      Maintenance
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center border-t border-white/5 pt-2">
                  <div className="flex items-center gap-2 text-warning">
                    <span className="material-symbols-outlined text-[16px]">
                      engineering
                    </span>
                    <span className="text-xs font-medium">
                      Renovation in progress
                    </span>
                  </div>
                  <div className="flex justify-end items-end gap-2">
                    {/* YELLOW MANAGE STATUS BUTTON */}
                    <button className="px-4 py-1.5 rounded-full bg-[#eab308] text-black text-xs font-bold transition-all hover:shadow-[0_0_15px_#eab308]">
                      Manage Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VenueList;
