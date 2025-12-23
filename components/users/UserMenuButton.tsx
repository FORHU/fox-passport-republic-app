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
} from "lucide-react";
import { useUserMenu } from "@/hooks/useUserMenu";
import { useAuthStore } from "@/store/useAuthStore";

// Menu item configuration - customize hrefs as needed
const menuSections = [
  {
    items: [
      { label: "Wishlists", icon: Heart, href: "/wishlists" },
      { label: "Trips", icon: Briefcase, href: "/trips" },
      { label: "Messages", icon: MessageSquare, href: "/messages" },
      { label: "Profile", icon: User, href: "/profile" },
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
      {
        label: "Become a host",
        description: "It's easy to start hosting and earn extra income.",
        icon: Home,
        href: "/become-host",
        hasImage: true,
      },
    ],
  },
  {
    items: [
      { label: "Refer a Host", icon: UserPlus, href: "/refer" },
      { label: "Find a co-host", icon: Users, href: "/co-host" },
      { label: "Gift cards", icon: Gift, href: "/gift-cards" },
    ],
  },
];

interface UserMenuButtonProps {
  onBecomeHost?: () => void;
}

export default function UserMenuButton({ onBecomeHost }: UserMenuButtonProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isOpen, toggle, close, menuRef } = useUserMenu();

  // Get user initial for avatar
  const userInitial =
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  // Click on avatar → go to profile
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    close();
    router.push("/authenticatedUser");
  };

  // Click on hamburger → toggle menu
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  const handleItemClick = (href: string, label: string) => {
    close();

    if (label === "Become a host" && onBecomeHost) {
      onBecomeHost();
      return;
    }

    router.push(href);
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
        className="w-10 h-10 rounded-full border border-pink-600 bg-[#E31C79] hover:shadow-lg hover:brightness-110 transition-all duration-200 flex items-center justify-center p-0.5 shadow-sm"
        aria-label="Go to profile"
      >
        <div className="w-full h-full rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">{userInitial}</span>
        </div>
      </button>

      {/* Hamburger Icon - Opens dropdown */}
      <button
        onClick={handleMenuToggle}
        className={`w-10 h-10 flex items-center justify-center rounded-full border border-pink-600 bg-[#E31C79] hover:shadow-lg hover:brightness-110 transition-all duration-200 shadow-sm ${isOpen ? 'ring-2 ring-pink-300 ring-offset-1 shadow-md' : ''}`}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5 text-white" />
      </button>
    </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {/* Section divider (except for first section) */}
              {sectionIdx > 0 && <div className="border-t border-gray-100 my-2" />}

              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleItemClick(item.href, item.label)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 group"
                >
                  <item.icon className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <span className="text-gray-800 text-sm font-medium block">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="text-gray-500 text-xs leading-tight block mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </div>

                  {/* Host illustration placeholder */}
                  {item.hasImage && (
                    <div className="w-12 h-12 shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-pink-100 to-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🏠</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ))}

          {/* Logout - Always at bottom */}
          <div className="border-t border-gray-100 my-2" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-800 text-sm font-medium"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}