// lib/categoryIcons.ts
import {
  Utensils,
  Mountain,
  Tent,
  Music,
  Building2,
  PartyPopper,
  Sparkles,
  MoreHorizontal,
  LucideIcon,
  UtensilsCrossed,
  Camera,
  Palmtree,
  Plane,
  Hotel,
  Home,
  Award,
  Heart,
  Waves,
  TreePine,
  Coffee,
  ShoppingBag,
  Dumbbell,
  Film,
  Gamepad2,
  BookOpen,
  Briefcase,
} from "lucide-react";

// Map category slugs to their icons
export const categoryIconMap: Record<string, LucideIcon> = {
  // Food & Dining
  "food": Utensils,
  "food-dining": Utensils,
  "dining": UtensilsCrossed,
  "restaurant": Utensils,
  "cafe": Coffee,

  // Adventures
  "adventure": Mountain,
  "adventures": Mountain,
  "hiking": Mountain,
  "outdoor": TreePine,

  // Camping
  "camping": Tent,
  "camp": Tent,
  "glamping": Tent,

  // Music & Arts
  "music": Music,
  "music-arts": Music,
  "arts": Camera,
  "entertainment": Film,

  // Venues
  "venue": Building2,
  "venues": Building2,
  "event": Building2,
  "events": Building2,

  // Nightlife
  "nightlife": PartyPopper,
  "bar": PartyPopper,
  "club": PartyPopper,

  // Wellness
  "wellness": Sparkles,
  "spa": Sparkles,
  "health": Heart,
  "fitness": Dumbbell,

  // Travel & Hotels
  "hotel": Hotel,
  "hotels": Hotel,
  "travel": Plane,
  "resort": Palmtree,
  "beach": Waves,

  // Shopping
  "shopping": ShoppingBag,
  "retail": ShoppingBag,

  // Education & Books
  "education": BookOpen,
  "learning": BookOpen,

  // Business
  "business": Briefcase,
  "corporate": Briefcase,

  // Gaming
  "gaming": Gamepad2,
  "games": Gamepad2,

  // Accommodation
  "accommodation": Home,
  "stay": Home,

  // Awards & Special
  "awards": Award,
  "special": Award,

  // Default/More
  "more": MoreHorizontal,
  "other": MoreHorizontal,
};

// Get icon for a category slug, with fallback to default
export function getCategoryIcon(slug: string): LucideIcon {
  const normalizedSlug = slug.toLowerCase().trim();
  return categoryIconMap[normalizedSlug] || MoreHorizontal;
}

// Get icon by category name (fallback if slug not provided)
export function getCategoryIconByName(name: string): LucideIcon {
  const normalizedName = name.toLowerCase().trim().replace(/\s+/g, "-");
  return categoryIconMap[normalizedName] || MoreHorizontal;
}
