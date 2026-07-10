'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserWaitlist, useWaitlistNotification, useLeaveWaitlist, useClaimSpot } from '@/features/booking/hooks/useWaitlist';
import { toast } from 'sonner';

export default function WaitlistPageClient() {
  const router = useRouter();
  const { data: entries, isLoading, isError, error } = useUserWaitlist();
  const { data: notification } = useWaitlistNotification();
  const leaveMutation = useLeaveWaitlist();
  const claimSpotMutation = useClaimSpot();

  const handleLeave = (entryId: string) => {
    leaveMutation.mutate(entryId, {
      onSuccess: () => {
        toast.success('Removed from waitlist.');
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Failed to leave waitlist.');
      },
    });
  };

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body relative overflow-x-hidden">
      <main className="grow pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Notification Banner */}
          {notification?.hasSpotOpened && (
            <div className="mb-8 rounded-2xl bg-green-500/10 border border-green-500/30 p-6 text-center">
              <span className="material-symbols-outlined text-green-400 text-4xl mb-2">celebration</span>
              <h2 className="text-xl font-display font-bold text-white mb-1">A spot just opened up!</h2>
              <p className="text-text-muted mb-4">
                You&apos;re next in line for <strong className="text-white">{notification.templateName}</strong>.
                Claim your spot before someone else does.
              </p>
              <button
                onClick={() => {
                  claimSpotMutation.mutate(
                    { templateId: notification.templateId, entryId: notification.entryId },
                    {
                      onSuccess: () => {
                        toast.success('Spot claimed! Complete your booking.');
                        router.push(`/booking/config?templateId=${notification.templateId}&claimed=1`);
                      },
                      onError: (err: any) => {
                        toast.error(err?.response?.data?.message || 'Spot already taken by someone else.');
                      },
                    },
                  );
                }}
                disabled={claimSpotMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-black font-bold hover:brightness-110 transition-all disabled:opacity-60"
              >
                {claimSpotMutation.isPending ? (
                  <><span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" /> Claiming...</>
                ) : (
                  <><span className="material-symbols-outlined">celebration</span> Claim Your Spot</>
                )}
              </button>
              <p className="text-[10px] text-white/30 mt-3">This offer expires soon — first come, first served.</p>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-accent font-semibold">My Waitlist</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">My Waitlist</h1>
            <p className="text-text-muted">
              {entries && entries.length > 0
                ? `You're on the waitlist for ${entries.length} ${entries.length === 1 ? 'event' : 'events'}.`
                : 'Events you join the waitlist for will appear here.'}
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center">
              <p className="text-red-400">
                {error instanceof Error ? error.message : 'Could not load waitlist.'}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && entries && entries.length === 0 && (
            <div className="glass-card rounded-[2rem] p-12 border border-white/10 text-center">
              <span className="material-symbols-outlined text-white/20 text-6xl mb-4">hourglass_empty</span>
              <h3 className="text-xl font-display font-bold text-white mb-2">No waitlist entries</h3>
              <p className="text-text-muted mb-6 max-w-md mx-auto">
                When an event you want to attend is at capacity, join the waitlist and you&apos;ll be notified when a spot opens up.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-black font-bold hover:brightness-110 transition-all"
              >
                Browse Events
                <span className="material-symbols-outlined">explore</span>
              </Link>
            </div>
          )}

          {/* Waitlist entries */}
          {!isLoading && !isError && entries && entries.length > 0 && (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="glass-card rounded-[2rem] overflow-hidden border border-white/10"
                >
                  <div className="flex flex-col sm:flex-row">
                    {entry.template.image && (
                      <div className="sm:w-48 h-32 sm:h-auto shrink-0">
                        <img
                          src={entry.template.image}
                          alt={entry.template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase tracking-widest text-accent font-bold">
                          {entry.template.category}
                        </span>
                        <h3 className="text-lg font-display font-bold text-white mt-1 truncate">
                          {entry.template.name}
                        </h3>
                        <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {entry.template.location}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-2xl font-display font-bold text-yellow-400">
                              #{entry.position}
                            </span>
                            <span className="text-xs text-text-muted">
                              of {entry.totalWaiting} waiting
                            </span>
                          </div>
                          <div className="text-xs text-white/40">
                            {entry.template.currentAttendees}/{entry.template.maxAttendees} booked
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => router.push(`/booking/config?templateId=${entry.templateId}`)}
                          className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/5 transition-colors"
                        >
                          View Event
                        </button>
                        <button
                          onClick={() => handleLeave(entry.id)}
                          disabled={leaveMutation.isPending}
                          className="rounded-xl border border-red-400/30 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          {leaveMutation.isPending ? 'Leaving...' : 'Leave'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
