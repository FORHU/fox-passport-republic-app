'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RATING_BARS } from '@/data/venueDetailData';
import { getReviewsByListing, Review } from '@/lib/api/reviews';

interface VenueCalendarProps {
  checkInDate: number | null;
  checkOutDate: number | null;
  onDateClick: (day: number) => void;
  onClearDates: () => void;
}

export function VenueCalendar({
  checkInDate,
  checkOutDate,
  onDateClick,
  onClearDates,
}: VenueCalendarProps) {
  return (
    <div>
      <h3 className="text-2xl font-display font-bold text-white mb-2">
        Select check-in and check-out dates
      </h3>
      <p className="text-text-muted text-sm mb-6">Add your travel dates for exact pricing</p>
      <div className="bg-surface-highlight/30 rounded-2xl p-6 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-white">October 2024</span>
          <div className="flex gap-2">
            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-400 mb-2">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>
        <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-medium">
          <span className="p-2 text-white/20">29</span>
          <span className="p-2 text-white/20">30</span>
          {[...Array(31)].map((_, i) => {
            const day = i + 1;
            const isAvailable = day > 10;

            const isRangeStart = checkInDate === day;
            const isRangeEnd = checkOutDate === day;
            const isInRange =
              checkInDate !== null &&
              checkOutDate !== null &&
              day > checkInDate &&
              day < checkOutDate;
            const isSelected = isRangeStart || isRangeEnd;

            return (
              <div key={day} className="relative py-1" onClick={() => onDateClick(day)}>
                {(isInRange || isRangeStart || isRangeEnd) && checkInDate && checkOutDate && (
                  <div
                    className={`absolute inset-y-1 bg-accent/20 ${
                      isRangeStart
                        ? 'left-1/2 right-0 rounded-l-full'
                        : isRangeEnd
                        ? 'left-0 right-1/2 rounded-r-full'
                        : 'inset-x-0'
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 w-9 h-9 mx-auto flex items-center justify-center rounded-full transition-all ${
                    isSelected
                      ? 'bg-accent text-black font-bold shadow-[0_0_10px_#ccff00]'
                      : isAvailable
                      ? 'text-white hover:bg-white/10 cursor-pointer'
                      : 'text-white/30 line-through decoration-white/20'
                  }`}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClearDates}
            className="text-xs font-bold text-white underline decoration-white/30 hover:decoration-white transition-all"
          >
            Clear dates
          </button>
        </div>
      </div>
    </div>
  );
}

interface VenueReviewsProps {
  venueId: string;
  rating?: number;
  totalReviews?: number;
}

export function VenueReviews({ venueId, rating: fallbackRating = 0, totalReviews: fallbackTotal = 0 }: VenueReviewsProps) {
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['venue-reviews', venueId],
    queryFn: () => getReviewsByListing(venueId),
    enabled: !!venueId,
    staleTime: 1000 * 60 * 5,
  });

  const avgRating = reviews.length
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : fallbackRating;

  const displayTotal = reviews.length || fallbackTotal;
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? reviews : reviews.slice(0, 4);

  return (
    <div id="reviews">
      <div className="flex items-center gap-2 mb-8">
        <span className="material-symbols-outlined text-4xl text-white fill-current">star</span>
        <h2 className="text-5xl font-display font-bold text-white">{avgRating}</h2>
        <div className="flex flex-col justify-center h-full ml-4 pl-4 border-l border-white/10">
          <span className="text-lg font-bold text-white leading-none">Guest favorite</span>
          <p className="text-sm text-text-muted mt-1">
            {displayTotal} {displayTotal === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {/* Rating Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-10">
        {RATING_BARS.map((row) => (
          <div key={row.stars} className="flex items-center gap-3">
            <span className="text-sm font-bold text-white w-3">{row.stars}</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full shadow-[0_0_8px_rgba(204,255,0,0.5)]"
                style={{ width: row.count }}
              />
            </div>
            <span className="text-xs font-medium text-text-muted w-8 text-right">{row.count}</span>
          </div>
        ))}
      </div>

      {/* Review Cards */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-white/10 rounded" />
                  <div className="h-2 w-16 bg-white/5 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-white/5 rounded" />
                <div className="h-2 w-4/5 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">
          No reviews yet. Be the first to leave one!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {visible.map((review) => {
            const initials = (review.user?.name ?? 'A').charAt(0).toUpperCase();
            const date = new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            return (
              <div key={review.id} className="glass-panel p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  {review.user?.imgId ? (
                    <img src={review.user.imgId} className="w-10 h-10 rounded-full object-cover" alt={review.user.name} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                      {initials}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-white text-sm">{review.user?.name ?? 'Anonymous'}</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`material-symbols-outlined text-[12px] ${i < review.rating ? 'text-yellow-400' : 'text-white/20'}`}>star</span>
                      ))}
                      <span className="text-xs text-text-muted ml-1">{date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{review.comment}</p>
              </div>
            );
          })}
        </div>
      )}

      {reviews.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-8 px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors"
        >
          {showAll ? 'Show less' : `Show all ${displayTotal} reviews`}
        </button>
      )}
    </div>
  );
}

interface VenueMapProps {
  location: string;
  province: string;
}

export function VenueMap({ location, province }: VenueMapProps) {
  return (
    <div>
      <h3 className="text-2xl font-display font-bold text-white mb-2">Where you'll be</h3>
      <p className="text-text-muted text-sm mb-6">
        {location}, {province}
      </p>
      <div className="h-80 w-full rounded-2xl bg-[#1f2235] relative overflow-hidden flex items-center justify-center border border-white/10 group">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-50" />
        <div className="relative z-10 flex flex-col items-center gap-2 group-hover:-translate-y-2 transition-transform duration-300">
          <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
            <div className="h-4 w-4 bg-accent rounded-full shadow-[0_0_20px_#ccff00]" />
          </div>
          <span className="bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
            Exact location provided after booking
          </span>
        </div>
      </div>
    </div>
  );
}

interface HostBioProps {
  host: {
    name: string;
    avatar: string;
    reviews: number;
    description: string;
  };
}

export function HostBio({ host }: HostBioProps) {
  return (
    <div className="flex gap-6 items-start">
      <div className="relative shrink-0">
        <img
          src={host.avatar}
          className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
          alt="Host"
        />
        <div className="absolute -bottom-1 -right-1 bg-accent text-black rounded-full p-1 border-4 border-[#0f111a] shadow-sm flex items-center justify-center">
          <span className="material-symbols-outlined text-[14px]">verified</span>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Hosted by {host.name}</h3>
        <p className="text-text-muted text-sm mb-4">Joined May 2021</p>
        <div className="flex gap-4 text-sm text-white mb-4">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-accent">star</span>{' '}
            {host.reviews} Reviews
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-accent">verified</span>{' '}
            Identity Verified
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-accent">work</span> Super
            host
          </span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed mb-4">{host.description}</p>
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors">
            Contact Host
          </button>
        </div>
      </div>
    </div>
  );
}

export function HouseRules() {
  return (
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
  );
}
