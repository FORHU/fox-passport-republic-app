"use client";

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { REVENUE_CHART_DATA, CATEGORIES } from './constants';

export const RevenueChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-50 shadow-sm col-span-1 lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Revenue Trends</h3>
          <p className="text-sm text-slate-500">Last 30 Days</p>
        </div>
        <div className="text-2xl font-bold text-slate-900">₱ 1.2M</div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={REVENUE_CHART_DATA}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
              cursor={{
                stroke: '#ec4899',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
              formatter={(value: number) => [`₱ ${value.toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ec4899"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const CategoryChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-50 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">
        Bookings by Category
      </h3>
      <div className="space-y-5">
        {CATEGORIES.map((cat) => (
          <div key={cat.name} className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-500">
                <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                {cat.name}
              </span>
              <span className="font-bold text-slate-900">{cat.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${cat.color} transition-all duration-1000 ease-out`}
                style={{ width: `${cat.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
