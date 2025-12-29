"use client";

import React, { useState } from "react";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <section className="px-4 py-12 md:py-24 max-w-7xl mx-auto">
      <div className="relative rounded-[3rem] bg-primary overflow-hidden px-8 py-16 md:px-16 md:py-24 text-center">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Never miss a new experience.
          </h2>
          <p className="text-lg text-white/80 mb-10">
            Sign up for our weekly digest of the best upcoming adventures and
            events.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border-none backdrop-blur-md placeholder:text-white/60 text-white focus:ring-2 focus:ring-white transition-all outline-none"
            />
            <button
              type="submit"
              className="bg-white text-primary font-bold px-8 py-4 rounded-2xl shadow-xl hover:bg-gray-50 transition-all active:scale-95"
            >
              Subscribe
            </button>
          </form>

          <p className="mt-6 text-sm text-white/50">
            No spam, just good vibes. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
