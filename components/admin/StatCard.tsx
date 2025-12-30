"use client";

import React from 'react';
import { StatData } from './types';

const StatCard: React.FC<StatData> = ({ label, value, trend, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${color}`}>
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        {trend > 0 && (
          <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            {trend}%
          </div>
        )}
        {trend === 0 && (
          <div className="text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded-full">
            Today
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
