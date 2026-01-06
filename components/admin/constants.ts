import { Booking, BookingStatus, StatData, CategoryData } from './types';

export const STATS: StatData[] = [
  { label: 'Total Revenue', value: '₱ 1,240,500', trend: 12, icon: 'payments', color: 'text-green-600 bg-green-50' },
  { label: 'Total Bookings', value: '3,450', trend: 5, icon: 'airplane_ticket', color: 'text-blue-600 bg-blue-50' },
  { label: 'Active Experiences', value: '124', trend: 2, icon: 'explore', color: 'text-purple-600 bg-purple-50' },
  { label: 'New Users', value: '89', trend: 0, icon: 'person_add', color: 'text-orange-600 bg-orange-50' },
];

export const CATEGORIES: CategoryData[] = [
  { name: 'Festivals & Fairs', percentage: 25, color: 'bg-orange-400' },
  { name: 'Live Performances', percentage: 20, color: 'bg-blue-400' },
  { name: 'Classes & Workshops', percentage: 18, color: 'bg-green-400' },
  { name: 'Tours & Excursions', percentage: 15, color: 'bg-purple-400' },
  { name: 'Parties & Socials', percentage: 12, color: 'bg-pink-400' },
  { name: 'Markets & Pop-Ups', percentage: 6, color: 'bg-yellow-400' },
  { name: 'Competitions & Games', percentage: 4, color: 'bg-red-400' },
];

export const RECENT_BOOKINGS: Booking[] = [
  {
    id: '#BK-9821',
    customerName: 'Maria Santos',
    customerAvatar: 'https://i.pravatar.cc/100?u=maria',
    experience: 'Wanderland Music Festival',
    category: 'Festivals & Fairs',
    date: 'Dec 12, 2023',
    amount: 4500,
    status: BookingStatus.CONFIRMED
  },
  {
    id: '#BK-9820',
    customerName: 'John Cruz',
    customerAvatar: 'https://i.pravatar.cc/100?u=john',
    experience: 'Manila Symphony Orchestra',
    category: 'Live Performances',
    date: 'Dec 12, 2023',
    amount: 8000,
    status: BookingStatus.PENDING
  },
  {
    id: '#BK-9819',
    customerName: 'Sarah Lee',
    customerAvatar: 'https://i.pravatar.cc/100?u=sarahlee',
    experience: 'Cooking Masterclass',
    category: 'Classes & Workshops',
    date: 'Dec 11, 2023',
    amount: 6200,
    status: BookingStatus.CONFIRMED
  },
  {
    id: '#BK-9818',
    customerName: 'Mark Reyes',
    customerAvatar: 'https://i.pravatar.cc/100?u=markreyes',
    experience: 'Intramuros Heritage Tour',
    category: 'Tours & Excursions',
    date: 'Dec 11, 2023',
    amount: 1500,
    status: BookingStatus.CANCELLED
  },
  {
    id: '#BK-9817',
    customerName: 'Ana Garcia',
    customerAvatar: 'https://i.pravatar.cc/100?u=anagarcia',
    experience: 'Networking Mixer',
    category: 'Parties & Socials',
    date: 'Dec 10, 2023',
    amount: 12000,
    status: BookingStatus.CONFIRMED
  },
  {
    id: '#BK-9816',
    customerName: 'Rico Fernandez',
    customerAvatar: 'https://i.pravatar.cc/100?u=rico',
    experience: 'Farmers Market Weekend',
    category: 'Markets & Pop-Ups',
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
