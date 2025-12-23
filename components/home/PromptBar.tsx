"use client";

import { Sparkles, ArrowRight, Mic } from "lucide-react";

export default function HeroPromptBar() {
  return (
    <div className="absolute bottom-12 left-0 right-0 z-40 mx-auto w-full max-w-3xl px-4 md:bottom-20">
      {/* The Glass Container */}
      <div className="group relative flex items-center gap-2 rounded-full border border-white/20 bg-black/30 p-2 backdrop-blur-md transition-all hover:bg-black/40 hover:border-white/30 hover:shadow-2xl hover:shadow-pink-500/20">
        
        {/* Icon */}
        <div className="pl-3 text-pink-400">
          <Sparkles className="h-5 w-5" />
        </div>

        {/* Input Field */}
        <input 
          type="text" 
          placeholder="Ask Fox AI to plan your wedding in Baguio..." 
          className="flex-1 bg-transparent px-2 py-3 text-sm text-white placeholder:text-gray-200 focus:outline-none md:text-base"
        />

        {/* Voice Input Icon */}
        <button 
          type="button" 
          className="p-2 text-white hover:text-pink-400 transition-colors"
          aria-label="Voice input"
          onClick={() => console.log("Voice input activated")}
        >
          <Mic className="h-5 w-5" />
        </button>

        {/* Action Button */}
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 text-white transition-transform hover:bg-pink-700 hover:scale-105 active:scale-95">
          <ArrowRight className="h-5 w-5" />
        </button>

      </div>
      
      {/* Optional Helper Text below the bar */}
      <div className="mt-2 text-center text-xs font-medium text-white/80 drop-shadow-md">
        Powered by <span className="text-pink-400">FoxPassport AI</span>
      </div>
    </div>
  );
}