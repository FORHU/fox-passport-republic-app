import { 
  Building2, Palmtree, Warehouse, Leaf, 
  UtensilsCrossed, Briefcase, Coffee, 
  Camera, User, Video, 
  PlusCircle, LogIn 
} from "lucide-react";

export const NAV_MENU = {
  venues: [
    { label: "Hotels", href: "/venues/hotels", icon: Building2 },
    { label: "Resorts", href: "/venues/resorts", icon: Palmtree },
    { label: "Event Halls", href: "/venues/halls", icon: Warehouse },
    { label: "Garden Venues", href: "/venues/garden", icon: Leaf },
  ],
  catering: [
    { label: "Wedding Catering", href: "/catering/wedding", icon: UtensilsCrossed },
    { label: "Corporate Events", href: "/catering/corporate", icon: Briefcase },
    { label: "Party Trays", href: "/catering/party-trays", icon: Coffee },
  ],
  photography: [
    { label: "Wedding Photography", href: "/photography/wedding", icon: Camera },
    { label: "Portrait", href: "/photography/portrait", icon: User },
    { label: "Event Coverage", href: "/photography/events", icon: Video },
  ],
  business: [
    { label: "Add your business", href: "/business/add", icon: PlusCircle },
    { label: "Create your Business Account", href: "/business/login", icon: LogIn },
  ]
};