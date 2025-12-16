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

  // Derived styles based on state - white tinted blur
  const navBgClass = isScrolled || mobileMenuOpen
    ? "bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-lg"
    : "bg-transparent bg-gradient-to-b from-black/50 to-transparent";

  // Keep text white in both states since blur is light/transparent
  const textColorClass = "text-gray-200 hover:text-white";
  const logoTextClass = "text-white";
  const mainLinkClass = "text-white hover:text-gray-200";

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