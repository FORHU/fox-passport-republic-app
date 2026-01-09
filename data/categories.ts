// Categories data for FoxPassport - Based on categories.pdf
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
    icon: "favorite",
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
          "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400",
      },
      {
        id: "rooftop",
        name: "Rooftop",
        icon: "deck",
        image:
          "https://images.unsplash.com/photo-1519671482502-9759101d4561?w=400",
      },
      {
        id: "beach",
        name: "Beach",
        icon: "beach_access",
        image:
          "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400",
      },
      {
        id: "reception",
        name: "Reception",
        icon: "room_service",
        image:
          "https://images.unsplash.com/photo-1519225421980-715cb0202128?w=400",
      },
      {
        id: "church",
        name: "Church",
        icon: "church",
        image:
          "https://images.unsplash.com/photo-1437603568260-1950d3ca6eab?w=400",
      },
    ],
  },
  {
    id: "celebrations",
    title: "Celebrations",
    tagline: "Moments that say: We're alive, together.",
    icon: "celebration",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop",
    color: "from-purple-500 to-indigo-600",
    spots: "Life Milestones",
    children: [
      {
        id: "birthdays",
        name: "Birthdays",
        icon: "cake",
        image:
          "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400",
      },
      {
        id: "anniversaries",
        name: "Anniversaries",
        icon: "event",
        image:
          "https://images.unsplash.com/photo-1529543544599-a7cfa8abe07f?w=400",
      },
      {
        id: "couple-celebrations",
        name: "Couple Celebrations",
        icon: "favorite_border",
        image:
          "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400",
      },
      {
        id: "private-parties",
        name: "Private Parties with Friends",
        icon: "groups",
        image:
          "https://images.unsplash.com/photo-1528495612343-9ca9f4a4de28?w=400",
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
        id: "private-dining",
        name: "Private Dining",
        icon: "restaurant",
        image:
          "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400",
      },
      {
        id: "chefs-table",
        name: "Chef's Table Experiences",
        icon: "soup_kitchen",
        image:
          "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400",
      },
      {
        id: "luxury-picnics",
        name: "Luxury Picnics",
        icon: "outdoor_grill",
        image:
          "https://images.unsplash.com/photo-1526484631-cb7c9e4ed3dc?w=400",
      },
      {
        id: "vip-gatherings",
        name: "Small VIP Gatherings",
        icon: "verified",
        image:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
      },
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
      {
        id: "night-coffee",
        name: "Night Coffee Spots",
        icon: "local_cafe",
        image:
          "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400",
      },
      {
        id: "outdoor-lounges",
        name: "Romantic Outdoor Lounges",
        icon: "deck",
        image:
          "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=400",
      },
      {
        id: "hidden-date-places",
        name: "Hidden Date Places",
        icon: "explore",
        image:
          "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=400",
      },
      {
        id: "scenic-venues",
        name: "Scenic Venues",
        icon: "landscape",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      },
    ],
  },
  {
    id: "popup-seasonal",
    title: "Pop-up & Seasonal Moments",
    tagline: "Here today. Gone tomorrow.",
    icon: "schedule",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop",
    color: "from-cyan-400 to-blue-500",
    spots: "Limited Time",
    children: [
      {
        id: "popup-dining",
        name: "Seasonal Pop-up Dining",
        icon: "ramen_dining",
        image:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
      },
      {
        id: "art-music-events",
        name: "Art, Music & Cultural Events",
        icon: "palette",
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400",
      },
      {
        id: "limited-concepts",
        name: "Limited-Time Concepts",
        icon: "new_releases",
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400",
      },
      {
        id: "night-markets",
        name: "Night Markets & Fairs",
        icon: "storefront",
        image:
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
      },
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
