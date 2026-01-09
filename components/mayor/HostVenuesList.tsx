import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HostVenuesListProps {
  totalVenues: number;
    openModal: () => void;
}

export const HostVenuesList: React.FC<HostVenuesListProps> = ({ totalVenues, openModal }) => {
    if (totalVenues === 0) {
        return (
            <div className="glass-card rounded-3xl p-12 border border-white/5 text-center reveal-on-scroll">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 border border-accent/30 mb-6 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                  <span className="material-symbols-outlined text-accent text-5xl">add_business</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">No venues yet</h3>
                <p className="text-text-muted mb-8 leading-relaxed">
                  Start by listing your first venue. Share your space with foxers and event planners!
                </p>
                <Button
                  variant="neon"
                  size="lg"
                  onClick={openModal}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-105 transition-transform"
                >
                  <span className="material-symbols-outlined">add_business</span>
                  List Your First Venue
                </Button>
              </div>
            </div>
        )
    }

  return (
    <div className="lg:col-span-8 space-y-8">
                <section className="reveal-on-scroll">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent animate-spin-slow">storefront</span> My
                      Venues
                    </h2>
                    <Link
                      href="/host/venues"
                      className="text-sm text-text-muted hover:text-white transition-colors flex items-center gap-1"
                    >
                      View all <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {/* Sample Venue Card - Replace with actual venue data */}
                    <div className="glass-panel p-4 rounded-3xl hover:bg-white/5 transition-all group border-l-4 border-l-success relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-2xl pointer-events-none"></div>
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="relative w-full sm:w-40 aspect-video sm:aspect-square rounded-2xl overflow-hidden shrink-0">
                          <img
                            alt="Venue"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            src="https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=2072&auto=format&fit=crop"
                          />
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase border border-white/10">
                            Featured
                          </div>
                        </div>
                        <div className="grow flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                                  Your Venue Name
                                </h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">location_on</span>{" "}
                                    Location
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">groups</span> Capacity
                                  </span>
                                </div>
                              </div>
                              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> Active
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
                            <div>
                              <div className="text-[10px] text-text-muted uppercase tracking-wider">Bookings</div>
                              <div className="text-sm font-bold text-white">
                                -- <span className="text-text-muted font-normal">this week</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-text-muted uppercase tracking-wider">Revenue</div>
                              <div className="text-sm font-bold text-white">₱--</div>
                            </div>
                            <div className="flex justify-end items-end gap-2">
                              <button
                                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white hover:text-black flex items-center justify-center transition-all"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button
                                className="h-8 w-8 rounded-full bg-white/5 hover:bg-accent hover:text-black flex items-center justify-center transition-all"
                                title="Analytics"
                              >
                                <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
  );
};
