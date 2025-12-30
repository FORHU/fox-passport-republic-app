import { Booking, BookingStatus, StatData, CategoryData } from './types';

export const STATS: StatData[] = [
  { label: 'Total Revenue', value: '₱ 1,240,500', trend: 12, icon: 'payments', color: 'text-green-600 bg-green-50' },
  { label: 'Total Bookings', value: '3,450', trend: 5, icon: 'airplane_ticket', color: 'text-blue-600 bg-blue-50' },
  { label: 'Active Experiences', value: '124', trend: 2, icon: 'explore', color: 'text-purple-600 bg-purple-50' },
  { label: 'New Users', value: '89', trend: 0, icon: 'person_add', color: 'text-orange-600 bg-orange-50' },
];

export const CATEGORIES: CategoryData[] = [
  { name: 'Adventures', percentage: 35, color: 'bg-orange-400' },
  { name: 'Music & Events', percentage: 25, color: 'bg-blue-400' },
  { name: 'Camping', percentage: 20, color: 'bg-green-400' },
  { name: 'Food', percentage: 15, color: 'bg-red-400' },
  { name: 'Venues', percentage: 5, color: 'bg-purple-400' },
];

export const RECENT_BOOKINGS: Booking[] = [
  {
    id: '#BK-9821',
    customerName: 'Maria Santos',
    customerAvatar: 'https://i.pravatar.cc/100?u=maria',
    experience: 'Mt. Pulag Trek',
    category: 'Adventures',
    date: 'Dec 12, 2023',
    amount: 4500,
    status: BookingStatus.CONFIRMED
  },
  {
    id: '#BK-9820',
    customerName: 'John Cruz',
    customerAvatar: 'https://i.pravatar.cc/100?u=john',
    experience: 'Wanderland Festival',
    category: 'Music',
    date: 'Dec 12, 2023',
    amount: 8000,
    status: BookingStatus.PENDING
  },
  {
    id: '#BK-9819',
    customerName: 'Sarah Lee',
    customerAvatar: 'https://i.pravatar.cc/100?u=sarahlee',
    experience: 'Glamping by the Sea',
    category: 'Camping',
    date: 'Dec 11, 2023',
    amount: 6200,
    status: BookingStatus.CONFIRMED
  },
  {
    id: '#BK-9818',
    customerName: 'Mark Reyes',
    customerAvatar: 'https://i.pravatar.cc/100?u=markreyes',
    experience: 'Intramuros Food Walk',
    category: 'Food',
    date: 'Dec 11, 2023',
    amount: 1500,
    status: BookingStatus.CANCELLED
  },
  {
    id: '#BK-9817',
    customerName: 'Ana Garcia',
    customerAvatar: 'https://i.pravatar.cc/100?u=anagarcia',
    experience: 'Siargao Surf Camp',
    category: 'Adventures',
    date: 'Dec 10, 2023',
    amount: 12000,
    status: BookingStatus.CONFIRMED
  },
  {
    id: '#BK-9816',
    customerName: 'Rico Fernandez',
    customerAvatar: 'https://i.pravatar.cc/100?u=rico',
    experience: 'Baguio Pine Cabin',
    category: 'Camping',
    date: 'Dec 10, 2023',
    amount: 5500,
    status: BookingStatus.PENDING
  },
];

export const REVENUE_CHART_DATA = [
  { name: 'Nov 1', revenue: 400000 },
  { name: 'Nov 5', revenue: 850000 },
  { name: 'Nov 10', revenue: 600000 },
  { name: 'Nov 15', revenue: 750000 },
  { name: 'Nov 20', revenue: 450000 },
  { name: 'Nov 25', revenue: 1100000 },
  { name: 'Nov 30', revenue: 900000 },
];
