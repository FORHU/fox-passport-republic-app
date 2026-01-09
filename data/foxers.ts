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
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=200&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=200&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1459749411177-287ce35e8b75?q=80&w=200&auto=format&fit=crop",
    ],
    online: false,
  },
];
