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

  // Derived styles based on state
  const navBgClass = isScrolled || mobileMenuOpen
    ? "bg-white shadow-md border-b border-gray-100"
    : "bg-transparent bg-gradient-to-b from-black/50 to-transparent";

  const textColorClass = isScrolled || mobileMenuOpen ? "text-gray-600 hover:text-black" : "text-gray-200 hover:text-white";
  const logoTextClass = isScrolled || mobileMenuOpen ? "text-gray-900" : "text-white";
  const mainLinkClass = isScrolled || mobileMenuOpen ? "text-gray-900 hover:text-gray-600" : "text-white hover:text-gray-200";

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