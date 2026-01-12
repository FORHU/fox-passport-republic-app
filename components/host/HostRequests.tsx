import Image from "next/image";
import React from "react";

const HostRequests = () => {
  return (
      <div className="glass-panel rounded-[2rem] p-6 border border-white/5 h-full flex-1 flex flex-col">
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
            <Image
              alt="User"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-white/10"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
            />
            <div className="grow min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p className="text-sm font-bold text-white truncate">
                  DJ Khalid
                </p>
                <span className="text-[10px] text-white/60">10m ago</span>
              </div>
              <p className="text-xs text-white/60 truncate">
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
            <Image
              alt="User"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-white/10"
              src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&auto=format&fit=crop"
            />
            <div className="grow min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p className="text-sm font-bold text-white truncate">
                  Elena G.
                </p>
                <span className="text-[10px] text-white/60">1h ago</span>
              </div>
              <p className="text-xs text-white/60 truncate">
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
  );
};

export default HostRequests;
