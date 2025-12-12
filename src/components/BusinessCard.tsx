import Image from "next/image";

interface BusinessProps {
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  price: string;
}

export default function BusinessCard({ data }: { data: BusinessProps }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2">
        <Image 
          src={data.image} 
          alt={data.name} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <h3 className="font-bold text-lg text-gray-900 group-hover:underline">{data.name}</h3>
      
      <div className="flex items-center gap-2 text-sm mb-1">
        <span className="text-gray-500">{data.reviewCount} reviews</span>
      </div>

      <div className="text-sm text-gray-500 flex gap-2">
        <span className="font-medium text-gray-700">{data.price}</span>
        <span>•</span>
        <span>{data.tags.join(", ")}</span>
      </div>
    </div>
  );
}