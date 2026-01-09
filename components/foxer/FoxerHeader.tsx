import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUIStore } from '@/store/useUIStore';

// Note: Active tab state might need to be moved to a store or passed as props if it controls page content
// For now, assuming standard navigation behavior or local page state is fine, 
// but if the header controls the page view, we should use the store.
// The original page used standard navigation for links and local state for 'overview' vs 'analytics'.
// We will receive activeTab and setActiveTab as props or use the store.

interface FoxerHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FoxerHeader: React.FC<FoxerHeaderProps> = ({ activeTab, setActiveTab }) => {
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
                  Foxer Studio
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'text-black bg-accent hover:shadow-[0_0_15px_rgba(204,255,0,0.5)]'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Dashboard
              </button>
              <Link href="/foxer" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all">
                Events
              </Link>
              <Link href="/foxer/listings" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all">
                Listings
              </Link>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'analytics'
                    ? 'text-white bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Analytics
              </button>
            </nav>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 transition-all relative">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-secondary shadow-[0_0_8px_#db2777] animate-pulse"></span>
              </button>
              <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white">Alex Chen</div>
                  <div className="text-xs text-text-muted">Pro Foxer</div>
                </div>
                <img
                  alt="User"
                  className="h-10 w-10 rounded-full border-2 border-accent object-cover cursor-pointer hover:scale-110 transition-transform"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop"
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
