import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card';

export const FoxerAnalytics: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 reveal-on-scroll">
            {/* Revenue Chart Card */}
            <GlassCard variant="default" className="lg:col-span-2 p-6">
              <GlassCardHeader className="p-0 mb-6">
                <div className="flex items-center justify-between">
                  <GlassCardTitle>Revenue Overview</GlassCardTitle>
                  <select className="text-sm bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-white cursor-pointer">
                    <option className="bg-background">Last 7 days</option>
                    <option className="bg-background">Last 30 days</option>
                    <option className="bg-background">Last 3 months</option>
                  </select>
                </div>
              </GlassCardHeader>
              <GlassCardContent className="p-0">
                <div className="h-64 flex items-end justify-between gap-2">
                  {[40, 65, 45, 80, 55, 75, 90].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-linear-to-t from-accent to-accent/50 rounded-t-lg chart-bar"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-text-muted">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Quick Actions Card */}
            <GlassCard variant="default" className="p-6">
              <GlassCardHeader className="p-0 mb-6">
                <GlassCardTitle>Quick Actions</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="p-0">
                <div className="space-y-3">
                  {[
                    { icon: 'add_circle', label: 'Create Event', color: 'text-accent' },
                    { icon: 'group', label: 'View Attendees', color: 'text-primary' },
                    { icon: 'bar_chart', label: 'Analytics', color: 'text-secondary' },
                    { icon: 'settings', label: 'Settings', color: 'text-text-muted' },
                  ].map((action, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <span className={`material-symbols-outlined ${action.color} group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </span>
                      <span className="text-white font-medium">{action.label}</span>
                      <span className="material-symbols-outlined text-text-muted ml-auto">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
  );
};
