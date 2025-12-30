
import React from "react";
import { useFeaturedImages } from "./useFeaturedImages";

const HeroCarousel: React.FC = () => {
  const { currentImageIndex, setCurrentImageIndex, featuredImages } = useFeaturedImages();

  return (
    <div className="flex-1 w-full relative">
      <div className="relative rounded-3xl overflow-hidden aspect-[1.3/1] shadow-2xl shadow-gray-300">
        {/* All images stacked, with opacity transition */}
        {featuredImages.map((image, index) => (
          <img
            key={image.label}
            src={image.url}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            alt={image.title}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-8 left-8 text-white">
          <p className="text-sm font-medium opacity-80 mb-1 uppercase tracking-wider">
            {featuredImages[currentImageIndex].label}
          </p>
          <h3 className="text-2xl font-extrabold transition-all duration-500">
            {featuredImages[currentImageIndex].title}
          </h3>
        </div>

        {/* Photo credit */}
        <div className="absolute bottom-3 left-8 text-white/50 text-[9px] font-medium">
          {featuredImages[currentImageIndex].credit}
        </div>

        {/* Image indicators */}
        <div className="absolute bottom-8 right-8 flex gap-1.5">
          {featuredImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-pink-500/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

export default HeroCarousel;
