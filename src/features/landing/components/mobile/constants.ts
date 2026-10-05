export const STRIPE_BG = `repeating-linear-gradient(135deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px)`;

export const CATEGORIES = [
  "Wedding",
  "Corporate",
  "Birthday",
  "Social",
  "Other",
];

export const CATEGORY_EMOJI: Record<string, string> = {
  birthday: "🎂",
  wedding: "💍",
  corporate: "🏢",
  social: "🎉",
  other: "✨",
};

export const ROLE_LABELS: Record<string, string> = {
  eventFoxer: "Event Foxer",
  venueFoxer: "Venue Foxer",
  gearFoxer: "Equipment Foxer",
  serviceFoxer: "Talent Foxer",
};

// Shortcuts into each kind of listing. These were three made-up listings
// ("The Grand Ballroom · Makati · ₱12,000/hr"…) that went nowhere.
export const FEATURE_CARDS = [
  {
    accent: "#7c3aed",
    tag: "Venues",
    tagBg: "rgba(124,58,237,0.3)",
    tagColor: "#c4b5fd",
    name: "Find a venue",
    meta: "Halls, rooftops and studios on the map",
    href: "/venues/map",
  },
  {
    accent: "#db2777",
    tag: "Events",
    tagBg: "rgba(219,39,119,0.3)",
    tagColor: "#f9a8d4",
    name: "Book an event",
    meta: "Ready-made experiences to customize",
    href: "/search?type=event_template",
  },
  {
    accent: "#ccff00",
    tag: "Gear",
    tagBg: "rgba(204,255,0,0.15)",
    tagColor: "#ccff00",
    name: "Rent gear",
    meta: "Sound, lights and staging",
    href: "/search?type=gear",
  },
];

export const FEATURES = [
  {
    icon: "check_circle",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.15)",
    title: "Verified Vibes Only",
    desc: "Every foxer and venue is verified so you can book with zero stress.",
  },
  {
    icon: "bolt",
    color: "var(--accent-text)",
    bg: "rgba(204,255,0,0.12)",
    title: "Instant Booking",
    desc: "Skip the DMs. Book your spot instantly and get tickets to your phone.",
  },
  {
    icon: "diversity_3",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.15)",
    title: "Find Your Crew",
    desc: "Connect with foxers who match your vibe for the perfect experience.",
  },
];
