'use client';

import React, { useState } from 'react';
import { ArrowLeft, Star, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSubmitReview } from '@/features/review/hooks/useSubmitReview';

interface WriteReviewClientProps {
  booking: any;
}

export default function WriteReviewClient({ booking }: WriteReviewClientProps) {
  const router = useRouter();
  const submitReview = useSubmitReview();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const eventName = booking.event?.name || booking.venueName || 'Venue Booking';
  const targetId = booking.venueId || booking.event?.venueId || booking.targetId || '';
  const targetType = booking.targetType || 'venue';
  const startDate = booking.startAt
    ? new Date(booking.startAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const isValid = rating > 0 && comment.trim().length >= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitReview.isPending) return;

    submitReview.mutate({
      bookingId: booking.id,
      rating,
      comment: comment.trim(),
      targetId,
      targetType,
    });
  };

  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main antialiased flex flex-col selection:bg-accent selection:text-black font-body">
      {/* Header */}
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h2 className="text-2xl font-display font-bold tracking-tight text-white">Write a Review</h2>
            <div className="h-10 w-10" />
          </div>
        </div>
      </header>

      <main className="grow pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Booking Info Card */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 mb-8">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-accent text-2xl">apartment</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-display font-bold text-white mb-1">{eventName}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                  {startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {startDate}
                    </span>
                  )}
                  {booking.guestCount && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">group</span>
                      {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5">
            {/* Star Rating */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4">
                How would you rate your experience?
              </h2>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 md:w-12 md:h-12 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-text-muted mt-2">
                  {rating} star{rating !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="h-px bg-white/10 w-full mb-8" />

            {/* Review Text */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-3">
                Share your experience
              </h2>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience at this venue..."
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-colors"
                required
                minLength={30}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-text-muted">
                  {comment.length} character{comment.length !== 1 ? 's' : ''}
                  {comment.trim().length > 0 && comment.trim().length < 30 && (
                    <span className="text-orange-400"> (minimum 30 required)</span>
                  )}
                </p>
                {comment.trim().length >= 10 && (
                  <span className="text-xs text-green-400">✓ Good length</span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || submitReview.isPending}
              className="w-full md:w-auto px-10 py-4 rounded-xl bg-accent text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
            >
              {submitReview.isPending ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
