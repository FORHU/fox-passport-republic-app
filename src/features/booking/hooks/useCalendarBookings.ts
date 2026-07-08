'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/lib/axios';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export interface CalendarBooking {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  type: 'event' | 'venue' | 'inventory' | 'service';
}

export interface MonthItem {
  id: string;
  title: string;
  startDay: number;
  endDay: number;
  type: CalendarBooking['type'];
}

export function getBgColor(type: CalendarBooking['type']): string {
  switch (type) {
    case 'event':     return 'bg-[#ccff00] text-black';
    case 'venue':     return 'bg-pink-500 text-white';
    case 'inventory': return 'bg-purple-500 text-white';
    case 'service':   return 'bg-orange-400 text-black';
  }
}

export function getDotColor(type: CalendarBooking['type']): string {
  switch (type) {
    case 'event':     return 'bg-green-400';
    case 'venue':     return 'bg-pink-500';
    case 'inventory': return 'bg-purple-500';
    case 'service':   return 'bg-orange-400';
  }
}

export function getIcon(type: CalendarBooking['type']): string {
  switch (type) {
    case 'event':     return 'event';
    case 'venue':     return 'apartment';
    case 'inventory': return 'inventory_2';
    case 'service':   return 'build';
  }
}

export function toMonthItems(bookings: CalendarBooking[], year: number, month: number): MonthItem[] {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
  const lastDay = new Date(year, month + 1, 0).getDate();

  return bookings
    .filter(b => b.startDate <= monthEnd && b.endDate >= monthStart)
    .map(b => ({
      id: b.id,
      title: b.title,
      startDay: b.startDate < monthStart ? 1 : b.startDate.getDate(),
      endDay: b.endDate > monthEnd ? lastDay : b.endDate.getDate(),
      type: b.type,
    }));
}

function extractList(resp: unknown): any[] {
  const body = (resp as { data?: unknown })?.data;
  const list = (body as any)?.data ?? (body as any)?.bookings ?? (body as any)?.items ?? body;
  return Array.isArray(list) ? list : [];
}

export function useCalendarBookings() {
  const user = useAuthStore(state => state.user);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setBookings([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setError(null);
    const results: CalendarBooking[] = [];

    // 1. User's own bookings (events/venues they booked as an attendee)
    try {
      const resp = await api.get(`/bookings/user/${user.id}`);
      for (const b of extractList(resp)) {
        const ev = b.event ?? b.eventTemplate ?? {};
        const start = ev.startDatetime ?? b.checkIn ?? b.startDatetime ?? b.startDate;
        if (!start) continue;
        results.push({
          id: `booking-${b.id}`,
          title: ev.name ?? ev.title ?? b.venue?.title ?? b.venue?.name ?? 'Booking',
          startDate: new Date(start),
          endDate: new Date(ev.endDatetime ?? b.checkOut ?? b.endDatetime ?? b.endDate ?? start),
          type: b.venue ? 'venue' : 'event',
        });
      }
    } catch {}

    // 2. Host: bookings on their venues
    try {
      const resp = await api.get('/bookings', { params: { hostId: user.id } });
      for (const b of extractList(resp)) {
        const start = b.checkIn ?? b.startDatetime ?? b.startDate;
        if (!start) continue;
        results.push({
          id: `venue-booking-${b.id}`,
          title: b.venue?.title ?? b.venue?.name ?? b.event?.name ?? 'Venue Booking',
          startDate: new Date(start),
          endDate: new Date(b.checkOut ?? b.endDatetime ?? b.endDate ?? start),
          type: 'venue',
        });
      }
    } catch {}

    // 3. Asset/equipment bookings
    try {
      const resp = await api.get('/asset/bookings', { params: { ownerId: user.id } });
      for (const b of extractList(resp)) {
        const start = b.startDate ?? b.startDatetime;
        if (!start) continue;
        results.push({
          id: `asset-${b.id}`,
          title: b.asset?.name ?? b.assetName ?? 'Equipment Rental',
          startDate: new Date(start),
          endDate: new Date(b.endDate ?? b.endDatetime ?? start),
          type: 'inventory',
        });
      }
    } catch {}

    // 4. Service bookings
    try {
      const resp = await api.get('/service/bookings', { params: { ownerId: user.id } });
      for (const b of extractList(resp)) {
        const start = b.startDate ?? b.startDatetime ?? b.scheduledDate;
        if (!start) continue;
        results.push({
          id: `service-${b.id}`,
          title: b.service?.name ?? b.serviceName ?? 'Service',
          startDate: new Date(start),
          endDate: new Date(b.endDate ?? b.endDatetime ?? start),
          type: 'service',
        });
      }
    } catch {}

    // 5. Creator's own scheduled event templates
    try {
      const resp = await api.get('/event-templates', { params: { ownerId: user.id } });
      const raw = resp?.data;
      const list = raw?.templates ?? raw?.data ?? raw;
      for (const ev of Array.isArray(list) ? list : []) {
        const start = ev.startDatetime ?? ev.startDate;
        if (!start) continue;
        // Avoid duplicates with booking-side events
        const alreadyAdded = results.some(r => r.id === `event-template-${ev.id}`);
        if (alreadyAdded) continue;
        results.push({
          id: `event-template-${ev.id}`,
          title: ev.name ?? ev.title ?? 'My Event',
          startDate: new Date(start),
          endDate: new Date(ev.endDatetime ?? ev.endDate ?? start),
          type: 'event',
        });
      }
    } catch {}

    setBookings(results);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  return { bookings, isLoading, error, refetch: load };
}
