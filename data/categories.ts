// Categories data for FoxPassport - Restored Original Order
export interface SubCategory {
  id: string;
  name: string;
  icon: string;
  image?: string;
}

export interface Category {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  image: string;
  color: string;
  spots: string;
  children: SubCategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: "weddings-commitments",
    title: "Weddings & Commitments",
    tagline: "Life-defining moments, staged where no one expects them",
    icon: "favorite", // Will map to a Lucide icon in the page component
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
    color: "from-pink-400 to-rose-500",
    spots: "Once in a Lifetime",
    children: [
      {
        id: "garden",
        name: "Garden",
        icon: "local_florist",
        image:
          "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800",
      },
      {
        id: "rooftop",
        name: "Rooftop",
        icon: "deck",
        image:
          "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800",
      },
      {
        id: "beach",
        name: "Beach",
        icon: "beach_access",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      },
      {
        id: "reception",
        name: "Reception",
        icon: "room_service",
        image:
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
      },
      {
        id: "church",
        name: "Church",
        icon: "church",
        image:
          "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
      },
    ],
  },
  {
    id: "celebrations",
    title: "Celebrations & Milestones",
    tagline: 'Moments that say: "We\'re alive, together."',
    icon: "cake",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop",
    color: "from-teal-400 to-cyan-600",
    spots: "Milestones",
    children: [
      {
        id: "birthday_party",
        name: "Birthday Party",
        icon: "cake",
        image:
          "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      },
      {
        id: "baby_shower",
        name: "Baby Shower",
        icon: "child_care",
        image:
          "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800",
      },
      {
        id: "bachelor_party",
        name: "Bachelor Party",
        icon: "local_bar",
        image:
          "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800",
      },
      {
        id: "engagement_party",
        name: "Engagement Party",
        icon: "diamond",
        image:
          "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
      },
      {
        id: "graduation_party",
        name: "Graduation Party",
        icon: "school",
        image:
          "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=800",
      },
      {
        id: "family_reunion",
        name: "Family Reunion",
        icon: "diversity_3",
        image:
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",
      },
      {
        id: "holiday_party",
        name: "Holiday Party",
        icon: "celebration",
        image:
          "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800",
      },
      {
        id: "house_party",
        name: "House Party",
        icon: "home",
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      },
      {
        id: "pool_party",
        name: "Pool Party",
        icon: "pool",
        image:
          "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800",
      },
      {
        id: "garden_party",
        name: "Garden Party",
        icon: "local_florist",
        image:
          "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800",
      },
      {
        id: "beach_party",
        name: "Beach Party",
        icon: "beach_access",
        image:
          "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800",
      },
      {
        id: "rooftop_party",
        name: "Rooftop Party",
        icon: "deck",
        image:
          "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=800",
      },
    ],
  },
  {
    id: "private-experiences",
    title: "Private Experiences",
    tagline: "Invitation-only days for those who know",
    icon: "local_dining",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop",
    color: "from-amber-400 to-orange-500",
    spots: "Exclusive",
    children: [
      {
        id: "team-building",
        name: "Team Building (Small Group)",
        icon: "groups",
      },
      { id: "family-gathering", name: "Family Gathering", icon: "diversity_1" },
      { id: "private-dj-party", name: "Private DJ Party", icon: "music_note" },
      { id: "karaoke", name: "Videoke / Karaoke Night", icon: "mic" },
      { id: "game-night", name: "Game Night (Cards)", icon: "style" },
      {
        id: "mountain-nature-stay",
        name: "Private Mountain / Nature Stay",
        icon: "landscape",
      },
      {
        id: "private-island",
        name: "Private Island Day Tour",
        icon: "beach_access",
      },
      { id: "private-dining", name: "Private Dining", icon: "restaurant" },
      {
        id: "chefs-table",
        name: "Chef's Table Experiences",
        icon: "soup_kitchen",
      },
      { id: "luxury-picnics", name: "Luxury Picnics", icon: "outdoor_grill" },
      { id: "vip-gatherings", name: "Small VIP Gatherings", icon: "verified" },
    ],
  },
  {
    id: "signature-places",
    title: "Signature Places",
    tagline: "Fixed locations where every night feels like an event",
    icon: "location_on",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop",
    color: "from-teal-400 to-emerald-600",
    spots: "Romantic Destinations",
    children: [
      { id: "night-coffee", name: "Night Coffee Spots", icon: "local_cafe" },
      { id: "outdoor-lounges", name: "Romantic Outdoor Lounges", icon: "deck" },
      { id: "hidden-date-places", name: "Hidden Date Places", icon: "explore" },
      { id: "scenic-venues", name: "Scenic Venues", icon: "landscape" },
    ],
  },
  {
    id: "popup-seasonal",
    title: "Pop-up & Seasonal Moments",
    tagline: "Here today. Gone tomorrow.",
    icon: "event", // Maps to Calendar
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop",
    color: "from-purple-400 to-indigo-600",
    spots: "Limited Time",
    children: [
      {
        id: "seasonal-dining",
        name: "Seasonal Pop-up Dining",
        icon: "restaurant",
      },
      {
        id: "art-music-cultural",
        name: "Art, Music, Cultural Events",
        icon: "music_note",
      },
      { id: "limited-time", name: "Limited-Time Concepts", icon: "schedule" },
    ],
  },
];

// Helper to get flat list of all subcategories
export const getAllSubCategories = (): SubCategory[] => {
  return CATEGORIES.flatMap((cat) => cat.children);
};

// Helper to find category by ID
export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

// Helper to find subcategory by ID
export const getSubCategoryById = (
  id: string
): { category: Category; subCategory: SubCategory } | undefined => {
  for (const category of CATEGORIES) {
    const subCategory = category.children.find((sub) => sub.id === id);
    if (subCategory) {
      return { category, subCategory };
    }
  }
  return undefined;
};
