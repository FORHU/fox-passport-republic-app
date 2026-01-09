import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Grid3X3 } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { getIconComponent } from "@/components/categories/icon-utils";
import { Category } from "@/data/categories"; // Assuming this exists, catch if error

interface CategoryHeaderProps {
  category: Category;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({ category }) => {
  const router = useRouter();
  const CategoryIcon = category ? getIconComponent(category.icon) : Grid3X3;

  return (
    <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4">
        <div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
          
          {/* Logo */}
          <BrandLogo logoSize={48} textSize="text-2xl" />

          {/* Nav Pill */}
          <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
            <Link href="/" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all">
              Explore
            </Link>
            <div className="h-4 w-px bg-white/10"></div>
            <span className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)] flex items-center gap-2">
              <CategoryIcon className="w-4 h-4" />
              {category.title}
            </span>
          </nav>

          {/* Close / Action */}
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white hover:text-black transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
