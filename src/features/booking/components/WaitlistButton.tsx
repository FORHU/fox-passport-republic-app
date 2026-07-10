'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWaitlistStatus, useJoinWaitlist, useLeaveWaitlist } from '@/features/booking/hooks/useWaitlist';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export interface WaitlistButtonProps {
  templateId: string;
  onJoined?: () => void;
}

export default function WaitlistButton({ templateId, onJoined }: WaitlistButtonProps) {
  const router = useRouter();
  const { isAuthenticated, openLogin } = useAuthStore();
  const { data, isLoading, isError, error } = useWaitlistStatus(templateId);
  const joinMutation = useJoinWaitlist();
  const leaveMutation = useLeaveWaitlist();

  const handleJoin = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    joinMutation.mutate(templateId, {
      onSuccess: () => {
        toast.success('You\'re on the waitlist!');
        onJoined?.();
        router.push('/booking/waitlist');
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Failed to join waitlist.');
      },
    });
  };

  const handleLeave = () => {
    if (!data?.entryId) return;
    leaveMutation.mutate(data.entryId, {
      onSuccess: () => {
        toast.success('Removed from waitlist.');
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Failed to leave waitlist.');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-center">
        <p className="text-sm text-red-400">
          {error instanceof Error ? error.message : 'Could not load waitlist status.'}
        </p>
      </div>
    );
  }

  if (data?.isOnWaitlist) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl bg-yellow-400/10 border border-yellow-400/20 p-4 text-center">
          <p className="text-sm font-bold text-yellow-400">
            You&apos;re #{data.position} on the waitlist
          </p>
          <p className="text-xs text-white/50 mt-1">
            {data.totalWaiting} {data.totalWaiting === 1 ? 'person is' : 'people are'} currently waiting
          </p>
        </div>
        <button
          onClick={handleLeave}
          disabled={leaveMutation.isPending}
          className="w-full rounded-xl border border-white/20 py-3 text-sm font-bold text-white hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          {leaveMutation.isPending ? 'Leaving...' : 'Leave Waitlist'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleJoin}
      disabled={joinMutation.isPending}
      className="w-full btn-neon group relative overflow-hidden rounded-xl bg-accent py-4 text-black font-bold text-lg shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {joinMutation.isPending ? (
          <>
            <span className="h-5 w-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
            Joining...
          </>
        ) : (
          <>
            Join Waitlist
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </>
        )}
      </span>
    </button>
  );
}
