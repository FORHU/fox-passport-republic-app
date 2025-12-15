export const VENUE_THINGS_TO_DO: Record<string, string[]> = {
  "makati-1": [
    "Roof deck cocktails at sunset",
    "Poblacion pub crawl",
    "Visit the Salcedo Weekend Market",
    "Photography walk in the business district"
  ],
  "tagaytay-1": [
    "Horseback riding",
    "Bulalo dining with a view",
    "Visit Sky Ranch",
    "Morning coffee by the balcony"
  ],
  "cebu-1": [
    "Late night food trip at Sugbo Mercado",
    "Jogging at IT Park",
    "Visit Temple of Leah (30mins away)",
    "Work from high-speed cafe"
  ],
  // Add defaults for others
  "default": [
    "Relax and unwind",
    "Local food tasting",
    "City exploration",
    "Photography"
  ]
};

// Mock Reviews Data (Hardcoded as requested)
export const MOCK_REVIEWS = [
  {
    id: 1,
    user: { name: "Alice G.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", action: "Stayed 2 nights" },
    content: { text: "The place looked exactly like the photos. The host was very responsive!" }
  },
  {
    id: 2,
    user: { name: "Mark D.", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80", action: "Stayed 1 week" },
    content: { text: "Great internet connection, perfect for digital nomads. A bit noisy at night though." }
  },
  {
    id: 3,
    user: { name: "Sarah L.", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80", action: "Family Trip" },
    content: { text: "My kids loved the pool! Will definitely book again next summer." }
  }
];