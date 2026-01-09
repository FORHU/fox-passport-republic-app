import React from 'react';
import { Button } from '@/components/ui/button';
import { useCreateListingModal } from '@/hooks/events/useCreateListingModal';

export const FoxerWelcome: React.FC = () => {
    const { onOpen } = useCreateListingModal();

  return (
    <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-12 reveal-on-scroll">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-accent/30 shadow-[0_0_15px_rgba(204,255,0,0.1)] mb-4">
                <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_#ccff00] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">
                  System Online
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">
                Welcome back, <span className="text-gradient">Alex!</span>
              </h1>
              <p className="text-text-muted">Here&apos;s what&apos;s happening with your events today.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="rounded-full">
                <span className="material-symbols-outlined">calendar_month</span> Calendar
              </Button>
              <Button
                variant="neon"
                size="lg"
                onClick={onOpen}
                className="rounded-full shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined">add_circle</span> Create New Event
              </Button>
            </div>
          </div>
  );
};
