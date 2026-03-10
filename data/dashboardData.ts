// Host Dashboard Data Constants

export interface ScheduleItem {
  id: number | string;
  title: string;
  startDay: number;
  endDay: number;
  type: "event" | "venue" | "inventory" | "service";
  color: string;
}

export interface EventItem {
  id: number | string;
  title: string;
  date: string;
  loc: string;
  type: string;
  status: string;
  booked: number | null;
  capacity: number | null;
  revenue: string | null;
  img: string;
}

export interface VenueItem {
  id: number | string;
  title: string;
  type: string;
  loc: string;
  cap: string;
  status: string;
  bookings: string | null;
  revenue: string | null;
  img: string;
}

export interface InventoryItem {
  id: number | string;
  name: string;
  cat: string;
  status: string;
  img: string;
}

export interface ServiceItem {
  id: number | string;
  name: string;
  price: string;
  status: string;
  icon: string;
  color: string;
}

export interface PendingRequest {
  id: number | string;
  name: string;
  avatar: string;
  request: string;
  time: string;
}

export interface ActivityItem {
  id: number | string;
  type: "booking" | "venue" | "inventory";
  title: string;
  description: string;
  time: string;
}

export const SCHEDULE_ITEMS: ScheduleItem[] = [
  {
    id: 1,
    title: "Neon Nights",
    startDay: 3,
    endDay: 3,
    type: "event",
    color: "bg-green-500",
  },
  {
    id: 2,
    title: "Bean & Leaf",
    startDay: 15,
    endDay: 15,
    type: "event",
    color: "bg-green-500",
  },
  {
    id: 3,
    title: "The Bunker",
    startDay: 12,
    endDay: 14,
    type: "venue",
    color: "bg-pink-500",
  },
  {
    id: 4,
    title: "CDJ Rental",
    startDay: 18,
    endDay: 18,
    type: "inventory",
    color: "bg-purple-500",
  },
  {
    id: 5,
    title: "Skyline Reno",
    startDay: 20,
    endDay: 25,
    type: "venue",
    color: "bg-pink-500",
  },
  {
    id: 6,
    title: "Photoshoot",
    startDay: 28,
    endDay: 28,
    type: "inventory",
    color: "bg-purple-500",
  },
];

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 1,
    title: "Neon Nights: Retro Wave Party",
    date: "Tomorrow, 9PM",
    loc: "Makati",
    type: "NIGHTLIFE",
    status: "Ongoing",
    booked: 85,
    capacity: 100,
    revenue: "₱127.5k",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U",
  },
  {
    id: 2,
    title: "Bean & Leaf Pop-up Cafe",
    date: "Oct 15, 10AM",
    loc: "QC",
    type: "WORKSHOP",
    status: "Draft",
    booked: null,
    capacity: null,
    revenue: null,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_LY_Y9MjrpTWy_NJTJIRwk76sZnsaIdsxuUIfYq_pNLi5QstkgJmV2mZg_qFfJnhOtNJ9OWN1f9482wc5qJ1VX2x7t932Q2CfhUv4qoGznn5mNqoNlggeX46L5F8wFGk46ZivWa7VCxRqJRCs_EkknPCF6QDvTdpuAwdLudXP-kP13gUd5Bw6nonOKZfwI199-TukQ0_hWH2KVljytpXdvlFEk3Q_GnkMqwagAAuvX3PvUOTmbUOWnt7P-40VvqyHkoe_HuyhMQg",
  },
];

export const INITIAL_VENUES: VenueItem[] = [
  {
    id: 1,
    title: "The Underground Bunker",
    type: "NIGHTCLUB",
    loc: "Makati City",
    cap: "200 Cap",
    status: "Published",
    bookings: "12 this week",
    revenue: "₱150k",
    img: "https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=2072",
  },
  {
    id: 2,
    title: "Skyline Loft Studio",
    type: "STUDIO",
    loc: "BGC",
    cap: "50 Cap",
    status: "Suspended",
    bookings: null,
    revenue: null,
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    name: "Pioneer CDJ-3000",
    cat: "AUDIO",
    status: "Rented",
    img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400",
  },
  {
    id: 2,
    name: "Neon Sign Set",
    cat: "DECOR",
    status: "Available",
    img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=400",
  },
  {
    id: 3,
    name: "Fog Machine",
    cat: "FX",
    status: "Available",
    img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400",
  },
  {
    id: 4,
    name: "4K Projector",
    cat: "VISUALS",
    status: "Maintenance",
    img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400",
  },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 1,
    name: "Event Curation & Planning",
    price: "₱15,000+",
    status: "Active",
    icon: "edit_note",
    color: "text-accent bg-accent/20",
  },
  {
    id: 2,
    name: "Venue Styling",
    price: "₱8,000+",
    status: "Active",
    icon: "palette",
    color: "text-pink-400 bg-pink-500/20",
  },
  {
    id: 3,
    name: "Live DJ Set",
    price: "₱10,000/hr",
    status: "Paused",
    icon: "music_note",
    color: "text-gray-400 bg-white/10",
  },
];

export const PENDING_REQUESTS: PendingRequest[] = [
  {
    id: 1,
    name: "DJ Khalid",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100",
    request: "The Bunker",
    time: "10m ago",
  },
  {
    id: 2,
    name: "Elena G.",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100",
    request: "Skyline Loft",
    time: "1h ago",
  },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: 1,
    type: "booking",
    title: "New Booking",
    description: "Sarah J. booked Neon Nights",
    time: "2m ago",
  },
  {
    id: 2,
    type: "venue",
    title: "Venue Request",
    description: "DJ Khalid requested The Bunker",
    time: "15m ago",
  },
  {
    id: 3,
    type: "inventory",
    title: "Item Rented",
    description: "Pioneer CDJ-3000 set rented out",
    time: "1h ago",
  },
];

export const OCCUPANCY_DATA = [
  { d: "M", h: 48 },
  { d: "T", h: 72 },
  { d: "W", h: 64 },
  { d: "T", h: 112 },
  { d: "F", h: 144, a: true },
  { d: "S", h: 152, a: true },
  { d: "S", h: 96 },
];

export const KPI_DATA = [
  {
    id: "earnings",
    label: "Total Earnings",
    value: "₱426,500",
    trend: "+15%",
    trendLabel: "Events & Rentals",
    icon: "video_camera_front",
    iconColor: "text-[#ccff00]",
    barColor: "bg-[#ccff00]",
    glowColor: "#ccff00",
    barWidth: "70%",
  },
  {
    id: "guests",
    label: "Guests & Attendees",
    value: "2,094",
    trend: "+8.2%",
    trendLabel: "vs last month",
    icon: "groups",
    iconColor: "text-purple-500",
    barColor: "bg-purple-500",
    glowColor: "#a855f7",
    barWidth: "60%",
  },
  {
    id: "views",
    label: "Listing Views",
    value: "16.7k",
    trend: "1.2%",
    trendLabel: "All listings",
    icon: "visibility",
    iconColor: "text-pink-500",
    barColor: "bg-pink-500",
    glowColor: "#ec4899",
    barWidth: "85%",
    trendType: "flat",
  },
  {
    id: "rating",
    label: "Overall Rating",
    value: "4.9",
    icon: "star",
    iconColor: "text-yellow-400",
    barColor: "bg-yellow-400",
    glowColor: "#facc15",
    barWidth: "98%",
    isRating: true,
  },
];

// Status options for different types
export const STATUS_OPTIONS = {
  event: ["Draft", "Published", "Ongoing", "Completed", "Cancelled"],
  venue: ["Draft", "Pending Review", "Published", "Suspended", "Archived"],
  inventory: ["Available", "Rented", "Maintenance", "Lost"],
  service: ["Active", "Paused", "Discontinued"],
};

export type StatusType = "event" | "venue" | "inventory" | "service";
