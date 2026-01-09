import React from 'react';
import Image from 'next/image';

interface SavedVibe {
    id: number;
    title: string;
    location: string;
    image: string;
    status: 'open' | 'upcoming' | 'sold_out';
}

interface UserSavedVibesProps {
    savedVibes: SavedVibe[];
}

export const UserSavedVibes: React.FC<UserSavedVibesProps> = ({ savedVibes }) => {
  return (
    <div className="glass-panel rounded-[2.5rem] p-6 reveal-on-scroll" style={{ transitionDelay: '300ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-white">Saved Vibes</h3>
                  <span className="text-xs text-text-muted">{savedVibes.length} Items</span>
                </div>
                <div className="space-y-4">
                  {savedVibes.map((item) => (
                    <div key={item.id} className="flex gap-4 p-2 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group">
                      <Image 
                        className="h-16 w-16 rounded-xl object-cover group-hover:scale-105 transition-transform" 
                        src={item.image}
                        alt={item.title}
                        width={64}
                        height={64}
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-sm mb-1 group-hover:text-accent transition-colors">{item.title}</h4>
                        <p className="text-xs text-text-muted mb-2">{item.location}</p>
                        {item.status === 'open' && (
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            <span className="text-[10px] text-green-500 font-bold">Open Now</span>
                          </div>
                        )}
                        {item.status === 'upcoming' && (
                          <span className="text-[10px] text-gray-400">Next Weekend</span>
                        )}
                        {item.status === 'sold_out' && (
                          <span className="text-[10px] text-red-400">Sold Out</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors">
                  View All Favorites
                </button>
              </div>
  );
};
