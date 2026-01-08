"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCardProps, Booking, ModerationEvent } from './types';
import { KPICard } from '@/components/ui/kpi-card';

// Stats Data
const STATS: StatCardProps[] = [
  { label: 'Total Citizens', value: '24.5k', trend: '+12.5%', icon: 'group', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { label: 'Active Events', value: '1,204', trend: '+8.2%', icon: 'celebration', iconBg: 'bg-accent/10', iconColor: 'text-accent' },
  { label: 'Total Revenue', value: '₱3.2M', trend: '+23.1%', icon: 'payments', iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
  { label: 'Pending Approval', value: '45', trend: '+5.7%', icon: 'pending_actions', iconBg: 'bg-warning/10', iconColor: 'text-warning' },
];

// Revenue Chart Data (7 days)
const revenueData = [
  { day: 'Mon', revenue: 12500 },
  { day: 'Tue', revenue: 18200 },
  { day: 'Wed', revenue: 15800 },
  { day: 'Thu', revenue: 21400 },
  { day: 'Fri', revenue: 25600 },
  { day: 'Sat', revenue: 32100 },
  { day: 'Sun', revenue: 28900 },
];

// Category Data
const categoryData = [
  { name: 'Festivals & Fairs', value: 85, color: 'bg-primary' },
  { name: 'Live Performances', value: 72, color: 'bg-secondary' },
  { name: 'Classes & Workshops', value: 68, color: 'bg-accent' },
  { name: 'Tours & Excursions', value: 54, color: 'bg-success' },
];

// Event Moderation Data
const moderationEvents: ModerationEvent[] = [
  { id: '1', name: 'Wanderland Music Festival', location: 'Manila, PH', organizer: 'Sarah Chen', organizerAvatar: 'https://i.pravatar.cc/100?u=sarah', category: 'Festivals & Fairs', submittedAt: '2 hours ago', status: 'Reviewing', icon: 'celebration', iconColor: 'text-success', iconBg: 'bg-success/10' },
  { id: '2', name: 'Manila Symphony Concert', location: 'CCP, Manila', organizer: 'Marcus Rivera', organizerAvatar: 'https://i.pravatar.cc/100?u=marcus', category: 'Live Performances', submittedAt: '4 hours ago', status: 'Pending', icon: 'music_note', iconColor: 'text-primary', iconBg: 'bg-primary/10' },
  { id: '3', name: 'Cooking Masterclass', location: 'Makati, PH', organizer: 'Chef Antonio', organizerAvatar: 'https://i.pravatar.cc/100?u=antonio', category: 'Classes & Workshops', submittedAt: '6 hours ago', status: 'Approved', icon: 'school', iconColor: 'text-accent', iconBg: 'bg-accent/10' },
  { id: '4', name: 'Intramuros Heritage Walk', location: 'Manila, PH', organizer: 'Jake Thompson', organizerAvatar: 'https://i.pravatar.cc/100?u=jake', category: 'Tours & Excursions', submittedAt: '8 hours ago', status: 'Reviewing', icon: 'hiking', iconColor: 'text-secondary', iconBg: 'bg-secondary/10' },
];

// Recent Bookings Data
const recentBookings: Booking[] = [
  { id: 'BK001', customer: 'Emma Wilson', experience: 'Wanderland Music Festival', category: 'Festivals & Fairs', date: 'Dec 28, 2024', amount: '$189', status: 'Confirmed', avatar: 'https://i.pravatar.cc/100?u=emma' },
  { id: 'BK002', customer: 'James Liu', experience: 'Broadway Musical Night', category: 'Live Performances', date: 'Dec 27, 2024', amount: '$245', status: 'Pending', avatar: 'https://i.pravatar.cc/100?u=james' },
  { id: 'BK003', customer: 'Sofia Martinez', experience: 'Pottery Workshop', category: 'Classes & Workshops', date: 'Dec 27, 2024', amount: '$75', status: 'Confirmed', avatar: 'https://i.pravatar.cc/100?u=sofia' },
  { id: 'BK004', customer: 'David Kim', experience: 'Heritage City Tour', category: 'Tours & Excursions', date: 'Dec 26, 2024', amount: '$120', status: 'Cancelled', avatar: 'https://i.pravatar.cc/100?u=david' },
];

// Stat Card Component - Using KPICard
const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon, iconBg, iconColor }) => (
  <KPICard
    title={label}
    value={value}
    icon={icon}
    iconColor={iconColor}
    trend={trend ? {
      value: trend,
      direction: trend.startsWith('+') ? 'up' : 'down'
    } : undefined}
  />
);

// Revenue Chart Component
const RevenueChart: React.FC = () => (
  <div className="glass-card rounded-3xl p-6 border border-white/5 lg:col-span-2">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-display font-bold text-white">Revenue Trends</h3>
        <p className="text-sm text-text-muted">Last 7 days</p>
      </div>
      <button className="text-sm text-accent font-semibold hover:text-accent/80 transition-colors">View Report</button>
    </div>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueData}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ccff00" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#ccff00" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={12} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 17, 26, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#fff',
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Category Chart Component
const CategoryChart: React.FC = () => (
  <div className="glass-card rounded-3xl p-6 border border-white/5">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-display font-bold text-white">Popular Categories</h3>
        <p className="text-sm text-text-muted">By booking volume</p>
      </div>
    </div>
    <div className="space-y-5">
      {categoryData.map((cat) => (
        <div key={cat.name}>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-white">{cat.name}</span>
            <span className="font-semibold text-accent">{cat.value}%</span>
          </div>
          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full ${cat.color} rounded-full transition-all duration-700 shadow-glow`}
              style={{ width: `${cat.value}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Event Moderation Table Component
const EventModerationTable: React.FC = () => (
  <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
    <div className="p-6 border-b border-white/5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display font-bold text-white">Recent Event Submissions</h3>
          <p className="text-sm text-text-muted">Review and approve new experience submissions</p>
        </div>
        <button className="text-sm text-accent font-semibold hover:text-accent/80 transition-colors flex items-center gap-1">
          View All <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Experience</th>
            <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Organizer</th>
            <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Category</th>
            <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Submitted</th>
            <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Status</th>
            <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {moderationEvents.map((event) => (
            <tr key={event.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${event.iconBg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-lg ${event.iconColor}`}>{event.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{event.name}</p>
                    <p className="text-sm text-text-muted">{event.location}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <img src={event.organizerAvatar} alt={event.organizer} className="w-8 h-8 rounded-full" />
                  <span className="text-sm font-medium text-white">{event.organizer}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-text-muted">{event.category}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-text-muted">{event.submittedAt}</span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  event.status === 'Approved' ? 'bg-success/20 text-success' :
                  event.status === 'Reviewing' ? 'bg-warning/20 text-warning' :
                  'bg-white/10 text-text-muted'
                }`}>
                  {event.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-2 hover:bg-success/10 rounded-lg text-success transition-colors" title="Approve">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </button>
                  <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors" title="Reject">
                    <span className="material-symbols-outlined text-lg">cancel</span>
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg text-text-muted transition-colors" title="View Details">
                    <span className="material-symbols-outlined text-lg">visibility</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);


// Main Dashboard Component
const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart />
        <CategoryChart />
      </div>

      {/* Event Moderation Table */}
      <EventModerationTable />
    </div>
  );
};

export default Dashboard;
