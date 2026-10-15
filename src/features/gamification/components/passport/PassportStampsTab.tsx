"use client";

import React from "react";
import { motion } from "motion/react";
import { PassportGrid } from "@/features/gamification/components/PassportStamp";

export interface PassportStampsTabProps {
  stamps: any[];
}

export function PassportStampsTab({ stamps }: PassportStampsTabProps) {
  return (
    <motion.div
      key="stamps"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white/2 border border-white/5 rounded-[3rem] p-8 min-h-[500px]"
    >
      <PassportGrid stamps={stamps} />
      {stamps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 opacity-20 text-center">
          <span className="material-symbols-outlined text-9xl mb-6">
            menu_book
          </span>
          <p className="font-display font-bold text-2xl tracking-tight text-white">
            Your passport is empty
          </p>
          <p className="text-sm mt-2 text-white/60">
            Attend exclusive events to start your collection!
          </p>
        </div>
      )}
    </motion.div>
  );
}
