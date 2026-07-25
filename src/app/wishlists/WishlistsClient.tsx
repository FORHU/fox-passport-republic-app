'use client';

import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';
import { useFavorites } from '@/features/user/hooks/useFavorites';
import RequireAuth from '@/features/auth/components/RequireAuth';

export default function WishlistsClient() {
  const { favorites, toggleFavorite, isToggling } = useFavorites();

  const venueWishlists = favorites.filter(f => f.type === 'venue' && f.venue);
  const eventWishlists = favorites.filter(f => f.type === 'event' && f.event);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background text-white pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Your Wishlists</h1>
          <p className="text-white/50 mb-10">Venues and events you&apos;ve saved for later</p>

          {favorites.length === 0 ? (
            <div className="glass-panel rounded-3xl p-16 text-center border border-white/10">
              <Heart className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <h3 className="font-bold text-white text-lg mb-2">No saved places yet</h3>
              <p className="text-white/40 text-sm mb-6">
                Tap the heart icon on any venue or event to save it here.
              </p>
              <Link
                href="/categories"
                className="px-6 py-3 rounded-full bg-[#ccff00] text-black font-bold hover:bg-[#b8e600] transition-colors"
              >
                Browse Venues
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {venueWishlists.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-white mb-4">Saved Venues</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venueWishlists.map(fav => {
                      const venue = fav.venue!;
                      const imgUrl =
                        venue.images?.find(i => i.isPrimary)?.imageUrl ??
                        venue.images?.[0]?.url ??
                        venue.images?.[0]?.imageUrl ??
                        null;
                      return (
                        <div
                          key={fav.id}
                          className="glass-panel rounded-2xl overflow-hidden border border-white/10 group hover:border-white/30 transition-all"
                        >
                          <div className="relative h-48 bg-white/5">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={venue.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-white/10 text-5xl">apartment</span>
                              </div>
                            )}
                            <button
                              onClick={() => toggleFavorite(venue.id)}
                              disabled={isToggling}
                              aria-label="Remove from wishlists"
                              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-pink-500 hover:scale-110 transition-transform disabled:opacity-50"
                            >
                              <Heart className="w-5 h-5 fill-pink-500" />
                            </button>
                          </div>
                          <div className="p-4">
                            <Link href={`/venues/${venue.id}`}>
                              <h3 className="font-bold text-white group-hover:text-[#ccff00] transition-colors truncate">
                                {venue.name}
                              </h3>
                            </Link>
                            {(venue.city || venue.state) && (
                              <div className="flex items-center gap-1 text-white/40 text-xs mt-1">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {[venue.city, venue.state].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {eventWishlists.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-white mb-4">Saved Events</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eventWishlists.map(fav => (
                      <div
                        key={fav.id}
                        className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#ccff00]/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[#ccff00]">event</span>
                        </div>
                        <span className="font-medium text-white text-sm truncate">
                          {fav.event?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
