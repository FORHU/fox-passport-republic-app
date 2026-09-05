export const PATH_SHORT: Record<string, string> = {
  user: "Citizen",
  eventFoxer: "Event",
  venueFoxer: "Venue",
  gearFoxer: "Gear",
  serviceFoxer: "Service",
};

export const PATH_COLORS: Record<string, string> = {
  user: "#ccff00",
  eventFoxer: "#3b82f6",
  venueFoxer: "#a855f7",
  gearFoxer: "#f97316",
  serviceFoxer: "#22c55e",
};

// Frontend mirror of API PERK_THRESHOLDS — level at which each perk unlocks per path
export const PATH_PERKS: Record<string, { level: number; perk: string }[]> = {
  user: [
    { level: 1, perk: "early_bird" },
    { level: 5, perk: "priority_access" },
    { level: 10, perk: "vip_lounge" },
    { level: 15, perk: "founding_citizen" },
  ],
  eventFoxer: [
    { level: 1, perk: "host_support" },
    { level: 5, perk: "analytics_pro" },
    { level: 10, perk: "featured_listing" },
    { level: 15, perk: "event_boost" },
  ],
  venueFoxer: [
    { level: 1, perk: "venue_authority" },
    { level: 3, perk: "city_badge" },
    { level: 8, perk: "venue_spotlight" },
    { level: 15, perk: "mayor_verified" },
  ],
  gearFoxer: [
    { level: 1, perk: "gear_verified" },
    { level: 3, perk: "lower_fees" },
    { level: 8, perk: "gear_featured" },
  ],
  serviceFoxer: [
    { level: 1, perk: "service_verified" },
    { level: 3, perk: "service_lower_fees" },
    { level: 8, perk: "service_featured" },
  ],
};

// Perk key → display metadata
export const PERK_META: Record<
  string,
  { title: string; desc: string; icon: string }
> = {
  early_bird: {
    title: "Early Bird",
    desc: "Book events 24h before others",
    icon: "schedule",
  },
  priority_access: {
    title: "Priority Access",
    desc: "Skip the line at partner venues",
    icon: "confirmation_number",
  },
  vip_lounge: {
    title: "VIP Lounge",
    desc: "Access to exclusive event areas",
    icon: "diamond",
  },
  founding_citizen: {
    title: "Founding Citizen",
    desc: "OG member recognition",
    icon: "workspace_premium",
  },
  host_support: {
    title: "Creator Support",
    desc: "24/7 dedicated event manager",
    icon: "support_agent",
  },
  analytics_pro: {
    title: "Analytics Pro",
    desc: "Advanced heatmaps for your venues",
    icon: "analytics",
  },
  featured_listing: {
    title: "Featured Listing",
    desc: "Priority placement in search results",
    icon: "featured_play_list",
  },
  event_boost: {
    title: "Event Boost",
    desc: "Promoted visibility for your events",
    icon: "rocket_launch",
  },
  venue_authority: {
    title: "Venue Authority",
    desc: "Priority venue listing approvals",
    icon: "assured_workload",
  },
  city_badge: {
    title: "City Badge",
    desc: "Verified Venue Foxer status in your city",
    icon: "account_balance",
  },
  venue_spotlight: {
    title: "Venue Spotlight",
    desc: "Top placement in venue listings",
    icon: "auto_awesome",
  },
  mayor_verified: {
    title: "Venue Verified",
    desc: "Highest tier venue authority",
    icon: "verified_user",
  },
  gear_verified: {
    title: "Gear Verified",
    desc: "Exclusive gear provider status",
    icon: "verified",
  },
  lower_fees: {
    title: "Lower Fees",
    desc: "5% lower commission on bookings",
    icon: "percent",
  },
  gear_featured: {
    title: "Gear Featured",
    desc: "Priority in equipment listings",
    icon: "star",
  },
  service_verified: {
    title: "Service Verified",
    desc: "Exclusive service provider status",
    icon: "verified",
  },
  service_lower_fees: {
    title: "Lower Fees",
    desc: "5% lower commission on bookings",
    icon: "percent",
  },
  service_featured: {
    title: "Service Featured",
    desc: "Priority in service listings",
    icon: "star",
  },
};
