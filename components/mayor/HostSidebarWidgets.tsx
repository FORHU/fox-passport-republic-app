import React from 'react';

export const HostSidebarWidgets: React.FC = () => {
  return (
    <div className="lg:col-span-4 space-y-8">
                {/* Mayor Profile */}
                <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden reveal-on-scroll">
                  <div className="absolute inset-0 bg-linear-to-br from-secondary/10 to-transparent"></div>
                  <div className="relative z-10 flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold text-white">Mayor Profile</h3>
                    <span className="text-xs font-bold bg-secondary/20 text-secondary px-2 py-1 rounded">
                      Elite Mayor
                    </span>
                  </div>
                  <div className="relative z-10 space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                      <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit_square</span>
                      </div>
                      <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
                        Edit Profile
                      </span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                      <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
                        <span className="material-symbols-outlined text-[16px]">credit_card</span>
                      </div>
                      <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
                        Payout Settings
                      </span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                      <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors">
                        <span className="material-symbols-outlined text-[16px]">help</span>
                      </div>
                      <span className="text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
                        Mayor Support
                      </span>
                    </button>
                  </div>
                </div>

                {/* Quick Calendar */}
                <div className="bg-surface rounded-[2rem] p-6 border border-white/5 reveal-on-scroll">
                  <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent text-[20px]">event</span>
                    Quick Calendar
                  </h3>
                  <div className="text-center py-8">
                    <p className="text-text-muted text-sm">Calendar view coming soon</p>
                  </div>
                </div>
              </div>
  );
};
