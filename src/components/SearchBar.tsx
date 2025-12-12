import { Search } from "lucide-react";

export default function SearchBar({ isHero = false }: { isHero?: boolean }) {
  return (
    <div className={`flex w-full ${isHero ? "h-12 md:h-14 shadow-xl" : "h-10 shadow-sm"} rounded-md overflow-hidden flex-col md:flex-row`}>
      {/* "Find" Section */}
      <div className="flex-1 bg-white flex items-center px-4 border-b md:border-b-0 md:border-r border-gray-300">
        <span className="font-bold text-gray-700 mr-2">Find</span>
        <input 
          type="text" 
          placeholder="tacos, cheap dinner, Max's" 
          className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
        />
      </div>

      {/* "Near" Section */}
      <div className="flex-1 bg-white flex items-center px-4 border-r border-gray-300">
        <span className="font-bold text-gray-700 mr-2">Near</span>
        <input 
          type="text" 
          placeholder="San Francisco, CA" 
          className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
        />
      </div>

      {/* Search Button */}
      <button className={`bg-red-600 hover:bg-red-700 text-white flex items-center justify-center ${isHero ? "w-full md:w-16" : "w-12"}`}>
        <Search className="w-5 h-5" strokeWidth={3} />
      </button>
    </div>
  );
}