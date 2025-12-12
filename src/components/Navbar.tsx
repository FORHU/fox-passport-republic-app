import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="relative z-50 w-full bg-transparent p-4 md:px-10 flex justify-between items-center text-white">
      {/* Left: Logo (Simple Text for now) */}
      <div className="text-2xl font-bold tracking-tighter">
        FoxPassport
      </div>

      {/* Right: Actions */}
      <div className="flex gap-4 items-center text-sm font-semibold">
        <Link href="#" className="hidden md:block hover:underline">Write a Review</Link>
        <Link href="#" className="hidden md:block hover:underline">For Businesses</Link>
        
        <div className="flex gap-2">
          <Link 
            href="/login" 
            className="px-4 py-2 bg-transparent border border-white rounded hover:bg-white/20 transition"
          >
            Log In
          </Link>
          <Link 
            href="/signup" 
            className="px-4 py-2 bg-red-600 border border-red-600 rounded hover:bg-red-700 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}