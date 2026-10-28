"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/features/gamification/types/gamification";
import { X } from "lucide-react";

interface BadgeModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BadgeModal({
  badge,
  isOpen,
  onClose,
}: BadgeModalProps) {
  if (!badge) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-surface rounded-[3rem] p-8 border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all z-10"
            >
              <X size={20} />
            </button>

            {/* Glowing Background Orb */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[80px] opacity-20 pointer-events-none"
              style={{ backgroundColor: badge.color }}
            />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Badge Icon */}
              <div className="h-32 w-32 rounded-full mb-8 flex items-center justify-center relative shadow-2xl">
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-40"
                  style={{ backgroundColor: badge.color }}
                />
                <div
                  className="relative h-28 w-28 rounded-full flex items-center justify-center border border-white/20 overflow-hidden"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, color-mix(in srgb, ${badge.color} 27%, transparent) 0%, color-mix(in srgb, ${badge.color} 13%, transparent) 100%)`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                  <span
                    className="material-symbols-outlined relative z-10 text-[56px]"
                    style={{ color: "var(--color-white)" }}
                  >
                    {badge.icon}
                  </span>
                </div>
              </div>

              {/* Rarity */}
              <span
                className="text-xs uppercase tracking-[0.3em] font-black mb-2"
                style={{ color: badge.color }}
              >
                {badge.rarity} Badge
              </span>

              {/* Title */}
              <h2 className="text-4xl font-display font-bold text-white mb-4">
                {badge.name}
              </h2>

              {/* Description */}
              <p className="text-lg text-white/60 font-light leading-relaxed mb-8">
                {badge.description}
              </p>

              {/* Action/Footer */}
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-[#CBEB6E] text-[#14161B] font-bold hover:scale-[1.02] transition-transform shadow-glow-accent"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
