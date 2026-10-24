// Category design helpers for styling and presentation

export interface CategoryDesign {
  gradient: string;
  image: string;
  tagline: string;
  spotLabel: string;
  spotColor: string;
}

export const DEFAULT_CATEGORY_DESIGN: CategoryDesign = {
  gradient: "from-neutral-900 to-neutral-900",
  image:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
  tagline: "Discover amazing experiences",
  spotLabel: "Explore",
  spotColor: "#C4E85A",
};

// Category-specific designs
const CATEGORY_DESIGNS: Record<string, CategoryDesign> = {
  "Classes & Workshops": {
    gradient: "from-neutral-900 to-neutral-900",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
    tagline: "Learn something new",
    spotLabel: "Learn",
    spotColor: "#5C62D6",
  },
  "Competitions & Games": {
    gradient: "from-neutral-900 to-neutral-900",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800",
    tagline: "Compete and conquer",
    spotLabel: "Compete",
    spotColor: "#D99A26",
  },
  "Festivals & Fairs": {
    gradient: "from-neutral-900 to-neutral-900",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    tagline: "Celebrate together",
    spotLabel: "Celebrate",
    spotColor: "#A3A8F5",
  },
  "Live Performances": {
    gradient: "from-neutral-900 to-neutral-900",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
    tagline: "Experience live entertainment",
    spotLabel: "Watch",
    spotColor: "#A3A8F5",
  },
  "Markets & Pop-Ups": {
    gradient: "from-neutral-900 to-neutral-900",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800",
    tagline: "Shop unique finds",
    spotLabel: "Shop",
    spotColor: "#ADD13F",
  },
  "Parties & Socials": {
    gradient: "from-neutral-900 to-neutral-900",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
    tagline: "Meet and mingle",
    spotLabel: "Party",
    spotColor: "#A3A8F5",
  },
  "Tours & Excursions": {
    gradient: "from-neutral-900 to-neutral-900",
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800",
    tagline: "Explore new places",
    spotLabel: "Explore",
    spotColor: "#5C62D6",
  },
};

/**
 * Get design configuration for a category by name
 */
export function getCategoryDesign(categoryName: string): CategoryDesign {
  return CATEGORY_DESIGNS[categoryName] || DEFAULT_CATEGORY_DESIGN;
}

/**
 * Get design configuration for a subcategory
 * Falls back to parent category design if not found
 */
export function getSubCategoryDesign(
  subCategoryName: string,
  parentCategoryName?: string,
): CategoryDesign {
  // First try to get subcategory-specific design
  if (CATEGORY_DESIGNS[subCategoryName]) {
    return CATEGORY_DESIGNS[subCategoryName];
  }

  // Fall back to parent category design
  if (parentCategoryName && CATEGORY_DESIGNS[parentCategoryName]) {
    return CATEGORY_DESIGNS[parentCategoryName];
  }

  return DEFAULT_CATEGORY_DESIGN;
}
