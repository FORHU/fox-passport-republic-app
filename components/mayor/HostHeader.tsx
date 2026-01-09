import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HostHeaderProps {
    userName: string;
}

export const HostHeader: React.FC<HostHeaderProps> = ({ userName }) => {
  return (
    <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer relative">
              <div className="flex h-12 w-12 items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                <Image 
                  src="/foxonlylogo.png" 
                  alt="FoxPassport Logo" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col relative">
                <h2 className="text-xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">
                  FoxPassport
                </h2>
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                  Mayor Studio
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <Link
                href="/host"
                className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all"
              >
                Dashboard
              </Link>
              <Link
                href="/host/venues"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Venues
              </Link>
              <Link
                href="/host/calendar"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Calendar
              </Link>
              <Link
                href="/host/earnings"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Earnings
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 transition-all relative">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-secondary shadow-[0_0_8px_#db2777] animate-pulse"></span>
              </button>
              <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white">{userName}</div>
                  <div className="text-xs text-text-muted">Venue Mayor</div>
                </div>
                <img
                  alt="User"
                  className="h-10 w-10 rounded-full border-2 border-accent object-cover cursor-pointer hover:scale-110 transition-transform"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
                />
              </div>
              <button className="flex sm:hidden h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>
  );
};
