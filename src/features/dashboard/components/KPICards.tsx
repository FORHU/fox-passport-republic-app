'use client';

import React from 'react';
import { KPI_DATA } from '@/features/dashboard/data/dashboardData';

interface KPIStats {
  totalRevenue?: number;
  totalBookings?: number;
  rating?: number;
}

interface KPICardsProps {
  stats?: KPIStats;
  isLoading?: boolean;
}

export function KPICards({ stats, isLoading }: KPICardsProps = {}) {
  const resolvedData = KPI_DATA.map((kpi) => {
    if (kpi.id === 'earnings' && stats?.totalRevenue !== undefined) {
      const val = stats.totalRevenue;
      return { ...kpi, value: isLoading ? '…' : `₱${val.toLocaleString()}`, barWidth: val > 0 ? '60%' : '0%', trendType: val > 0 ? 'up' : 'flat' };
    }
    if (kpi.id === 'guests' && stats?.totalBookings !== undefined) {
      const val = stats.totalBookings;
      return { ...kpi, value: isLoading ? '…' : String(val), barWidth: val > 0 ? '50%' : '0%', trendType: val > 0 ? 'up' : 'flat' };
    }
    if (kpi.id === 'rating' && stats?.rating !== undefined) {
      return { ...kpi, value: isLoading ? '…' : stats.rating.toFixed(1), isRating: stats.rating === 0 };
    }
    return kpi;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {resolvedData.map((kpi) => (
        <div
          key={kpi.id}
          className="bg-[#0f111a]/80 backdrop-blur border border-white/5 rounded-3xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <span className={`material-symbols-outlined text-5xl ${kpi.iconColor}`}>{kpi.icon}</span>
          </div>
          <p className="text-white/50 text-sm mb-1">{kpi.label}</p>
          <h3 className="text-3xl font-display font-bold mb-3">{kpi.value}</h3>

          {kpi.isRating ? (
            <div className="flex items-center gap-1 text-xs text-white/30">
              <span className="material-symbols-outlined text-[16px]">star_border</span>
              <span>No reviews yet</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`${
                  kpi.trendType === 'flat' ? 'bg-pink-500/20 text-pink-400' : 'bg-green-500/20 text-green-400'
                } px-2 py-1 rounded-md font-bold flex items-center gap-1`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {kpi.trendType === 'flat' ? 'trending_flat' : 'trending_up'}
                </span>
                {kpi.trend}
              </span>
              <span className="text-white/40">{kpi.trendLabel}</span>
            </div>
          )}

          <div
            className={`absolute bottom-0 left-0 h-1 ${kpi.barColor}`}
            style={{ width: kpi.barWidth, boxShadow: `0 0 15px ${kpi.glowColor}` }}
          />
        </div>
      ))}
    </div>
  );
}
