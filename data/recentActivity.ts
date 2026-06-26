// src/data/activityData.ts

export interface ActivityData {
  id: string;
  user: {
    name: string;
    image: string;
    action: string;
    time: string;
  };
  business: {
    name: string;
    image?: string;
    rating: number;
    category: string;
    location: string;
    details: string;
  };
  content: {
    text?: string;
    images?: string[];
  };
}

export const ACTIVITY_DATA: ActivityData[] = [
  {
    id: "tagaytay-1",
    user: {
      name: "Bea A.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      action: "Wrote a review",
      time: "Just now",
    },
    business: {
      name: "Serene Lakeview Villa",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=60",
      rating: 4.9,
      category: "Villa",
      location: "Tagaytay, Cavite",
      details: "5 min to Sky Ranch",
    },
    content: {
      text: "The view of Taal Lake was breathtaking! Perfect for our intimate wedding.",
    },
  },
  {
    id: "cebu-1",
    user: {
      name: "Marco P.",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
      action: "Wrote a review",
      time: "2 hrs ago",
    },
    business: {
      name: "IT Park Modern Condo",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=60",
      rating: 4.8,
      category: "Condo",
      location: "Cebu City",
      details: "Near Ayala Center",
    },
    content: {
      text: "Spacious and modern. The internet was fast for my work.",
    },
  },
  {
    id: "boracay-1",
    user: {
      name: "Jenny L.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80",
      action: "Added photos",
      time: "3 hrs ago",
    },
    business: {
      name: "Station 1 Beach Resort",
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=500&q=60",
      rating: 4.95,
      category: "Beach Resort",
      location: "Boracay, Aklan",
      details: "Beachfront property",
    },
    content: {
      images: ["https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=500&q=60"],
    },
  },
  {
    id: "makati-1",
    user: {
      name: "Miguel T.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      action: "Wrote a review",
      time: "5 hrs ago",
    },
    business: {
      name: "Skyline Loft Poblacion",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=60",
      rating: 4.85,
      category: "Apartment",
      location: "Makati City",
      details: "Walking distance to bars",
    },
    content: {
      text: "The nightlife here is amazing. Great host!",
    },
  },
  {
    id: "baguio-1",
    user: {
      name: "Sarah K.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
      action: "Wrote a review",
      time: "6 hrs ago",
    },
    business: {
      name: "The Pine Cabin",
      image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=500&q=60",
      rating: 4.95,
      category: "Cabin",
      location: "Baguio City",
      details: "Mountain retreat",
    },
    content: {
      text: "So cozy! The real fireplace was the highlight.",
    },
  },
  {
    id: "elnido-1",
    user: {
      name: "Chris D.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
      action: "Added photos",
      time: "1 day ago",
    },
    business: {
      name: "Bamboo Villa El Nido",
      image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=60",
      rating: 4.95,
      category: "Villa",
      location: "El Nido, Palawan",
      details: "Island paradise",
    },
    content: {
      images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=60"],
    },
  },
  {
    id: "davao-1",
    user: {
      name: "Anna M.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      action: "Wrote a review",
      time: "2 days ago",
    },
    business: {
      name: "Marco Polo Residences",
      image: "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?auto=format&fit=crop&w=500&q=60",
      rating: 4.8,
      category: "Apartment",
      location: "Davao City",
      details: "City center location",
    },
    content: {
      text: "Great amenities and very secure.",
    },
  },
  {
    id: "siargao-1",
    user: {
      name: "Jake R.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80",
      action: "Added photos",
      time: "3 days ago",
    },
    business: {
      name: "Cloud 9 Surf Hut",
      image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=60",
      rating: 4.7,
      category: "Hut",
      location: "Siargao Island",
      details: "Surfer's paradise",
    },
    content: {
      images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=60"],
    },
  },
];