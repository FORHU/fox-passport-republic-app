export interface ServiceCategoryItem {
  id: string;
  label: string;
  icon: string;
}

export const SERVICE_CATEGORIES: ServiceCategoryItem[] = [
  { id: "planning", label: "Planning", icon: "event_note" },
  { id: "decoration", label: "Decoration", icon: "brush" },
  { id: "catering", label: "Catering", icon: "restaurant" },
  { id: "photography", label: "Photography", icon: "camera_alt" },
  { id: "videography", label: "Videography", icon: "videocam" },
  { id: "entertainment", label: "Entertainment", icon: "music_note" },
  { id: "coordination", label: "Coordination", icon: "groups" },
  { id: "other", label: "Other", icon: "more_horiz" },
];

export const SERVICE_STATUSES = ["active", "paused", "unavailable"] as const;
export const SERVICE_UNITS = [
  "Per Hour",
  "Per Day",
  "Per Week",
  "Per Month",
  "Per Year",
  "One Time",
  "Other",
] as const;

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];
export type ServiceUnit = (typeof SERVICE_UNITS)[number];

// Maps UI display labels to the backend BillingRate enum values
export const BILLING_RATE_MAP: Record<ServiceUnit, string> = {
  "Per Hour": "hourly",
  "Per Day": "daily",
  "Per Week": "weekly",
  "Per Month": "monthly",
  "Per Year": "yearly",
  "One Time": "one_time",
  "Other": "other",
};
