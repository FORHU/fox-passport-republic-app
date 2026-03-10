import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function useNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { openLogin, openSignup } = useAuthStore();
  const pathname = usePathname();

  // Check if we're on the landing page (home page without search params)
  const isLandingPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Landing page: solid white at top, transparent with blur when scrolled
  // Other pages: transparent at top, solid when scrolled
  let navBgClass: string;
  let isActiveStyle: boolean;

  if (isLandingPage) {
    // Landing page behavior: solid at top, transparent+blur when scrolled
    if (isScrolled) {
      navBgClass = "bg-white/70 backdrop-blur-xl border-b border-gray-100/50";
      isActiveStyle = true;
    } else {
      navBgClass = "bg-white/95 backdrop-blur-xl border-b border-gray-100";
      isActiveStyle = true;
    }
  } else {
    // Other pages: transparent at top, solid when scrolled
    isActiveStyle = isScrolled || mobileMenuOpen;
    navBgClass = isActiveStyle
      ? "bg-white/95 backdrop-blur-xl border-b border-gray-100"
      : "bg-transparent bg-gradient-to-b from-black/50 to-transparent";
  }

  return {
    isScrolled,
    mobileMenuOpen,
    setMobileMenuOpen,
    activeDropdown,
    setActiveDropdown,
    openLogin,
    openSignup,
    styles: {
      navBgClass,
      logoTextClass: isActiveStyle ? "!text-gray-800" : "!text-white",
      mainLinkClass: isActiveStyle
        ? "!text-gray-800 hover:!text-pink-600"
        : "!text-white hover:!text-gray-200",
      loginButtonClass: isActiveStyle
        ? "border-gray-800 text-gray-800 hover:bg-gray-100"
        : "border-white/80 text-white hover:bg-white/20",
      signupBtnClass: "bg-[#E31C79] text-white hover:bg-pink-700 shadow-md",
    },
  };
}
