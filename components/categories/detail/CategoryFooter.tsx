import React from "react";
import { BrandLogo } from "@/components/shared/BrandLogo";

export const CategoryFooter: React.FC = () => {
  return (
    <footer className="bg-black pt-20 pb-10 border-t border-white/10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <BrandLogo logoSize={40} textSize="text-xl" />
          <p className="text-xs text-gray-600 font-medium">© 2026 FoxPassport Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
