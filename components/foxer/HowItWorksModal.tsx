"use client";

import React from 'react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: 'explore',
    title: 'Discover',
    description: 'Browse through a curated list of the most exciting events happening in your city, from secret jazz clubs to tech mixers.'
  },
  {
    icon: 'group',
    title: 'Connect',
    description: 'Follow your favorite Foxers (hosts) to stay updated on their latest events and join a community of like-minded people.'
  },
  {
    icon: 'celebration',
    title: 'Experience',
    description: 'Book your spot, grab your friends, and enjoy unforgettable experiences. Everything you need is managed right in your Foxing app.'
  }
];

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <span className="material-symbols-outlined text-gray-400">close</span>
        </button>
        
        <div className="p-8 sm:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">How FoxPassport Works</h2>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">Your journey to discovering the best local experiences starts here.</p>
          </div>
          
          <div className="space-y-10">
            {STEPS.map((step, idx) => (
              <div key={step.title} className="flex gap-6 group">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center shrink-0 mt-1 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                    <span className="material-symbols-outlined text-3xl font-bold">{step.icon}</span>
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest bg-pink-100 px-2 py-0.5 rounded">Step 0{idx + 1}</span>
                    <h3 className="text-xl font-extrabold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-500 font-medium leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={onClose}
            className="w-full mt-12 bg-gray-900 text-white font-extrabold py-4 rounded-2xl hover:bg-black transition-all transform active:scale-[0.98] shadow-lg"
          >
            Got it, let&apos;s go!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;
