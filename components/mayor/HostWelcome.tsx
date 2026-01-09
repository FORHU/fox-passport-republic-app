import React from 'react';
import { Button } from '@/components/ui/button';

interface HostWelcomeProps {
    handleLogout: () => void;
    openModal: () => void;
}

export const HostWelcome: React.FC<HostWelcomeProps> = ({ handleLogout, openModal }) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-12 reveal-on-scroll">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-accent/30 shadow-[0_0_15px_rgba(204,255,0,0.1)] mb-4">
                <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_#ccff00] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">Venue Live</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">
                Manage your <span className="text-gradient">Space.</span>
              </h1>
              <p className="text-text-muted">Overview of your venues and upcoming bookings.</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="px-6 py-3 rounded-full flex items-center gap-2"
              >
                <span className="material-symbols-outlined">logout</span> Logout
              </Button>
              <Button
                variant="neon"
                size="lg"
                onClick={openModal}
                className="px-8 py-3 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined">add_business</span> List New Venue
              </Button>
            </div>
          </div>
  );
};
