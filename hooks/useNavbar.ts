import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

export function useNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { openLogin, openSignup } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Derived styles based on state - keep blurry white background, just change text
  const isActive = isScrolled || mobileMenuOpen;

  const navBgClass = isActive
    ? "bg-white/30 backdrop-blur-xl"
    : "bg-transparent bg-gradient-to-b from-black/50 to-transparent";

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
      logoTextClass: isActive ? "!text-gray-800" : "!text-white",
      mainLinkClass: isActive
        ? "!text-gray-800 hover:!text-pink-600"
        : "!text-white hover:!text-gray-200",
      loginButtonClass: isActive
        ? "border-gray-800 text-gray-800 hover:bg-gray-100"
        : "border-white/80 text-white hover:bg-white/20",
      signupBtnClass: "bg-[#E31C79] text-white hover:bg-pink-700 shadow-md",
    },
  };
}
