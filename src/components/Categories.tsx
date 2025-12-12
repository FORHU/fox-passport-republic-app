// src/components/Categories.tsx
import {
  Utensils,
  ShoppingBag,
  Sparkles,
  Target,
  Scissors,
  Car,
  Home,
  MoreHorizontal,
} from "lucide-react";

const categories = [
  { icon: Utensils, label: "Restaurants" },
  { icon: ShoppingBag, label: "Shopping" },
  { icon: Sparkles, label: "Nightlife" },
  { icon: Target, label: "Active Life" },
  { icon: Scissors, label: "Beauty & Spas" },
  { icon: Car, label: "Automotive" },
  { icon: Home, label: "Home Services" },
  { icon: MoreHorizontal, label: "More" },
];

export default function Categories() {
  return (
    <section className="py-16 px-6 md:px-20 bg-white">
      <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
        Categories
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-centerjustify-center p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Icon className="w-10 h-10 text-red-600 mb-4" strokeWidth={1.5} />
            <span className="text-lg font-semibold text-gray-800">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}