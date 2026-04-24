import React from 'react';
import { Lock } from 'lucide-react';

interface ProgressDashboardProps {
  user: any;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ user }) => {
  const currentRole = user?.role?.toLowerCase() || '';
  const isHost = user?.isHost || ['host', 'mayor', 'admin', 'super_admin'].includes(currentRole);
  const isAdmin = ['admin', 'super_admin'].includes(currentRole);

  const checkUnlocked = (itemRole: string) => {
    if (isAdmin) return true;
    const roleLower = itemRole.toLowerCase();
    
    if (roleLower === 'foxer' && currentRole.includes('foxer')) return true;
    if (roleLower === 'mayor' && (currentRole === 'mayor' || isHost)) return true;
    if (roleLower === 'host' && isHost) return true;
    if (roleLower === 'investor' && currentRole === 'investor') return true;
    
    // For testing/fallback: if they are "user" and it's foxer, maybe we lock everything until they choose.
    // The instructions: "if a user only has a role of a foxer, the other progress is locked"
    return false;
  };

  const progressItems = [
    { role: 'Foxer', level: 12, sub: 'Social Butterfly', color: '#f97316', xp: '2,400 / 3,000' },
    { role: 'Mayor', level: 5, sub: 'Venue Curator', color: '#3b82f6', xp: '450 / 1,000' },
    { role: 'Host', level: 18, sub: 'Trailblazer', color: '#22c55e', xp: '4,500 / 5,000' },
    { role: 'Investor', level: 2, sub: 'Seed Funder', color: '#eab308', xp: '150 / 1,000' },
  ];

  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h2 className="text-4xl font-display font-bold text-white mb-3">
          Progress <span className="text-gradient-lime">Dashboard</span>
        </h2>
        <p className="text-white/50 text-lg">Track your journey across FoxPassport.</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {progressItems.map((item, i) => {
          const unlocked = checkUnlocked(item.role);

          return (
            <div 
              key={i} 
              className={`bg-[#1a1a24] rounded-[2.5rem] p-8 flex flex-col items-center transition-transform duration-300 border border-white/5 ${
                unlocked ? 'hover:-translate-y-2 hover:border-white/20' : 'opacity-60 grayscale'
              }`}
            >
              <div className="relative w-40 h-40 mb-6 group">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-white/5" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="8"></circle>
                  {unlocked && (
                    <circle 
                      style={{ color: item.color }} 
                      className="transition-all duration-1000 ease-out" 
                      cx="80" 
                      cy="80" 
                      fill="transparent" 
                      r="70" 
                      stroke="currentColor" 
                      strokeDasharray="440" 
                      strokeDashoffset={440 - (440 * (item.level % 10) / 10)} 
                      strokeLinecap="round" 
                      strokeWidth="8"
                    ></circle>
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  {unlocked ? (
                    <>
                      <span className="text-4xl font-display font-bold text-white">
                        {item.level < 10 ? `0${item.level}` : item.level}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">Level</span>
                    </>
                  ) : (
                    <Lock className="w-10 h-10 text-white/30" />
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-1">{item.role}</h3>
              {unlocked ? (
                <>
                  <p className="text-sm font-bold mb-4 uppercase tracking-wide" style={{ color: item.color }}>{item.sub}</p>
                  <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/5 text-xs font-mono text-gray-300">
                    XP: {item.xp}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold mb-4 uppercase tracking-wide text-white/30">Locked</p>
                  <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/5 text-xs font-mono text-white/20">
                    XP: ??? / ???
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
