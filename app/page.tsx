import SearchBar from "@/src/components/SearchBar";
import BusinessCard from "@/src/components/BusinessCard";

export default function Home() {
  // Dummy data for example
  const businesses = [
    { name: "Joe's Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591", rating: 4.5, reviewCount: 230, tags: ["Pizza", "Italian"], price: "$$" },
    { name: "Sushi Zen", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c", rating: 5, reviewCount: 120, tags: ["Sushi", "Japanese"], price: "$$$" },
    { name: "Burger King", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", rating: 3.5, reviewCount: 50, tags: ["Burgers", "Fast Food"], price: "$" },
    { name: "Pasta House", image: "https://images.unsplash.com/photo-1551183053-bf91b1dca034", rating: 4, reviewCount: 85, tags: ["Italian", "Pasta"], price: "$$" },
  ];

  return (
    <main className="min-h-screen">
      {/* HERO SECTION */}
      <div className="relative w-full h-[500px] md:h-[600px] bg-black">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-60 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')] bg-cover bg-center"
        ></div>
        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center h-full">
          <div className="mt-20 md:mt-32 flex flex-col items-center text-center px-4 w-full max-w-4xl">
             {/* Logo / Brand Icon can go here */}
             <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
               Burritos in San Francisco
             </h1>
             {/* Big Search Bar */}
             <div className="w-full">
               <SearchBar isHero={true} />
             </div>
             
             <div className="mt-4 flex gap-4 text-white text-sm font-medium">
               <span className="hover:underline cursor-pointer">Restaurants</span>
               <span className="hover:underline cursor-pointer">Home Services</span>
               <span className="hover:underline cursor-pointer">Auto Services</span>
               <span className="hover:underline cursor-pointer">More</span>
             </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY / CARDS SECTION */}
      <div className="py-16 px-6 md:px-20 bg-white">
        <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businesses.map((biz, i) => (
            <BusinessCard key={i} data={biz} />
          ))}
        </div>
      </div>
    </main>
  );
}