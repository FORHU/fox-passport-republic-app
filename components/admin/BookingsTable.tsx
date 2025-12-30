"use client";

import React from 'react';
import { RECENT_BOOKINGS } from './constants';
import { BookingStatus } from './types';

const StatusPill: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const styles = {
    [BookingStatus.CONFIRMED]: 'bg-green-50 text-green-700 border-green-100',
    [BookingStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-100',
    [BookingStatus.CANCELLED]: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]} flex items-center gap-1.5 w-fit`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === BookingStatus.CONFIRMED
            ? 'bg-green-500'
            : status === BookingStatus.PENDING
            ? 'bg-amber-500'
            : 'bg-rose-500'
        }`}
      ></span>
      {status}
    </span>
  );
};

const BookingsTable: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-50 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
          <p className="text-sm text-slate-500">
            Overview of the latest transactions.
          </p>
        </div>
        <button className="bg-pink-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-pink-600 transition-colors flex items-center gap-2 shadow-lg shadow-pink-500/20">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Manual Booking
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {RECENT_BOOKINGS.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                  {booking.id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.customerAvatar}
                      alt={booking.customerName}
                      className="w-8 h-8 rounded-full shadow-sm"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {booking.customerName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {booking.experience}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      booking.category === 'Adventures'
                        ? 'bg-orange-50 text-orange-600'
                        : booking.category === 'Music'
                        ? 'bg-blue-50 text-blue-600'
                        : booking.category === 'Camping'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {booking.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                  {booking.date}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                  ₱ {booking.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={booking.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    <span className="material-symbols-outlined text-[20px]">
                      more_vert
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50/30 text-center">
        <button className="text-sm font-bold text-pink-500 hover:underline">
          View All Bookings
        </button>
      </div>
    </div>
  );
};

export default BookingsTable;
