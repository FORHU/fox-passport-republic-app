import React from 'react';
import { RATING_BARS, MOCK_REVIEWS } from '@/data/venueDetailData';

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
  rating: number;
  totalReviews: number;
}

export function VenueReviews({ rating, totalReviews }: VenueReviewsProps) {
  return (
    <div id="reviews">
      <div className="flex items-center gap-2 mb-8">
        <span className="material-symbols-outlined text-4xl text-white fill-current">star</span>
        <h2 className="text-5xl font-display font-bold text-white">{rating}</h2>
        <div className="flex flex-col justify-center h-full ml-4 pl-4 border-l border-white/10">
          <span className="text-lg font-bold text-white leading-none">Guest favorite</span>
          <p className="text-sm text-text-muted mt-1">
            One of the most loved homes on FoxPassport
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
      <div className="grid md:grid-cols-2 gap-6">
        {MOCK_REVIEWS.map((review, i) => (
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
        Show all {totalReviews} reviews
      </button>
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
