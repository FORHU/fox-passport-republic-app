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

  // Check if user is already a host
  const userRole = user?.role?.toLowerCase();
  const isHost = user?.isHost || ["host", "mayor", "admin", "super_admin"].includes(userRole as string);
  const isAdmin = ["admin", "super_admin"].includes(userRole as string);

  // Get user initial for avatar
  const userInitial =
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  // Determine dashboard path based on role
  const getDashboardPath = () => {
    switch (userRole) {
      case "admin":
      case "super_admin":
        return "/admin";
      case "host":
      case "mayor":
      case "foxer":
        return "/host";
      default:
        return "/user";
    }
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
        isHost
          ? {
              label: "Host Dashboard",
              description: "Manage your venues and listings.",
              icon: Building2,
              href: "/host",
              hasImage: true,
            }
          : {
              label: "Become a mayor",
              description: "It's easy to start hosting and earn extra income.",
              icon: Home,
              href: "#become-host",
              hasImage: true,
              isAction: true,
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

  // Click on avatar → go to profile
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    close();
    router.push(dashboardPath);
  };

  // Click on hamburger → toggle menu
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  const handleItemClick = (item: any) => {
    close();

    // If it's the "Become a mayor" action (not navigation)
    if (item.isAction && item.label === "Become a mayor") {
      becomeHost();
      return;
    }

    // If there's a custom callback (legacy support)
    if (item.label === "Become a mayor" && onBecomeHost) {
      onBecomeHost();
      return;
    }

    // Normal navigation
    router.push(item.href);
  };

  const handleLogout = () => {
    close();
    logout();
    router.push("/");
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger Button - Hamburger + Avatar */}
    <div className="flex items-center gap-2">
      {/* Avatar Circle - Goes to profile */}
      <button
        onClick={handleAvatarClick}
        className="w-10 h-10 rounded-full border border-[#ccff00]/50 bg-[#ccff00] hover:shadow-[0_0_15px_rgba(204,255,0,0.4)] hover:brightness-110 transition-all duration-200 flex items-center justify-center p-0.5 shadow-sm"
        aria-label="Go to profile"
      >
        <div className="w-full h-full rounded-full flex items-center justify-center">
          <span className="text-black text-sm font-bold">{userInitial}</span>
        </div>
      </button>

      {/* Hamburger Icon - Opens dropdown */}
      <button
        onClick={handleMenuToggle}
        className={`w-10 h-10 flex items-center justify-center rounded-full border border-[#ccff00]/50 bg-[#ccff00] hover:shadow-[0_0_15px_rgba(204,255,0,0.4)] hover:brightness-110 transition-all duration-200 shadow-sm ${isOpen ? 'ring-2 ring-[#ccff00]/50 ring-offset-1 ring-offset-black shadow-md' : ''}`}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5 text-black" />
      </button>
    </div>

      {/* Dropdown Menu - Dark Theme */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a24] rounded-xl shadow-2xl border border-white/10 py-2 z-50 backdrop-blur-xl">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {/* Section divider (except for first section) */}
              {sectionIdx > 0 && <div className="border-t border-white/10 my-2" />}

              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleItemClick(item)}
                  disabled={isPending && item.isAction}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <item.icon className="w-5 h-5 text-white/60 group-hover:text-[#ccff00] mt-0.5 shrink-0 transition-colors" />

                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm font-medium block group-hover:text-[#ccff00] transition-colors">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="text-white/50 text-xs leading-tight block mt-0.5">
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
              ))}
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