"use client";

import BusinessCard from "@/src/components/BusinessCard";

// Expanded to 9 items for a full 3x3 Grid
const activities = [
  {
    id: 1,
    user: { name: "Brandon R.", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80", action: "wrote a review", time: "Just now" },
    business: { name: "Las Mestizas", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60", rating: 4, category: "Mexican" },
    content: { text: "Was absolutely craving a breakfast burrito and wanted to try something new. Las Mestizas did not disappoint!" },
  },
  {
    id: 2,
    user: { name: "Holly P.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", action: "wrote a review", time: "1 minute ago" },
    business: { name: "Virginia Cleaners", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=60", rating: 5, category: "Dry Cleaning" },
    content: { text: "I am so happy with my dress and cardigan cleaned at Virginia Cleaners. Lisa was so nice an..." },
  },
  {
    id: 3,
    user: { name: "Jeremy D.", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80", action: "added 3 photos", time: "4 minutes ago" },
    business: { name: "Paraiso Plant Studio", rating: 5, category: "Nurseries" },
    content: { images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=500&q=60"] },
  },
  {
    id: 4,
    user: { name: "Sarah M.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80", action: "wrote a review", time: "10m ago" },
    business: { name: "Joe's Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60", rating: 5, category: "Pizza" },
    content: { text: "Best pizza in town hands down. The crust was perfect and the toppings were fresh." },
  },
  {
    id: 5,
    user: { name: "Michael B.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80", action: "wrote a review", time: "15m ago" },
    business: { name: "The Coffee Bean", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=500&q=60", rating: 3, category: "Coffee" },
    content: { text: "Good coffee, but the wait time was a bit long this morning. Nice atmosphere though." },
  },
  {
    id: 6,
    user: { name: "Jessica L.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80", action: "added a photo", time: "22m ago" },
    business: { name: "Golden Gate Park", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=500&q=60", rating: 5, category: "Parks" },
    content: { images: ["https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=500&q=60"] },
  },
  // Added 3 placeholders to complete the 3x3 grid
  { id: 7, user: { name: "David K.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", action: "wrote a review", time: "1h ago" }, business: { name: "Burger King", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=500&q=60", rating: 2, category: "Fast Food" }, content: { text: "Fries were cold, unfortunately." } },
  { id: 8, user: { name: "Emily R.", image: "https://images.unsplash.com/photo-1554151228-14d9def656ec?auto=format&fit=crop&w=100&q=80", action: "added a photo", time: "2h ago" }, business: { name: "Blue Bottle", rating: 5, category: "Coffee" }, content: { images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=60"] } },
  { id: 9, user: { name: "Chris T.", image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=100&q=80", action: "wrote a review", time: "3h ago" }, business: { name: "Sushi place", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=60", rating: 4, category: "Japanese" }, content: { text: "Fresh fish and great service." } },
];

export default function RecentActivity() {
  return (
    <section className="py-12 px-4 md:px-10 bg-white border-b border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6 text-center md:text-left">
        Recent Activity
      </h2>
      
      {/* 3 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 
        {/* The 'gap-4' is smaller than 'gap-6' which also helps compact the view */}
        {activities.map((activity) => (
          <BusinessCard key={activity.id} data={activity} />
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <button className="text-[#0073bb] font-semibold hover:underline text-xs flex items-center justify-center gap-1 mx-auto">
          Show more activity
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}