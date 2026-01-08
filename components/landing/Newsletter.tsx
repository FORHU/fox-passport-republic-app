"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[3rem] glass-card border border-white/10 overflow-hidden px-8 py-12 md:px-16 md:py-16 text-center reveal-on-scroll">
          {/* Gradient blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-accent/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px]"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 rounded-full translate-x-1/3 translate-y-1/3 blur-[100px]"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_#ccff00] animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-white/90">
                Stay Connected
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Never miss a new <span className="text-gradient">experience</span>.
            </h2>
            <p className="text-lg text-text-muted mb-10 max-w-xl mx-auto">
              Sign up for our weekly digest of the best upcoming adventures, exclusive events, and curated experiences.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                icon="mail"
                iconPosition="left"
                className="flex-1 h-14 text-base"
              />
              <Button
                type="submit"
                variant="neon"
                size="lg"
                className="sm:px-8 h-14 rounded-2xl shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] hover:scale-105 transition-all"
              >
                <span className="material-symbols-outlined">send</span>
                Subscribe
              </Button>
            </form>

            <p className="text-sm text-text-muted flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-accent text-[16px]">verified_user</span>
              No spam, just good vibes. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
