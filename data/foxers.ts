// Foxers (service providers) data for the landing page
export interface Foxer {
  id: number;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  desc: string;
  tags: string[];
  avatar: string;
  images: string[];
  online: boolean;
}

export const FOXERS: Foxer[] = [
  {
    id: 1,
    name: "Jasmine L.",
    role: "Event Stylist",
    rating: 4.9,
    reviews: 128,
    desc: "I turn pine forests into fairy tales. Specializing in boho camping setups and intimate...",
    tags: ["#Boho", "#Camping", "#Music"],
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519222970733-f546218fa6d7?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=200&auto=format&fit=crop",
    ],
    online: true,
  },
  {
    id: 2,
    name: "Marco D.",
    role: "Adventure Guide",
    rating: 5.0,
    reviews: 84,
    desc: "Leading treks and organizing outdoor activities. Let's make your team building...",
    tags: ["#Trekking", "#TeamBuilding"],
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523592121529-f6d1ebee57b1?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=200&auto=format&fit=crop",
    ],
    online: true,
  },
  {
    id: 3,
    name: "Sarah K.",
    role: "Live Music & DJ",
    rating: 4.8,
    reviews: 56,
    desc: "Acoustic vibes for sunset or electric beats for the after-party. I bring the sound system.",
    tags: ["#LiveBand", "#DJ"],
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=200&auto=format&fit=crop",
    ],
    online: false,
  },
];
