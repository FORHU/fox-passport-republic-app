"use client";

import React from "react";
import { Map, BadgeCheck, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Map,
    title: "Diverse Locations",
    description:
      "From hidden beaches to city rooftops, explore venues across the archipelago.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Experiences",
    description:
      "We personally verify every adventure, restaurant, and venue for quality assurance.",
  },
  {
    icon: Users,
    title: "Community Connect",
    description:
      "Join local groups for hiking, dining, or jamming sessions.",
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-700 mb-4">
          Why Choose FoxPassport?
        </h2>
        <p className="text-gray-500 mb-10 max-w-2xl mx-auto">
          We simplify discovery across the Philippines so you can focus on the
          experience.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white p-10 rounded-[2.5rem] text-left shadow-sm hover:shadow-md transition-all border border-gray-50"
              >
                <div className="h-12 w-12 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
