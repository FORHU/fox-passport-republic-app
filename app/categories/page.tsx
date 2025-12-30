"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { useVenueFilter } from "@/hooks/useVenueFilter";
import VenueGrid from "@/components/shared/VenueGrid";
import { 
  Utensils, Mountain, Tent, Music, Building2, 
  PartyPopper, Sparkles, MoreHorizontal, ArrowLeft, Search 
} from "lucide-react";

// Reuse categories from CategoryGrid to keep consistency
const CATEGORIES = [
  { id: "food", name: "Food & Dining", icon: Utensils },
  { id: "adventure", name: "Adventures", icon: Mountain },
  { id: "camping", name: "Camping", icon: Tent },
  { id: "music", name: "Music & Arts", icon: Music },
  { id: "venues", name: "Venues", icon: Building2 },
  { id: "nightlife", name: "Nightlife", icon: PartyPopper },
  { id: "wellness", name: "Wellness", icon: Sparkles },
  { id: "more", name: "More", icon: MoreHorizontal }, // We might filter this out for the list view
];

function CategoriesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const { filterVenues } = useVenueFilter();
  
  // State for search within categories
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter categories based on search
  const filteredCategories = CATEGORIES.filter(cat => 
    cat.id !== 'more' && // Exclude "More" from this list
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryClick = (categoryName: string) => {
     router.push(`/categories?type=${encodeURIComponent(categoryName)}`);
  };

  const handleBack = () => {
    router.push("/categories");
  };

  // --- VIEW: SPECIFIC CATEGORY ---
  if (type) {
    const venues = filterVenues(type, 'category');
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          
          <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
            
            {/* Header / Breadcrumb-ish */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button 
                  onClick={handleBack}
                  className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                 >
                   <ArrowLeft className="w-5 h-5 text-gray-600" />
                 </button>
                 <div>
                   <h1 className="text-3xl font-bold text-gray-900">{type}</h1>
                   <p className="text-gray-500 text-sm mt-1">
                     Explore the best {type.toLowerCase()} spots
                   </p>
                 </div>
              </div>
            </div>

            {/* Venue Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
               <VenueGrid 
                 venues={venues} 
                 emptyMessage={`No venues found for ${type}.`}
               />
            </div>
          </div>
      </div>
    );
  }

  // --- VIEW: ALL CATEGORIES LIST ---
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
             Explore All Categories
           </h1>
           <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
             Browse through our curated collection of experiences, from dining to adventures.
           </p>
           
           {/* Search Box */}
           <div className="max-w-md mx-auto relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input 
               type="text"
               placeholder="Find a category..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
             />
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => {
             const Icon = cat.icon;
             return (
               <button
                 key={cat.id}
                 onClick={() => handleCategoryClick(cat.name)}
                 className="group flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:shadow-pink-500/5 hover:border-pink-100 transition-all duration-300 text-left"
               >
                 <div className="w-16 h-16 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-pink-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-500">
                      Explore
                    </p>
                 </div>
               </button>
             );
          })}
          
          {filteredCategories.length === 0 && (
             <div className="col-span-full text-center py-12 text-gray-400">
                No categories found matching "{searchQuery}"
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading categories...</div>}>
      <CategoriesContent />
    </Suspense>
  );
}
