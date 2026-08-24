"use client";

import { FormEvent, useState } from "react";
import { motion } from "motion/react";
import api from "@/shared/lib/axios";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await api.post("/newsletter/subscribe", { email });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-8 sm:py-20 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="bg-linear-to-br from-primary via-purple-900 to-black rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl border border-white/10 group hover:border-white/20 transition-all"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
        >
          {/* Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-50%] left-[-20%] w-full h-full rounded-full bg-[#ccff00] blur-[150px] opacity-20 animate-pulse-slow"></div>
            <div className="absolute bottom-[-50%] right-[-20%] w-full h-full rounded-full bg-secondary blur-[150px] opacity-30"></div>
            <div
              className="absolute inset-0 opacity-10 animate-spin-slow origin-center"
              style={{
                backgroundImage:
                  "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            ></div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-block py-1 px-3 sm:py-1.5 sm:px-4 rounded-full bg-white text-black text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-8 shadow-glow animate-bounce">
              Weekly Digest
            </span>

            <h2 className="text-[1.75rem] sm:text-5xl md:text-7xl font-display font-bold text-white mb-4 sm:mb-8 leading-tight group-hover:scale-105 transition-transform duration-500">
              FOMO is real.
              <br />
              Don&apos;t let it win.
            </h2>

            <p className="text-xs sm:text-xl text-gray-200 mb-5 sm:mb-12 font-light">
              Get the freshest drops on underground parties, secret pop-ups, and
              limited adventures straight to your inbox.
            </p>

            {status === "success" ? (
              <div className="max-w-lg mx-auto py-4 sm:py-6 text-center">
                <p className="text-[#ccff00] font-bold text-base sm:text-xl mb-1">You&apos;re on the list!</p>
                <p className="text-white/60 text-xs sm:text-sm">We&apos;ll drop the freshest updates straight to your inbox.</p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto"
              >
                <input
                  className="flex-1 rounded-full bg-black/40 border border-white/20 text-white placeholder-gray-400 px-4 py-3 sm:px-8 sm:py-5 focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:bg-black/60 transition-all font-medium backdrop-blur-sm text-xs sm:text-base disabled:opacity-50"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                  required
                  disabled={status === "loading"}
                />
                <button
                  className="bg-[#ccff00] text-black font-bold text-xs sm:text-lg px-5 py-3 sm:px-10 sm:py-5 rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  type="submit"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Subscribing…" : "Subscribe"}
                </button>
              </form>
            )}

            {status === "error" && (
              <p className="mt-2 text-red-400 text-xs sm:text-sm text-center">Something went wrong. Please try again.</p>
            )}

            <p className="mt-4 sm:mt-8 text-[10px] sm:text-xs text-white/50 font-medium tracking-wide">
              WE RESPECT YOUR INBOX. NO SPAM, JUST VIBES.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
