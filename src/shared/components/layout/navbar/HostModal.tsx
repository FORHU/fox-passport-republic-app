"use client";

import { useState } from "react";
import { X, Home, Tent, ConciergeBell, ArrowRight } from "lucide-react";

interface HostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOptionClick: () => void;
}

export function HostModal({ isOpen, onClose, onOptionClick }: HostModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!isOpen) return null;

  const options = [
    { label: "Home", icon: Home, color: "text-blue-500" },
    { label: "Experience", icon: Tent, color: "text-orange-500" },
    { label: "Service", icon: ConciergeBell, color: "text-gray-700" },
  ];

  const handleNext = () => {
    if (selectedOption) {
      onOptionClick();
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in slide-in-from-top-10 duration-300">
      <div className="relative w-full max-w-sm md:max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header with X button */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 md:px-6 md:pt-5">
          <div className="w-8" />
          <h2 className="text-base md:text-xl font-bold text-center text-gray-800 flex-1">
            What would you like to host?
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition text-gray-500"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 px-4 py-4 md:px-6 md:py-6">
          {options.map((opt, idx) => {
            const Icon = opt.icon;
            const isSelected = selectedOption === opt.label;

            return (
              <button
                key={idx}
                onClick={() => setSelectedOption(opt.label)}
                className={`group flex flex-col items-center justify-center 
                  py-3 px-2 md:py-6 md:px-4 border-2 rounded-xl transition-all duration-300 bg-white
                  ${
                    isSelected
                      ? "border-pink-600 bg-pink-50 shadow-md scale-105"
                      : "border-gray-100 hover:border-gray-300 hover:shadow-lg"
                  }
                `}
              >
                <div className="mb-2 md:mb-4 transform transition-transform duration-300 group-hover:scale-110">
                  <Icon
                    className={`${opt.color} w-6 h-6 md:w-12 md:h-12`}
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className={`text-[11px] md:text-sm font-bold ${isSelected ? "text-pink-600" : "text-gray-800"}`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer with Next button */}
        <div className="flex justify-end px-4 pb-4 md:px-6 md:pb-5">
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className={`px-5 py-2 md:px-6 md:py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 text-sm
              ${
                selectedOption
                  ? "bg-pink-600 text-white hover:bg-pink-700 hover:scale-105 shadow-md cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Next
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default HostModal;
