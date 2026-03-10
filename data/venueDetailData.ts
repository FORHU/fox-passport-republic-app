// Venue Detail Data Constants

export interface Foxer {
  id: number;
  name: string;
  role: string;
  fee: number;
  rating: number;
  avatar: string;
  description: string;
}

export interface ServiceCategory {
  id: string;
  label: string;
  icon: string;
}

export interface CustomService {
  id: string;
  name: string;
  price: number;
  icon: string;
  desc: string;
}

export interface DefaultInclusion {
  name: string;
  icon: string;
  desc: string;
}

export const AVAILABLE_FOXERS: Foxer[] = [
  {
    id: 1,
    name: "Jinx",
    role: "Visual Director",
    fee: 5000,
    rating: 5.0,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    description: "Specializes in neon aesthetics and cyberpunk themes.",
  },
  {
    id: 2,
    name: "Kael",
    role: "Audio Engineer",
    fee: 4500,
    rating: 4.8,
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    description: "Expert in immersive soundscapes and bass-heavy setups.",
  },
  {
    id: 3,
    name: "Luna",
    role: "Stylist",
    fee: 6000,
    rating: 4.9,
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop",
    description: "Fashion and venue styling for the perfect photo op.",
  },
  {
    id: 4,
    name: "Orion",
    role: "Lighting Tech",
    fee: 5500,
    rating: 4.9,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    description: "Laser shows and projection mapping wizard.",
  },
  {
    id: 5,
    name: "Nova",
    role: "Mixologist",
    fee: 4000,
    rating: 4.7,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    description: "Crafts custom themed cocktails for your event.",
  },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "foxer", label: "Curator", icon: "person_search" },
  { id: "catering", label: "Food & Drink", icon: "restaurant" },
  { id: "tech", label: "Tech & AV", icon: "speaker" },
  { id: "decor", label: "Decor & Style", icon: "palette" },
  { id: "media", label: "Photo & Video", icon: "videocam" },
];

export const CUSTOM_SERVICES: Record<string, CustomService[]> = {
  catering: [
    {
      id: "cat1",
      name: "Neon Cocktail Bar",
      price: 15000,
      icon: "local_bar",
      desc: "Unlimited signature cocktails for 4 hours.",
    },
    {
      id: "cat2",
      name: "Midnight Ramen Station",
      price: 12000,
      icon: "ramen_dining",
      desc: "Hot ramen bar with 3 broth choices.",
    },
    {
      id: "cat3",
      name: "Sushi Platter Deluxe",
      price: 8000,
      icon: "set_meal",
      desc: "Fresh sashimi and rolls for 20 pax.",
    },
  ],
  tech: [
    {
      id: "tech1",
      name: "Funktion-One Sound",
      price: 25000,
      icon: "speaker",
      desc: "Club-standard audio system setup.",
    },
    {
      id: "tech2",
      name: "Laser & Fog Show",
      price: 8000,
      icon: "blur_on",
      desc: "Synchronized light show with heavy fog.",
    },
    {
      id: "tech3",
      name: "Silent Disco Gear",
      price: 10000,
      icon: "headphones",
      desc: "50 headsets and 3-channel transmitter.",
    },
  ],
  decor: [
    {
      id: "dec1",
      name: "Cyberpunk Props",
      price: 5000,
      icon: "smart_toy",
      desc: "Futuristic barrels, wires, and neon signs.",
    },
    {
      id: "dec2",
      name: "Lounge Seating",
      price: 7000,
      icon: "chair",
      desc: "Velvet sofas and LED tables.",
    },
  ],
  media: [
    {
      id: "med1",
      name: "Aftermovie (Drone)",
      price: 10000,
      icon: "videocam",
      desc: "4K drone shots and cinematic editing.",
    },
    {
      id: "med2",
      name: "Film Photo Booth",
      price: 5000,
      icon: "camera",
      desc: "Unlimited prints with custom border.",
    },
  ],
};

export const DEFAULT_INCLUSIONS: DefaultInclusion[] = [
  {
    name: "Standard Audio",
    icon: "speaker",
    desc: "High-fidelity sound system suitable for 200 pax.",
  },
  {
    name: "Ambient Lighting",
    icon: "light_mode",
    desc: "Static wash lighting to set the mood.",
  },
  {
    name: "Welcome Drinks",
    icon: "local_bar",
    desc: "2 signature cocktails per guest upon entry.",
  },
  {
    name: "Event Photography",
    icon: "photo_camera",
    desc: "Roaming photographer for 2 hours.",
  },
];

export const MOCK_VENUE = {
  title: "Neon Nights: Underground Cyberpunk Rave",
  rating: 4.92,
  reviews: 124,
  location: "Poblacion, Makati",
  province: "Metro Manila",
  category: "Nightlife",
  guestCount: 200,
  bedroomCount: 1,
  bathroomCount: 4,
  description:
    "Step into a cyberpunk dreamscape right in the heart of Makati. This isn't just a party; it's an immersive journey through the city's hidden underground scenes. \n\nWe'll start at a secret rooftop bar for sunset drinks, then move to an exclusive retro-wave bunker that's normally members-only. Expect neon lights, synth-wave beats, and a crowd that matches your vibe.",
  price: 1500,
  offers: [
    "VIP Access",
    "2 Free Drinks",
    "Pro Photography",
    "Air Conditioning",
    "Secure Parking",
    "Meet & Greet",
  ],
  images: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U",
    "https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=800&auto=format&fit=crop",
  ],
};

export const MOCK_HOST = {
  name: "Neon Vertex",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAawAmjQLUXCUHrFlbDS_ydJnuUpm_WUNW9I5alXTGfJCNDU8_Gnn4cey4Tt_fcRefnkP3AK4S1C13YiOGOnCLmz3aSgwJP_JwChCJBNSCeFugn97n0lpqg6JVBy926WV4xcXgfaLeBW6GNWknG__nTJeUYtmKctJxCDA5ODZq2ZxpowxJKzUXEpcS9W1ThdbCuR0rXQTeqeW2URDNRYLxCNmXPoWUlxq_9LdMzamdZIYkwK2XK3b0k_kVV4njSFnmyGojp2293vrU",
  isCertified: true,
  rating: 4.98,
  reviews: 240,
  yearsHosting: 3,
  responseRate: 100,
  responseTime: "within an hour",
  description:
    "I'm a local photographer and nightlife curator. I specialize in finding the spots that aren't on the maps.",
};

export const MOCK_REVIEWS = [
  {
    name: "Sarah K.",
    date: "January 2024",
    text: "So cozy! The real highlight was the host. Neon Vertex made sure we had everything we needed. 10/10 would vibe again.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U",
  },
  {
    name: "Mike T.",
    date: "December 2023",
    text: "Great location, very quiet despite being in the center of the district. The photography add-on is a must!",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgd--zxF5w1ZztnRmVlmV-feUqN_qBWaBYUT5CujXc0w-0AUuWAmHt_hqnGMMe6m_fRhEWkVx4s-GPtdMKYzlfSOQqHXDOj1gZA2nyUJx9g-k_T2GXeIiYRFWE4OhzISNwTdKHnUtx3za3LKNh05jbmOS4npA_2XzCQ6-b0jqwzXF4Zy5LKfBRtJpHKvZknn8VWcB24VzWfO5VUZJ4zVgdHD766vR4O1OP3A6j3meIxBZLNL5KDybSUXLKzRdPbfxAQ2NIKRBRKsA",
  },
];

export const RATING_BARS = [
  { stars: 5, count: "92%" },
  { stars: 4, count: "6%" },
  { stars: 3, count: "2%" },
  { stars: 2, count: "0%" },
  { stars: 1, count: "0%" },
];
