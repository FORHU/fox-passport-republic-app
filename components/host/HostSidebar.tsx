import Link from "next/link";
import React from "react";

const HostSidebar = () => {
  return (
    <div className="lg:col-span-4 space-y-8">
      <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent"></div>
        <div className="relative z-10 flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-white">Mayor Profile</h3>
          <span className="text-xs font-bold bg-secondary/20 text-secondary px-2 py-1 rounded">
            Elite Mayor
          </span>
        </div>
        <div className="relative z-10 space-y-3">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
            <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
              <span className="material-symbols-outlined text-[16px]">
                edit_square
              </span>
            </div>
            <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
              Edit Profile
            </span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
            <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
              <span className="material-symbols-outlined text-[16px]">
                credit_card
              </span>
            </div>
            <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
              Payout Settings
            </span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
            <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
              <span className="material-symbols-outlined text-[16px]">
                help
              </span>
            </div>
            <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
              Mayor Support
            </span>
          </button>
        </div>
      </div>
      <div className="glass-panel rounded-[2rem] p-6 border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-bold text-white">
            Pending Requests
          </h3>
          <button className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
            <span className="material-symbols-outlined text-[16px]">
              more_horiz
            </span>
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
            <img
              alt="User"
              className="h-10 w-10 rounded-full border border-white/10"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
            />
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p className="text-sm font-bold text-white truncate">
                  DJ Khalid
                </p>
                <span className="text-[10px] text-muted">10m ago</span>
              </div>
              <p className="text-xs text-muted truncate">
                Requesting <span className="text-accent">The Bunker</span> (Nov
                24)
              </p>
            </div>
            <div className="flex gap-1">
              <button className="h-7 w-7 rounded-full bg-white/10 hover:bg-green-500 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">
                  check
                </span>
              </button>
              <button className="h-7 w-7 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">
                  close
                </span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
            <img
              alt="User"
              className="h-10 w-10 rounded-full border border-white/10"
              src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop"
            />
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p className="text-sm font-bold text-white truncate">
                  Elena G.
                </p>
                <span className="text-[10px] text-muted">1h ago</span>
              </div>
              <p className="text-xs text-muted truncate">
                Requesting <span className="text-accent">Skyline Loft</span>{" "}
                (Dec 01)
              </p>
            </div>
            <div className="flex gap-1">
              <button className="h-7 w-7 rounded-full bg-white/10 hover:bg-green-500 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">
                  check
                </span>
              </button>
              <button className="h-7 w-7 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">
                  close
                </span>
              </button>
            </div>
          </div>
        </div>
        <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-xs font-bold text-white hover:bg-white hover:text-black transition-all uppercase tracking-widest">
          View All Requests
        </button>
      </div>
      <div className="bg-surface rounded-[2rem] p-6 border border-white/5">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-[20px]">
            event
          </span>
          November
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
          <span className="text-muted">M</span>
          <span className="text-muted">T</span>
          <span className="text-muted">W</span>
          <span className="text-muted">T</span>
          <span className="text-muted">F</span>
          <span className="text-muted">S</span>
          <span className="text-muted">S</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
          <span className="text-white/20 py-2">29</span>
          <span className="text-white/20 py-2">30</span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            1
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            2
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            3
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            4
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            5
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            6
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            7
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            8
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            9
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            10
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            11
          </span>
          <span className="bg-secondary text-white font-bold py-2 rounded-lg cursor-pointer shadow-[0_0_10px_rgba(219,39,119,0.5)]">
            12
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            13
          </span>
          <span className="text-white py-2 hover:bg-white/10 rounded-lg cursor-pointer">
            14
          </span>
        </div>
      </div>
    </div>
  );
};

export default HostSidebar;
