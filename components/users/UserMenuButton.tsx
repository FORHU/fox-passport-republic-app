// File: src/components/user/UserMenuButton.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Heart,
  Briefcase,
  MessageSquare,
  User,
  Settings,
  Globe,
  HelpCircle,
  Home,
  UserPlus,
  Users,
  Gift,
  LogOut,
  Menu,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useUserMenu } from "@/hooks/auth/useUserMenu";
import { useAuthStore } from "@/store/useAuthStore";
import { useBecomeHost } from "@/hooks/features/useBecomeHost";

// Menu item type definition
import { LucideIcon } from "lucide-react";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  description?: string;
  hasImage?: boolean;
  isAction?: boolean;
  isHighlight?: boolean;
}

interface MenuSection {
  items: MenuItem[];
}

interface UserMenuButtonProps {
  onBecomeHost?: () => void;
}

export default function UserMenuButton({ onBecomeHost }: UserMenuButtonProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isOpen, toggle, close, menuRef } = useUserMenu();
  const { mutate: becomeHost, isPending } = useBecomeHost();

  // Unified Role Detection Logic
  // Support both legacy 'role' and new 'systemRole'/'roleType'
  const sysRole = user?.systemRole || user?.role;
  const roleTypes = user?.roleType || [];
  
  const isAdmin = sysRole === "admin" || sysRole === "super_admin";
  const isMayor = roleTypes.includes("mayor");
  const isHost = user?.isHost || roleTypes.includes("host") || isMayor;
  const isFoxer = roleTypes.includes("foxer") || roleTypes.includes("foxerAsset") || roleTypes.includes("foxerService");

  // Get user initial for avatar
  const userInitial =
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  // Determine dashboard path based on role
  const getDashboardPath = () => {
    if (isAdmin) return "/admin";
    if (isMayor || isHost || isFoxer) return "/host";
    return "/user";
  };

  const dashboardPath = getDashboardPath();

  // Generate menu sections dynamically based on user role
  const menuSections: MenuSection[] = [
    {
      items: [
        { label: "Wishlists", icon: Heart, href: "/wishlists" },
        { label: "Trips", icon: Briefcase, href: "/trips" },
        { label: "Messages", icon: MessageSquare, href: "/messages" },
        { label: "Dashboard", icon: User, href: dashboardPath },
      ],
    },
    {
      items: [
        { label: "Account settings", icon: Settings, href: "/settings" },
        { label: "Languages & currency", icon: Globe, href: "/settings/language" },
        { label: "Help Center", icon: HelpCircle, href: "/help" },
      ],
    },
    {
      items: [
        (isHost || isMayor)
          ? {
              label: "Host Dashboard",
              description: "Manage your venues and listings.",
              icon: Building2,
              href: "/host",
              hasImage: true,
            }
          : {
              label: "Join FoxPassport",
              description: "Choose your identity in the ecosystem and start your journey.",
              icon: UserPlus,
              href: "/onboarding",
              hasImage: false,
              isHighlight: true,
            },
        isAdmin && {
          label: "Admin Dashboard",
          description: "Manage platform settings and users.",
          icon: ShieldCheck,
          href: "/admin",
          hasImage: true,
        },
      ].filter(Boolean) as MenuItem[],
    },
    {
      items: [
        { label: "Refer a Host", icon: UserPlus, href: "/refer" },
        { label: "Find a co-host", icon: Users, href: "/co-host" },
        { label: "Gift cards", icon: Gift, href: "/gift-cards" },
      ],
    },
  ];

  // Combined toggle (Airbnb style)
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  const handleItemClick = (item: any) => {
    close();
    router.push(item.href);
  };

  const handleLogout = () => {
    close();
    logout();
    router.push("/");
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Unified Trigger Button - Airbnb Style */}
      <button
        onClick={handleToggle}
        className={`flex items-center gap-3 pl-3 pr-1 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all duration-300 backdrop-blur-md group ${
          isOpen ? 'ring-2 ring-[#ccff00]/50 bg-white/10' : ''
        }`}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
        
        <div className="w-8 h-8 rounded-full bg-[#ccff00] flex items-center justify-center border border-[#ccff00]/50 shadow-sm overflow-hidden">
          <span className="text-black text-xs font-bold">{userInitial}</span>
        </div>
      </button>

      {/* Dropdown Menu - Dark Theme */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a24] rounded-xl shadow-2xl border border-white/10 py-2 z-50 backdrop-blur-xl">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {/* Section divider (except for first section) */}
              {sectionIdx > 0 && <div className="border-t border-white/10 my-2" />}

              {section.items.map((item) => {
                const isHighlight = item.isHighlight;
                
                return (
                  <button
                    key={item.label}
                    onClick={() => handleItemClick(item)}
                    disabled={isPending && item.isAction}
                    className={`w-full text-left px-4 py-3 transition-all duration-300 flex items-start gap-3 group disabled:opacity-50 disabled:cursor-not-allowed ${
                      isHighlight
                        ? "relative bg-gradient-to-r from-[#ccff00]/10 to-[#00d2ff]/10 hover:from-[#ccff00]/20 hover:to-[#00d2ff]/20 overflow-hidden isolate"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {/* Highlight Glow Border */}
                    {isHighlight && (
                      <div className="absolute inset-x-2 inset-y-1 pointer-events-none rounded-lg border border-[#ccff00]/30 group-hover:border-[#ccff00]/60 transition-colors" />
                    )}

                    <item.icon className={`w-5 h-5 mt-0.5 shrink-0 transition-colors ${
                      isHighlight ? "text-[#ccff00] group-hover:animate-pulse" : "text-white/60 group-hover:text-[#ccff00]"
                    }`} />

                    <div className="flex-1 min-w-0 z-10 relative">
                      <span className={`text-sm font-medium block transition-colors ${
                        isHighlight ? "text-[#ccff00] font-bold" : "text-white group-hover:text-[#ccff00]"
                      }`}>
                        {item.label}
                      </span>
                      {item.description && (
                        <span className={`text-xs leading-tight block mt-0.5 ${
                          isHighlight ? "text-white/80" : "text-white/50"
                        }`}>
                          {item.description}
                        </span>
                      )}
                    </div>

                  {/* Host illustration placeholder */}
                  {item.hasImage && (
                    <div className="w-12 h-12 shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-[#ccff00]/20 to-green-500/20 rounded-lg flex items-center justify-center border border-[#ccff00]/30">
                        <span className="text-2xl">🏠</span>
                      </div>
                    </div>
                  )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Logout - Always at bottom */}
          <div className="border-t border-white/10 my-2" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 hover:bg-red-500/10 transition-colors flex items-center gap-3 text-white/80 text-sm font-medium group"
          >
            <LogOut className="w-5 h-5 text-white/60 group-hover:text-red-400 transition-colors" />
            <span className="group-hover:text-red-400 transition-colors">Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}