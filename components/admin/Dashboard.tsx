"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCardProps, Booking, ModerationEvent } from './types';

// Stats Data
const STATS: StatCardProps[] = [
  { label: 'Total Bookings', value: '2,847', trend: '+12.5%', icon: 'confirmation_number', iconBg: 'bg-pink-100', iconColor: 'text-pink-500' },
  { label: 'Active Users', value: '18,392', trend: '+8.2%', icon: 'group', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-500' },
  { label: 'Revenue', value: '$124,580', trend: '+23.1%', icon: 'payments', iconBg: 'bg-violet-100', iconColor: 'text-violet-500' },
  { label: 'Experiences', value: '342', trend: '+5.7%', icon: 'explore', iconBg: 'bg-amber-100', iconColor: 'text-amber-500' },
];

// Revenue Chart Data
const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
  { name: 'Jul', value: 7000 },
];

// Category Data
const categoryData = [
  { name: 'Festivals & Fairs', value: 85, color: 'bg-pink-500' },
  { name: 'Live Performances', value: 72, color: 'bg-emerald-500' },
  { name: 'Classes & Workshops', value: 68, color: 'bg-violet-500' },
  { name: 'Tours & Excursions', value: 54, color: 'bg-amber-500' },
];

// Event Moderation Data
const moderationEvents: ModerationEvent[] = [
  { id: '1', name: 'Wanderland Music Festival', location: 'Manila, PH', organizer: 'Sarah Chen', organizerAvatar: 'https://i.pravatar.cc/100?u=sarah', category: 'Festivals & Fairs', submittedAt: '2 hours ago', status: 'Reviewing', icon: 'celebration', iconColor: 'text-emerald-500', iconBg: 'bg-emerald-100' },
  { id: '2', name: 'Manila Symphony Concert', location: 'CCP, Manila', organizer: 'Marcus Rivera', organizerAvatar: 'https://i.pravatar.cc/100?u=marcus', category: 'Live Performances', submittedAt: '4 hours ago', status: 'Pending', icon: 'music_note', iconColor: 'text-violet-500', iconBg: 'bg-violet-100' },
  { id: '3', name: 'Cooking Masterclass', location: 'Makati, PH', organizer: 'Chef Antonio', organizerAvatar: 'https://i.pravatar.cc/100?u=antonio', category: 'Classes & Workshops', submittedAt: '6 hours ago', status: 'Approved', icon: 'school', iconColor: 'text-amber-500', iconBg: 'bg-amber-100' },
  { id: '4', name: 'Intramuros Heritage Walk', location: 'Manila, PH', organizer: 'Jake Thompson', organizerAvatar: 'https://i.pravatar.cc/100?u=jake', category: 'Tours & Excursions', submittedAt: '8 hours ago', status: 'Reviewing', icon: 'hiking', iconColor: 'text-pink-500', iconBg: 'bg-pink-100' },
];

// Recent Bookings Data
const recentBookings: Booking[] = [
  { id: 'BK001', customer: 'Emma Wilson', experience: 'Wanderland Music Festival', category: 'Festivals & Fairs', date: 'Dec 28, 2024', amount: '$189', status: 'Confirmed', avatar: 'https://i.pravatar.cc/100?u=emma' },
  { id: 'BK002', customer: 'James Liu', experience: 'Broadway Musical Night', category: 'Live Performances', date: 'Dec 27, 2024', amount: '$245', status: 'Pending', avatar: 'https://i.pravatar.cc/100?u=james' },
  { id: 'BK003', customer: 'Sofia Martinez', experience: 'Pottery Workshop', category: 'Classes & Workshops', date: 'Dec 27, 2024', amount: '$75', status: 'Confirmed', avatar: 'https://i.pravatar.cc/100?u=sofia' },
  { id: 'BK004', customer: 'David Kim', experience: 'Heritage City Tour', category: 'Tours & Excursions', date: 'Dec 26, 2024', amount: '$120', status: 'Cancelled', avatar: 'https://i.pravatar.cc/100?u=david' },
];

// Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </div>
      {trend && (
        <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
    </div>
  </div>
);

// Revenue Chart Component
const RevenueChart: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Revenue Overview</h3>
        <p className="text-sm text-slate-400">Monthly revenue trends</p>
      </div>
      <button className="text-sm text-pink-500 font-semibold hover:text-pink-600">View Report</button>
    </div>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={revenueData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Area type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Category Chart Component
const CategoryChart: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Top Categories</h3>
        <p className="text-sm text-slate-400">By booking volume</p>
      </div>
    </div>
    <div className="space-y-4">
      {categoryData.map((cat) => (
        <div key={cat.name}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-600">{cat.name}</span>
            <span className="font-semibold text-slate-800">{cat.value}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${cat.color} rounded-full transition-all duration-500`} style={{ width: `${cat.value}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Event Moderation Table Component
const EventModerationTable: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div className="p-6 border-b border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Event Moderation Queue</h3>
          <p className="text-sm text-slate-400">Review and approve new experience submissions</p>
        </div>
        <button className="text-sm text-pink-500 font-semibold hover:text-pink-600 flex items-center gap-1">
          View All <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Experience</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Organizer</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Category</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Submitted</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {moderationEvents.map((event) => (
            <tr key={event.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${event.iconBg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-lg ${event.iconColor}`}>{event.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{event.name}</p>
                    <p className="text-sm text-slate-400">{event.location}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <img src={event.organizerAvatar} alt={event.organizer} className="w-8 h-8 rounded-full" />
                  <span className="text-sm font-medium text-slate-600">{event.organizer}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-slate-600">{event.category}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-400">{event.submittedAt}</span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  event.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  event.status === 'Reviewing' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {event.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-500 transition-colors" title="Approve">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Reject">
                    <span className="material-symbols-outlined text-lg">cancel</span>
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors" title="View Details">
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

// Recent Bookings Table Component
const RecentBookingsTable: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div className="p-6 border-b border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Recent Bookings</h3>
          <p className="text-sm text-slate-400">Latest customer reservations</p>
        </div>
        <button className="text-sm text-pink-500 font-semibold hover:text-pink-600 flex items-center gap-1">
          View All <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Customer</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Experience</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Date</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Amount</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {recentBookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img src={booking.avatar} alt={booking.customer} className="w-9 h-9 rounded-full" />
                  <div>
                    <p className="font-semibold text-slate-800">{booking.customer}</p>
                    <p className="text-xs text-slate-400">{booking.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-slate-600">{booking.experience}</p>
                  <p className="text-xs text-slate-400">{booking.category}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-600">{booking.date}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-semibold text-slate-800">{booking.amount}</span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                  booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {booking.status}
                </span>
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

      {/* Recent Bookings Table */}
      <RecentBookingsTable />
    </div>
  );
};

export default Dashboard;
