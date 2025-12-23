"use client";

import {
  Utensils, ShoppingBag, Sparkles, Target, Scissors, Car, Home, MoreHorizontal,
  Coffee, Pizza, Palette, Stethoscope, Briefcase, Dog, Building, Plane,
  Wrench, CalendarHeart, Landmark, CircleDollarSign, GraduationCap, Church, MapPin, Tv, X
} from "lucide-react";
import { useCategoryNavigation } from "@/hooks/useCategoryNavigation";

// --- STATIC DATA ---
const mainCategories = [
  { icon: Utensils, label: "Restaurants" },
  { icon: ShoppingBag, label: "Shopping" },
  { icon: Sparkles, label: "Nightlife" },
  { icon: Target, label: "Active Life" },
  { icon: Scissors, label: "Beauty & Spas" },
  { icon: Car, label: "Automotive" },
  { icon: Home, label: "Home Services" },
  { icon: MoreHorizontal, label: "More" },
];

const moreCategories = [
  { icon: Coffee, label: "Coffee & Tea" },
  { icon: Pizza, label: "Food" },
  { icon: Palette, label: "Arts & Entertainment" },
  { icon: Stethoscope, label: "Health & Medical" },
  { icon: Briefcase, label: "Professional Services" },
  { icon: Dog, label: "Pets" },
  { icon: Building, label: "Real Estate" },
  { icon: Plane, label: "Hotels & Travel" },
  { icon: Wrench, label: "Local Services" },
  { icon: CalendarHeart, label: "Event Planning & Services" },
  { icon: Landmark, label: "Public Services & Government" },
  { icon: CircleDollarSign, label: "Financial Services" },
  { icon: GraduationCap, label: "Education" },
  { icon: Church, label: "Religious Organizations" },
  { icon: MapPin, label: "Local Flavor" },
  { icon: Tv, label: "Mass Media" },
];

export default function Categories() {
  const { isMoreOpen, selectCategory, closeModal } = useCategoryNavigation();

  return (
    <section className="py-8 px-4 md:py-16 md:px-20 bg-gray-50/50 relative">
      {/* --- DEFINING THE SVG GRADIENT --- */}
      {/* This svg is hidden but defines the gradient we can reference by ID */}
      <svg width="0" height="0" className="absolute">
        <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop stopColor="#ec4899" offset="0%" /> {/* pink-500 */}
          <stop stopColor="#e11d48" offset="100%" /> {/* rose-600 */}
        </linearGradient>
      </svg>

      <h2 className="text-xl md:text-3xl font-bold mb-6 md:mb-10 text-center text-black">
        Categories
      </h2>
      
      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-6xl mx-auto">
        {mainCategories.map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => selectCategory(label)}
            className="flex flex-col items-center justify-center p-4 md:p-8 bg-white rounded-lg md:rounded-xl border border-gray-200 hover:shadow-lg transition-all active:scale-95 duration-200 group"
          >
            {/* APPLIED THE GRADIENT HERE using stroke="url(#id)" */}
            <Icon 
              className="w-6 h-6 md:w-10 md:h-10 mb-2 md:mb-4 group-hover:scale-110 transition-transform" 
              strokeWidth={1.5} 
              stroke="url(#pink-gradient)"
            />
            <span className="text-xs md:text-lg font-semibold text-gray-800 text-center">{label}</span>
          </button>
        ))}
      </div>

      {/* --- MORE MODAL OVERLAY --- */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
              <h3 className="text-lg md:text-2xl font-bold text-gray-900">More Categories</h3>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Grid Content */}
            <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
                {moreCategories.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    onClick={() => selectCategory(label)}
                    className="flex flex-col items-center justify-center p-4 md:p-6 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50/50 hover:shadow-md transition-all group"
                  >
                    {/* APPLIED THE GRADIENT HERE using stroke="url(#id)" */}
                    <Icon 
                      className="w-8 h-8 mb-3 transition-transform group-hover:scale-110" 
                      strokeWidth={1.5} 
                      stroke="url(#pink-gradient)"
                    />
                    <span className="text-xs md:text-sm font-semibold text-gray-700 group-hover:text-gray-900 text-center leading-tight">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-100 md:hidden">
               <button 
                 onClick={closeModal}
                 className="w-full py-3 bg-gray-100 text-gray-800 font-bold rounded-xl active:scale-95 transition-transform"
               >
                 Close
               </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}