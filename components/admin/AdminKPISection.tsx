import React from 'react';

interface AdminKPISectionProps {
  stats: {
    totalUsers: number;
    activeEvents: number;
    pendingApprovals?: number;
    totalRevenue?: number;
    totalBookings?: number;
  };
}

function fmt(n: number) {
  if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₱${(n / 1_000).toFixed(1)}K`;
  return `₱${n.toLocaleString()}`;
}

export const AdminKPISection: React.FC<AdminKPISectionProps> = ({ stats }) => {
  const revenue = stats.totalRevenue ?? 0;
  const pending = stats.pendingApprovals ?? 0;

  const cards = [
    {
      icon: 'groups',
      bg: 'bg-primary/20',
      iconColor: 'text-primary-glow',
      shadow: 'shadow-[0_0_15px_rgba(124,58,237,0.3)]',
      hoverBorder: 'hover:border-primary/50',
      bgIcon: 'text-primary',
      label: 'Total Citizens',
      value: stats.totalUsers.toLocaleString(),
      sub: 'registered users',
      trend: null,
    },
    {
      icon: 'local_activity',
      bg: 'bg-secondary/20',
      iconColor: 'text-secondary',
      shadow: 'shadow-[0_0_15px_rgba(219,39,119,0.3)]',
      hoverBorder: 'hover:border-secondary/50',
      bgIcon: 'text-secondary',
      label: 'Event Templates',
      value: stats.activeEvents.toLocaleString(),
      sub: 'published packages',
      trend: null,
    },
    {
      icon: 'account_balance_wallet',
      bg: 'bg-accent/20',
      iconColor: 'text-accent',
      shadow: 'shadow-[0_0_15px_rgba(204,255,0,0.3)]',
      hoverBorder: 'hover:border-accent/50',
      bgIcon: 'text-accent',
      label: 'Total Revenue',
      value: revenue === 0 ? '₱0' : fmt(revenue),
      sub: `${stats.totalBookings ?? 0} confirmed bookings`,
      trend: revenue > 0 ? 'positive' : null,
    },
    {
      icon: 'hourglass_top',
      bg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      hoverBorder: 'hover:border-blue-500/50',
      bgIcon: 'text-blue-500',
      label: 'Pending Approvals',
      value: pending.toLocaleString(),
      sub: 'role requests',
      trend: pending > 0 ? 'warning' : 'clear',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div key={i} className={`glass-card rounded-[2rem] p-6 relative overflow-hidden group ${card.hoverBorder} transition-all`}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className={`material-symbols-outlined text-[100px] ${card.bgIcon}`}>{card.icon}</span>
          </div>
          <div className="relative z-10">
            <div className={`h-12 w-12 rounded-2xl ${card.bg} flex items-center justify-center ${card.iconColor} mb-4 ${card.shadow}`}>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <p className="text-text-muted font-medium text-sm">{card.label}</p>
            <h3 className="text-4xl font-display font-bold text-white mt-1 group-hover:scale-105 origin-left transition-transform">
              {card.value}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-sm font-bold">
              {card.trend === 'positive' && (
                <>
                  <span className="material-symbols-outlined text-[16px] text-accent">trending_up</span>
                  <span className="text-accent">{card.sub}</span>
                </>
              )}
              {card.trend === 'warning' && (
                <>
                  <span className="material-symbols-outlined text-[16px] text-yellow-400">priority_high</span>
                  <span className="text-yellow-400">Action needed</span>
                </>
              )}
              {card.trend === 'clear' && (
                <>
                  <span className="material-symbols-outlined text-[16px] text-green-400">check_circle</span>
                  <span className="text-green-400">All clear</span>
                </>
              )}
              {card.trend === null && (
                <span className="text-white/30">{card.sub}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
