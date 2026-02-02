// Category design helpers for styling and presentation

export interface CategoryDesign {
  gradient: string;
  image: string;
  tagline: string;
  spotLabel: string;
  spotColor: string;
}

export const DEFAULT_CATEGORY_DESIGN: CategoryDesign = {
  gradient: "from-gray-900 to-gray-800",
  image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
  tagline: "Discover amazing experiences",
  spotLabel: "Explore",
  spotColor: "#ccff00",
};

// Category-specific designs
const CATEGORY_DESIGNS: Record<string, CategoryDesign> = {
  "Classes & Workshops": {
    gradient: "from-blue-900 to-indigo-800",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
    tagline: "Learn something new",
    spotLabel: "Learn",
    spotColor: "#3b82f6",
  },
  "Competitions & Games": {
    gradient: "from-orange-900 to-red-800",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800",
    tagline: "Compete and conquer",
    spotLabel: "Compete",
    spotColor: "#f97316",
  },
  "Festivals & Fairs": {
    gradient: "from-purple-900 to-pink-800",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    tagline: "Celebrate together",
    spotLabel: "Celebrate",
    spotColor: "#a855f7",
  },
  "Live Performances": {
    gradient: "from-pink-900 to-rose-800",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
    tagline: "Experience live entertainment",
    spotLabel: "Watch",
    spotColor: "#ec4899",
  },
  "Markets & Pop-Ups": {
    gradient: "from-green-900 to-emerald-800",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800",
    tagline: "Shop unique finds",
    spotLabel: "Shop",
    spotColor: "#22c55e",
  },
  "Parties & Socials": {
    gradient: "from-violet-900 to-purple-800",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
    tagline: "Meet and mingle",
    spotLabel: "Party",
    spotColor: "#8b5cf6",
  },
  "Tours & Excursions": {
    gradient: "from-teal-900 to-cyan-800",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800",
    tagline: "Explore new places",
    spotLabel: "Explore",
    spotColor: "#14b8a6",
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
  parentCategoryName?: string
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
