export interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export enum BookingStatus {
  CONFIRMED = "Confirmed",
  PENDING = "Pending",
  CANCELLED = "Cancelled",
}

export interface Booking {
  id: string;
  customerName: string;
  customerAvatar: string;
  experience: string;
  category: string;
  date: string;
  amount: number;
  status: BookingStatus;
}

export interface ModerationEvent {
  id: string;
  name: string;
  location: string;
  organizer: string;
  organizerAvatar: string;
  category: string;
  submittedAt: string;
  status: "Reviewing" | "Pending" | "Approved";
  icon: string;
  iconColor: string;
  iconBg: string;
}

export interface StatData {
  label: string;
  value: string;
  trend: number;
  icon: string;
  color: string;
}

export interface CategoryData {
  name: string;
  percentage: number;
  color: string;
}
