import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

export const FoxerBookingsTable: React.FC = () => {
  return (
    <GlassCard variant="default" className="p-6 reveal-on-scroll">
            <GlassCardHeader className="p-0 mb-6">
              <div className="flex items-center justify-between">
                <GlassCardTitle>Recent Bookings</GlassCardTitle>
                <Button variant="ghost" size="sm">
                  View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Button>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-bold text-text-muted">Event</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-text-muted">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-text-muted">Attendees</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-text-muted">Revenue</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { event: 'Sunset Rooftop Party', date: 'Nov 15, 2024', attendees: 45, revenue: '₱22,500', status: 'confirmed' },
                      { event: 'Tech Mixer & Networking', date: 'Nov 18, 2024', attendees: 80, revenue: '₱40,000', status: 'confirmed' },
                      { event: 'Art Gallery Opening', date: 'Nov 22, 2024', attendees: 32, revenue: '₱16,000', status: 'pending' },
                    ].map((booking, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-white font-medium">{booking.event}</td>
                        <td className="py-4 px-4 text-text-muted">{booking.date}</td>
                        <td className="py-4 px-4 text-white">{booking.attendees}</td>
                        <td className="py-4 px-4 text-white font-bold">{booking.revenue}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              booking.status === 'confirmed'
                                ? 'bg-success/20 text-success'
                                : 'bg-warning/20 text-warning'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCardContent>
          </GlassCard>
  );
};
