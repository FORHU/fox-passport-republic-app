import React from 'react';

interface Stats {
    totalRevenue: string | number;
    totalVenues: number;
    activeListings: number;
    averageRating: number;
}

interface HostStatsProps {
    stats: Stats;
}

export const HostStats: React.FC<HostStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 reveal-on-scroll">
            {/* Space Rental Income */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-accent">payments</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Total Revenue</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">₱{stats.totalRevenue.toLocaleString()}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-success/20 text-success px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> +18%
                  </span>
                  <span className="text-white/40">vs last month</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-accent w-[70%] shadow-[0_0_10px_#ccff00]"></div>
            </div>

            {/* Total Venues */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">business</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Total Venues</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">{stats.totalVenues}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/40">{stats.activeListings} active listings</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-primary w-[55%] shadow-[0_0_10px_#7c3aed]"></div>
            </div>

            {/* Active Listings */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-secondary">visibility</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Active Listings</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">{stats.activeListings}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-secondary/20 text-secondary px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">trending_flat</span> 1.5%
                  </span>
                  <span className="text-white/40">vs last month</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-secondary w-[85%] shadow-[0_0_10px_#db2777]"></div>
            </div>

            {/* Average Rating */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-warning">star</span>
              </div>
              <div className="relative z-10">
                <p className="text-text-muted text-sm font-medium mb-1">Mayor Rating</p>
                <h3 className="text-3xl font-display font-bold text-white mb-2">
                  {stats.averageRating.toFixed(1)}
                </h3>
                <div className="flex items-center gap-1 text-xs text-warning">
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-warning w-[98%] shadow-[0_0_10px_#eab308]"></div>
            </div>
          </div>
  );
};
