
import React from "react";

const HeroSocialProof: React.FC = () => {
  return (
    <div className="mt-10 flex items-center gap-3">
      <div className="flex -space-x-3">
        {[1, 2, 3].map((i) => (
          <img
            key={i}
            src={`https://i.pravatar.cc/64?u=user${i + 100}`}
            className="h-9 w-9 rounded-full border-2 border-white object-cover"
            alt="User"
          />
        ))}
        <div className="h-9 w-9 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
          +5k
        </div>
      </div>
      <p className="text-sm font-medium text-gray-500">
        Join 5,000+ happy foxers
      </p>
    </div>
  );
};

export default HeroSocialProof;
