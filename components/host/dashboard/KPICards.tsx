'use client';

import React from 'react';
import { KPI_DATA } from '@/data/dashboardData';

export function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {KPI_DATA.map((kpi) => (
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
            <div className="flex items-center gap-1 text-xs text-yellow-400">
              {[...Array(4)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[16px]">star</span>
              ))}
              <span className="material-symbols-outlined text-[16px]">star_half</span>
              <span className="text-white/40 ml-1">(209 reviews)</span>
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
