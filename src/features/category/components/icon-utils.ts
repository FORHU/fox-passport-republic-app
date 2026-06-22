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
  GraduationCap,
  Trophy,
  Users,
  ShoppingBag,
  Grid3X3,
  ArrowRight,
  Search,
  ChevronRight,
  X,
  MapPin,
  Calendar,
  Star,
  Cake,
  Store,
  Wine,
  Dumbbell,
  Palette,
  Mic,
  Map as MapIcon,
  Flower2,
  Building,
  Waves,
  Bell,
  Church as ChurchIcon,
  Baby,
  Gem,
  Home,
  Martini,
} from "lucide-react";

// EXTEND ICON MAP for subcategories
export const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Mountain,
  Tent,
  Music,
  Building2,
  PartyPopper,
  Sparkles,
  MoreHorizontal,
  Grid3X3,
  GraduationCap,
  Trophy,
  MapPin,
  Users,
  ShoppingBag,
  cake: Cake,
  checkroom: ShoppingBag, // Fallback
  store: Store,
  wine: Wine,
  dumbbell: Dumbbell,
  palette: Palette,
  mic: Mic,
  map: MapIcon,
  celebration: PartyPopper, // Fallback
  search: Search,
  arrowright: ArrowRight,
  local_florist: Flower2,
  deck: Building,
  beach_access: Waves,
  room_service: Bell,
  church: ChurchIcon,
  child_care: Baby,
  local_bar: Martini,
  diamond: Gem,
  school: GraduationCap,
  diversity_3: Users,
  home: Home,
  pool: Waves,
};

export const DEFAULT_ICON = Grid3X3;

export function getIconComponent(
  iconName: string | null | undefined
): LucideIcon {
  if (!iconName) return DEFAULT_ICON;
  // Normalize key lookup if needed, but assuming strict match for now based on previous code
  // or case-insensitive? The previous code accessed ICON_MAP[iconName] directly.
  return ICON_MAP[iconName] || ICON_MAP[iconName.toLowerCase()] || DEFAULT_ICON;
}
