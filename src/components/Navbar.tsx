"use client"; 
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Import Auth Modal (Same directory)
import AuthModal from "./AuthModal";
// Import Store (Go up to src, then store)
import { useAuthStore } from "../store/useAuthStore";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { openLogin, openSignup } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 z-50 w-full p-4 md:px-10 flex flex-col md:flex-row items-center gap-4 transition-all duration-300 ${
          isScrolled 
            ? "bg-white text-gray-900 shadow-md"  
            : "bg-transparent text-white"        
        }`}
      >
        <div className="w-full md:w-auto md:flex-1 flex justify-between md:justify-start items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/foxpasslogo.png" 
              alt="FoxPassport Logo" 
              width={200} 
              height={150}
              className="h-20 md:h-20 w-auto"
            />
            <span className="text-2xl font-bold tracking-tight">
              <span className={isScrolled ? "text-gray-900" : "text-white"}>
                Fox
              </span>
              <span className="text-pink-500">Passport</span>
            </span>
          </Link>
          {/* Mobile Menu Toggle (Hidden for simplicity) */}
        </div>

        <div className="hidden md:flex md:flex-1 justify-end gap-4 items-center text-sm font-semibold">
          <Link href="/become-a-foxer" className="hover:underline">Become a Foxer</Link>
          <Link href="#" className="hover:underline">Write a Review</Link>
          <Link href="#" className="hover:underline">For Businesses</Link>
          
          <div className="flex gap-2">
            <button 
              onClick={openLogin}
              className={`px-4 py-2 bg-transparent border rounded transition ${
                isScrolled 
                  ? "border-gray-300 text-gray-900 hover:bg-gray-100" 
                  : "border-white text-white hover:bg-white/20"       
              }`}
            >
              Log In
            </button>

            <button 
              onClick={openSignup}
              className="px-4 py-2 bg-pink-600 border border-pink-600 text-white rounded hover:bg-pink-700 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>
      
      {/* Modal Component */}
      <AuthModal />
    </>
  );
}