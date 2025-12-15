"use client";

import BusinessCard from "@/src/components/BusinessCard";

// Expanded data to show off the grid effect
const activities = [
  {
    id: "tagaytay-1", 
    user: { name: "Bea A.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", action: "Wrote a review", time: "Just now" },
    business: { name: "Serene Lakeview Villa", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=60", rating: 4.9, category: "Villa" },
    content: { text: "The view of Taal Lake was breathtaking! Perfect for our intimate wedding." },
  },
  {
    id: "cebu-1",
    user: { name: "Marco P.", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80", action: "Wrote a review", time: "2 hrs ago" },
    business: { name: "IT Park Modern Condo", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=60", rating: 4.8, category: "Condo" },
    content: { text: "Spacious and modern. The internet was fast for my work." },
  },
  {
    id: "boracay-1",
    user: { name: "Jenny L.", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80", action: "Added photos", time: "3 hrs ago" },
    business: { name: "Station 1 Resort", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=500&q=60", rating: 4.9, category: "Beach Resort" },
    content: { images: ["https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=500&q=60"] },
  },
  {
    id: "makati-1",
    user: { name: "Miguel T.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", action: "Wrote a review", time: "5 hrs ago" },
    business: { name: "Skyline Loft Poblacion", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=60", rating: 4.85, category: "Apartment" },
    content: { text: "The nightlife here is amazing. Great host!" },
  },
  {
    id: "baguio-1",
    user: { name: "Sarah K.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80", action: "Wrote a review", time: "6 hrs ago" },
    business: { name: "The Pine Cabin", image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=500&q=60", rating: 4.95, category: "Cabin" },
    content: { text: "So cozy! The real fireplace was the highlight." },
  },
  {
    id: "elnido-1",
    user: { name: "Chris D.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80", action: "Added photos", time: "1 day ago" },
    business: { name: "Bamboo Villa El Nido", image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=60", rating: 4.95, category: "Villa" },
    content: { images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=60"] },
  },
  {
    id: "davao-1",
    user: { name: "Anna M.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", action: "Wrote a review", time: "2 days ago" },
    business: { name: "Marco Polo Residences", image: "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?auto=format&fit=crop&w=500&q=60", rating: 4.8, category: "Apartment" },
    content: { text: "Great amenities and very secure." },
  },
  {
    id: "siargao-1",
    user: { name: "Jake R.", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80", action: "Added photos", time: "3 days ago" },
    business: { name: "Cloud 9 Surf Hut", image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=60", rating: 4.7, category: "Hut" },
    content: { images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=60"] },
  },
  {
    id: "manila-1",
    user: { name: "Elena S.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80", action: "Wrote a review", time: "4 days ago" },
    business: { name: "Historic Intramuros Suite", image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=500&q=60", rating: 4.9, category: "Suite" },
    content: { text: "Living inside the walled city was magical." },
  },
  // --- NEW ITEM TO FILL THE GAP ---
  {
    id: "coron-1",
    user: { name: "Rico J.", image: "https://images.unsplash.com/photo-1522075469751-3a3694c2d674?auto=format&fit=crop&w=100&q=80", action: "Added photos", time: "5 days ago" },
    business: { name: "Twin Lagoon Resort", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=500&q=60", rating: 4.95, category: "Resort" },
    content: { images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=500&q=60"] },
  },
];

export default function RecentActivity() {
  
  // A pattern that repeats to create a "random" feel without breaking hydration
  const getSize = (i: number) => {
    const pattern = [
      { span: "md:col-span-2 md:row-span-2", variant: "square" }, // Big Block
      { span: "md:col-span-1 md:row-span-2", variant: "tall" },   // Tall Portrait
      { span: "md:col-span-1 md:row-span-1", variant: "square" }, // Small Square
      { span: "md:col-span-2 md:row-span-1", variant: "wide" },   // Wide Landscape
      { span: "md:col-span-1 md:row-span-1", variant: "square" }, // Small Square
      { span: "md:col-span-1 md:row-span-1", variant: "square" }, // Small Square
    ];
    return pattern[i % pattern.length];
  };

  return (
    <section className="py-6 px-2 md:py-16 md:px-10 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-8 px-1 text-center">
          Recent Activity
        </h2>
        
        {/* GRID CONFIG:
            - grid-cols-4: 4 columns on desktop
            - auto-rows-[250px]: Forces consistent height for rows
            - grid-flow-dense: Fills in empty gaps automatically
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[250px] grid-flow-dense">
          {activities.map((activity, index) => {
            const { span, variant } = getSize(index);
            
            return (
              <div key={activity.id} className={`${span} w-full h-full`}>
                <BusinessCard 
                  data={activity} 
                  // We cast the string to the specific union type required by BusinessCard
                  variant={variant as "square" | "wide" | "tall"} 
                />
              </div>
            );
          })}
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