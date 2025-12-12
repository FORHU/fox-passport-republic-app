"use client";

import BusinessCard from "@/src/components/BusinessCard";

// Full data set (9 items)
const activities = [
  {
    id: 1,
    user: { name: "Brandon R.", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80", action: "Review", time: "Just now" },
    business: { name: "Las Mestizas", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60", rating: 4.8, category: "Mexican" },
    content: { text: "Was absolutely craving a breakfast burrito..." },
  },
  {
    id: 2,
    user: { name: "Holly P.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", action: "Review", time: "1 hr ago" },
    business: { name: "Virginia Cleaners", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=60", rating: 5.0, category: "Dry Cleaning" },
    content: { text: "I am so happy with my dress and cardigan..." },
  },
  {
    id: 3,
    user: { name: "Jeremy D.", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80", action: "Photo", time: "2 hrs ago" },
    business: { name: "Paraiso Plant Studio", rating: 4.9, category: "Nurseries" },
    content: { images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=60"] },
  },
  {
    id: 4,
    user: { name: "Sarah M.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80", action: "Review", time: "3 hrs ago" },
    business: { name: "Joe's Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60", rating: 4.7, category: "Pizza" },
    content: { text: "Best pizza in town hands down." },
  },
  {
    id: 5,
    user: { name: "Michael B.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80", action: "Review", time: "5 hrs ago" },
    business: { name: "The Coffee Bean", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=500&q=60", rating: 3.5, category: "Coffee & Tea" },
    content: { text: "Good coffee, but the wait time was a bit long." },
  },
  {
    id: 6,
    user: { name: "Jessica L.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80", action: "Photo", time: "6 hrs ago" },
    business: { name: "Golden Gate Park", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=500&q=60", rating: 4.8, category: "Parks" },
    content: { images: ["https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=500&q=60"] },
  },
  { id: 7, user: { name: "David K.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", action: "Review", time: "1 day ago" }, business: { name: "Burger King", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=500&q=60", rating: 2.5, category: "Fast Food" }, content: { text: "Fries were cold, unfortunately." } },
  { id: 8, user: { name: "Emily R.", image: "https://images.unsplash.com/photo-1554151228-14d9def656ec?auto=format&fit=crop&w=100&q=80", action: "Photo", time: "1 day ago" }, business: { name: "Blue Bottle", rating: 4.9, category: "Coffee" }, content: { images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=60"] } },
  { id: 9, user: { name: "Chris T.", image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=100&q=80", action: "Review", time: "2 days ago" }, business: { name: "Sushi Place", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=60", rating: 4.2, category: "Japanese" }, content: { text: "Fresh fish and great service." } },
];

export default function RecentActivity() {
  return (
    <section className="py-16 px-6 md:px-10 bg-white">
      {/* Container Constraint: 
        'max-w-5xl' ensures the grid doesn't stretch too wide on big screens, 
        keeping the cards looking "smaller" and compact.
      */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Recent Activity
        </h2>
        
        {/* Grid Layout:
           - md:grid-cols-3 creates the requested 3x3 layout.
           - gap-6 provides the spacious look from your example image.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <BusinessCard key={activity.id} data={activity} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="text-black font-semibold hover:bg-gray-100 border border-black px-6 py-3 rounded-lg text-sm transition-colors">
            Show more
          </button>
        </div>
      </div>
    </section>
  );
}