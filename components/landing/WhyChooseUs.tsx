"use client";

import React from "react";

const FEATURES = [
  {
    icon: "location_on",
    title: "Diverse Locations",
    description:
      "From hidden beaches to city rooftops, explore venues across the archipelago.",
    gradient: "from-orange-400 to-red-500",
  },
  {
    icon: "verified",
    title: "Verified Experiences",
    description:
      "We personally verify every adventure, restaurant, and venue for quality assurance.",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    icon: "group",
    title: "Community Connect",
    description:
      "Join local groups for hiking, dining, or jamming sessions.",
    gradient: "from-purple-500 to-indigo-600",
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Why Us</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Why Choose <span className="text-gradient">Foxxing</span>?
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            We simplify discovery across the Philippines so you can focus on the experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 reveal-on-scroll">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="glass-card rounded-3xl p-8 text-left card-hover-effect border border-white/5 group"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-white text-3xl">
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
