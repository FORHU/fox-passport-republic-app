"use client";

import Link from "next/link";
import BusinessCard from "@/src/components/BusinessCard";

// --- RESTORED DATA ARRAY ---
const activities = [
  {
    id: "tagaytay-1", 
    user: { name: "Bea A.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", action: "Wrote a review", time: "Just now" },
    business: { 
      name: "Serene Lakeview Villa", 
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=60", 
      rating: 4.9, 
      category: "Villa" 
    },
    content: { text: "The view of Taal Lake was breathtaking! Perfect for our intimate wedding." },
  },
  {
    id: "cebu-1",
    user: { name: "Marco P.", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80", action: "Wrote a review", time: "2 hrs ago" },
    business: { 
      name: "IT Park Modern Condo", 
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=60", 
      rating: 4.8, 
      category: "Condo" 
    },
    content: { text: "Spacious and modern. The internet was fast for my work." },
  },
  {
    id: "boracay-1",
    user: { name: "Jenny L.", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80", action: "Added photos", time: "3 hrs ago" },
    business: { 
      name: "Station 1 Resort", 
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=500&q=60", 
      rating: 4.9, 
      category: "Beach Resort" 
    },
    content: { images: ["https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=500&q=60"] },
  },
  {
    id: "makati-1",
    user: { name: "Miguel T.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", action: "Wrote a review", time: "5 hrs ago" },
    business: { 
      name: "Skyline Loft Poblacion", 
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=60", 
      rating: 4.85, 
      category: "Apartment" 
    },
    content: { text: "The nightlife here is amazing. Great host!" },
  },
  {
    id: "baguio-1",
    user: { name: "Sarah K.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80", action: "Wrote a review", time: "6 hrs ago" },
    business: { 
      name: "The Pine Cabin", 
      image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=500&q=60", 
      rating: 4.95, 
      category: "Cabin" 
    },
    content: { text: "So cozy! The real fireplace was the highlight." },
  },
  {
    id: "elnido-1",
    user: { name: "Chris D.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80", action: "Added photos", time: "1 day ago" },
    business: { 
      name: "Bamboo Villa El Nido", 
      image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=60", 
      rating: 4.95, 
      category: "Villa" 
    },
    content: { images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=60"] },
  },
];

export default function RecentActivity() {
  return (
    <section className="py-6 px-2 md:py-16 md:px-10 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-8 px-1 text-center">
          Recent Activity
        </h2>
        
        <div className="grid grid-cols-3 gap-2 md:gap-6">
          {activities.map((activity) => (
            <Link key={activity.id} href={`/venue/${activity.id}`}>
               <div className="cursor-pointer hover:opacity-90 transition-opacity">
                 <BusinessCard data={activity} />
               </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-6 md:mt-12 text-center">
          <button className="text-black font-semibold hover:bg-gray-100 border border-black px-4 py-2 rounded-lg text-xs md:text-sm transition-colors w-full md:w-auto">
            Show more
          </button>
        </div>
      </div>
    </section>
  );
}