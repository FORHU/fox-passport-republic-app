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
  // category may be string (label or slug) or a structured response from API
  category: string | { name?: string };
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

export const SCHEDULE_ITEMS: ScheduleItem[] = [];

export const INITIAL_EVENTS: EventItem[] = [];

export const INITIAL_VENUES: VenueItem[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_SERVICES: ServiceItem[] = [];

export const PENDING_REQUESTS: PendingRequest[] = [];

export const RECENT_ACTIVITY: ActivityItem[] = [];

export const KPI_DATA = [
  {
    id: "earnings",
    label: "Total Earnings",
    value: "₱0",
    trend: "0%",
    trendLabel: "from last month",
    icon: "video_camera_front",
    iconColor: "text-[#ccff00]",
    barColor: "bg-[#ccff00]",
    glowColor: "#ccff00",
    barWidth: "0%",
  },
  {
    id: "guests",
    label: "Guests & Attendees",
    value: "0",
    trend: "0%",
    trendLabel: "vs last month",
    icon: "groups",
    iconColor: "text-purple-500",
    barColor: "bg-purple-500",
    glowColor: "#a855f7",
    barWidth: "0%",
  },
  {
    id: "views",
    label: "Listing Views",
    value: "0",
    trend: "0%",
    trendLabel: "All listings",
    icon: "visibility",
    iconColor: "text-pink-500",
    barColor: "bg-pink-500",
    glowColor: "#ec4899",
    barWidth: "0%",
    trendType: "flat",
  },
  {
    id: "rating",
    label: "Overall Rating",
    value: "0.0",
    icon: "star",
    iconColor: "text-yellow-400",
    barColor: "bg-yellow-400",
    glowColor: "#facc15",
    barWidth: "0%",
    isRating: true,
  },
];

// Status options for different types
export const STATUS_OPTIONS = {
  event: ["Draft", "Published", "Ongoing", "Completed", "Cancelled"],
  venue: ["draft", "pending", "available", "rejected", "archived"],
  inventory: ["available", "reserved", "unavailable"],
  service: ["active", "paused", "unavailable"],
};

export type StatusType = "event" | "venue" | "inventory" | "service";
