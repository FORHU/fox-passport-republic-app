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
  const navBgClass = isScrolled || mobileMenuOpen
    ? "bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-lg"
    : "bg-transparent bg-gradient-to-b from-black/50 to-transparent";

  // Dark text when scrolled, white text when at top
  const textColorClass = isScrolled 
    ? "text-gray-800 hover:text-pink-600" 
    : "text-gray-200 hover:text-white";
  
  const logoTextClass = isScrolled 
    ? "text-gray-800" 
    : "text-white";
  
  const mainLinkClass = isScrolled 
    ? "text-gray-800 hover:text-pink-600" 
    : "text-white hover:text-gray-200";

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
      textColorClass,
      logoTextClass,
      mainLinkClass
    }
  };
}