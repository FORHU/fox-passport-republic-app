import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-transparent p-4 md:px-10 flex flex-col md:flex-row items-center text-white gap-4">
      
      {/* Left: Logo (flex-1 to take equal space) */}
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
            <span className="text-white">Fox</span>
            <span className="text-pink-500">Passport</span>
          </span>
        </Link>

        <div className="md:hidden flex gap-2 items-center text-sm font-semibold">
          <Link 
            href="/login" 
            className="px-3 py-1.5 border-color-pink-600 hover:from-pink-600 hover:to-pink-700 transition text-xs"
          >
            Log In
          </Link>
          <Link 
            href="/signup" 
            className="px-3 py-1.5 border-gradient-to-r from-pink-500 to-pink-600 rounded hover:from-pink-600 hover:to-pink-700 transition text-xs"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Right: Actions (Desktop) - flex-1 to balance with left */}
      <div className="hidden md:flex md:flex-1 justify-end gap-4 items-center text-sm font-semibold">
        <Link href="/become-a-foxer" className="hover:underline">Become a Foxer</Link>
        <Link href="#" className="hover:underline">Write a Review</Link>
        <Link href="#" className="hover:underline">For Businesses</Link>
        
        <div className="flex gap-2">
          <Link 
            href="/login" 
            className="px-4 py-2 bg-transparent border border-white rounded hover:bg-white/20 transition"
          >
            Log In
          </Link>
          <Link 
            href="/signup" 
            className="px-4 py-2 bg-pink-600 border border-pink-600 rounded hover:bg-pink-700 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}