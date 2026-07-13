"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import CircularProgress from '@/features/gamification/components/CircularProgress';
import { BadgeGrid } from '@/features/gamification/components/BadgeCard';
import { PassportGrid } from '@/features/gamification/components/PassportStamp';
import {
  PathProgress,
  UserPath,
  XP_REWARDS,
  Badge,
} from '@/features/gamification/types/gamification';
import {
  calculateMasteryLevel,
  formatXP,
  initializePathProgress,
} from '@/features/gamification/lib/gamification';
import BadgeModal from '@/features/gamification/components/BadgeModal';
import { useMyPassport } from '@/features/gamification/hooks/usePassport';

interface PassportClientProps {
  user: any;
}

const PassportClient: React.FC<PassportClientProps> = ({ user }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'progress' | 'stamps' | 'matches'>('matches');
  const [matchSubTab, setMatchSubTab] = useState<'status' | 'ranks'>('status');
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { paths: apiPaths, badges: allBadges, stamps, isLoading } = useMyPassport();

  // Map API roleType[] to gamification UserPath[]
  const roleToPath = (role: string): UserPath | null => {
    if (role === 'host') return 'host';
    if (role === 'mayor') return 'mayor';
    if (role === 'foxerService' || role === 'foxerAsset') return 'foxer';
    return null;
  };
  const rolePaths: UserPath[] = Array.from(
    new Set((user?.roleType as string[] || []).map(roleToPath).filter(Boolean) as UserPath[])
  );
  const activePathTypes: UserPath[] = rolePaths.length > 0 ? [...rolePaths, 'user'] : ['user'];

  // Merge real paths with defaults for roles that have no XP yet
  const filteredPaths: PathProgress[] = activePathTypes.map(
    (pt) => apiPaths.find((p) => p.path === pt) ?? initializePathProgress(pt)
  );

  // Badges: show relevant paths unless "All" is toggled
  const displayBadges = showAllBadges ? allBadges : allBadges.filter(b => !b.path || activePathTypes.includes(b.path));
  const earnedBadges = allBadges.filter(b => !!b.earnedAt);
  const finalLockedIds = allBadges.filter(b => !b.earnedAt).map(b => b.id);

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  const masteryLevel = calculateMasteryLevel(filteredPaths);
  const totalXP = filteredPaths.reduce((sum, path) => sum + path.totalXP, 0);
  const maxTotalXP = activePathTypes.length * 20000;

  const userName = user?.name || user?.username || 'Citizen User';
  const userInitials = userName.charAt(0).toUpperCase();

  // Perks data
  const perks = activePathTypes.flatMap(type => {
    if (type === 'user') return [
      { title: 'Priority Access', desc: 'Skip the line at partner venues', icon: 'confirmation_number' },
      { title: 'Early Bird', desc: 'Book events 24h before others', icon: 'schedule' }
    ];
    if (type === 'foxer') return [
      { title: 'Lower Fees', desc: '5% lower commission on bookings', icon: 'percent' },
      { title: 'Verified Badge', desc: 'Exclusive creator status', icon: 'verified' }
    ];
    if (type === 'host') return [
      { title: 'Analytics Pro', desc: 'Advanced heatmaps for venues', icon: 'analytics' },
      { title: 'Host Support', desc: '24/7 dedicated manager', icon: 'support_agent' }
    ];
    if (type === 'mayor') return [
      { title: 'Venue Authority', desc: 'Priority venue listing approvals', icon: 'assured_workload' },
      { title: 'City Badge', desc: 'Exclusive Mayor verified status', icon: 'account_balance' }
    ];
    return [];
  });

  return (
    <div className="flex h-[90vh] max-h-[1000px] w-full max-w-7xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl relative mx-auto my-auto">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ccff00 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      
      {/* Sidebar */}
      <aside className="w-80 bg-black border-r border-white/5 p-8 flex flex-col relative z-20">
        <Link href="/" className="flex items-center gap-3 mb-12 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image 
              src="/foxonlylogo.png" 
              alt="FoxPassport Logo" 
              width={40} 
              height={40} 
              className="object-contain"
              priority
            />
          </div>
          <div className="relative">
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-[#ccff00] transition-colors">FoxPassport</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#ccff00] group-hover:w-full transition-all duration-300"></span>
          </div>
        </Link>

        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-6">
            <div className="h-28 w-28 rounded-[2rem] bg-white/5 border border-white/10 p-2 group transition-all duration-500 hover:border-[#ccff00]/30">
               <div className="h-full w-full rounded-[1.5rem] bg-white/10 flex items-center justify-center text-4xl font-display font-bold text-white/20 overflow-hidden relative">
                  {user?.imgId ? <img src={user.imgId} className="h-full w-full object-cover" alt="" /> : userInitials}
               </div>
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#ccff00] rounded-full border-4 border-black flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-black text-[18px] font-bold">verified</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-display font-bold text-white mb-1 tracking-tight">{userName}</h2>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
            {activePathTypes
              .filter(p => p !== 'user')
              .map(p => p === 'host' ? 'Host' : p === 'foxer' ? 'Foxer' : p === 'mayor' ? 'Mayor' : p === 'investor' ? 'Investor' : p)
              .join(' · ') || 'Citizen'}
          </p>
        </div>

        <div className="space-y-6 grow overflow-y-auto custom-scrollbar pr-2">
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              <span>Mastery XP</span>
              <span className="text-[#ccff00] font-mono">{formatXP(totalXP)}</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className="h-full bg-linear-to-r from-[#22c55e] to-[#ccff00] transition-all duration-1000 shadow-[0_0_10px_#ccff0044]" 
                style={{ width: `${Math.min(100, (totalXP / maxTotalXP) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Active Perks</p>
            <div className="space-y-4">
              {perks.slice(0, 4).map((perk, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-[#ccff00]">{perk.icon}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">{perk.title}</p>
                    <p className="text-[9px] text-white/30 leading-none">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 flex flex-col gap-3">
          <button 
            onClick={() => setActiveTab('matches')} 
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${activeTab === 'matches' ? 'bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'}`}
          >
            <span className="material-symbols-outlined text-[20px]">handshake</span> Match Status
          </button>
          <button 
            onClick={() => setActiveTab('progress')} 
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${activeTab === 'progress' ? 'bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'}`}
          >
            <span className="material-symbols-outlined text-[20px]">analytics</span> Mastery
          </button>
          <button 
            onClick={() => setActiveTab('stamps')} 
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${activeTab === 'stamps' ? 'bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'}`}
          >
            <span className="material-symbols-outlined text-[20px]">menu_book</span> Passport
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="grow relative overflow-y-auto custom-scrollbar bg-[#050505] z-10">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#ccff00]/5 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="p-12 min-h-full flex flex-col">
          <div className="relative z-20 mb-12 flex justify-between items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight capitalize">
                {activeTab === 'matches' ? 'FoxVerse Progress' : activeTab === 'progress' ? 'Mastery' : 'Journey'}
              </h2>
              <p className="text-white/40 text-sm font-medium tracking-wide">
                {activeTab === 'matches' ? 'Track your ranks and experiences.' : activeTab === 'progress' ? 'Live stats and career path progress' : 'Your collection of unique event stamps'}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-white/20">
              <span className="material-symbols-outlined text-[24px]">
                {activeTab === 'matches' ? 'rocket_launch' : activeTab === 'progress' ? 'query_stats' : 'history_edu'}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'matches' ? (
              <motion.div 
                key="matches" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="relative z-20 space-y-12"
              >
                <div className="flex justify-center">
                  <div className="bg-white/5 p-1 rounded-full border border-white/10 flex">
                    <button 
                      onClick={() => setMatchSubTab('status')} 
                      className={`px-8 py-2 rounded-full font-bold text-xs transition-all ${matchSubTab === 'status' ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
                    >
                      Status
                    </button>
                    <button 
                      onClick={() => setMatchSubTab('ranks')} 
                      className={`px-8 py-2 rounded-full font-bold text-xs transition-all ${matchSubTab === 'ranks' ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
                    >
                      Global Ranks
                    </button>
                  </div>
                </div>

                {matchSubTab === 'status' ? (
                  <div className="bg-white/3 border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/5 transition-all">
                    <div className="flex flex-col lg:flex-row gap-8 items-center">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img 
                            src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop" 
                            className="h-20 w-20 rounded-2xl object-cover border-2 border-white/10" 
                            alt="" 
                          />
                          <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-black rounded-full border border-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[14px] text-[#ccff00]">hourglass_empty</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Jasmine L.</h3>
                          <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest">Forest Fairy Tale Request</p>
                        </div>
                      </div>
                      <div className="grow w-full lg:max-w-md">
                        <div className="flex justify-between mb-2">
                           <span className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest">Reviewing</span>
                           <span className="text-[10px] text-white/20 font-mono tracking-widest">Typically 2h</span>
                        </div>
                        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="absolute inset-0 bg-linier-to-r from-[#ccff00] to-[#ccff00]/50 animate-pulse-slow" style={{ width: '40%' }}></div>
                        </div>
                        <div className="flex justify-between mt-3 text-[8px] font-black uppercase text-white/40 tracking-widest">
                          <span className="text-[#ccff00]">Sent</span>
                          <span>Reviewing</span>
                          <span>Matched</span>
                          <span>Secured</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/3 border border-white/5 rounded-[3rem] overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Rank</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Citizen</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase text-white/20 tracking-[0.2em] text-right">Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { rank: 1, name: 'Alex M.', level: 42, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop' },
                          { rank: 2, name: 'Sarah K.', level: 38, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop' },
                          { rank: 3, name: 'James W.', level: 35, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop' },
                        ].map((p) => (
                          <tr key={p.rank} className="hover:bg-white/2 transition-colors">
                            <td className="px-8 py-6 text-xl font-display font-bold text-[#ccff00]">#{p.rank}</td>
                            <td className="px-8 py-6 flex items-center gap-4">
                              <img src={p.avatar} className="h-10 w-10 rounded-xl object-cover border border-white/10" alt="" />
                              <span className="font-bold text-white">{p.name}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/5">LVL {p.level}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'progress' ? (
              <motion.div 
                key="progress" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="relative z-20 space-y-12"
              >
                <div className={`grid grid-cols-1 ${filteredPaths.length > 1 ? 'sm:grid-cols-2' : ''} gap-6`}>
                  {filteredPaths.map((path) => (
                    <div key={path.path} className="bg-white/3 border border-white/5 rounded-[3rem] p-8 flex flex-col items-center text-center group hover:bg-white/5 transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[60px] -mr-16 -mt-16"></div>
                      <CircularProgress level={path.level} currentXP={path.currentXP} requiredXP={path.requiredXP} color={path.color} size={160} strokeWidth={10} className="mb-6" />
                      <h4 className="text-2xl font-display font-bold text-white mb-1 capitalize tracking-tight">{path.path === 'user' ? 'Citizen' : path.path} Path</h4>
                      <p className="text-xs font-black uppercase tracking-[0.3em] mb-6" style={{ color: path.color }}>{path.label}</p>
                      <div className="w-full space-y-3">
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full transition-all duration-1000" style={{ width: `${(path.currentXP / path.requiredXP) * 100}%`, backgroundColor: path.color }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-[9px] text-white/20 font-mono tracking-widest">
                             {formatXP(path.currentXP)} / {formatXP(path.requiredXP)} XP
                          </div>
                          <div 
                            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border"
                            style={{ 
                              backgroundColor: `${path.color}10`, 
                              borderColor: `${path.color}30` 
                            }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: path.color }}></div>
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: path.color }}>
                              Lvl {path.level} • {path.path === 'user' ? 'Citizen' : path.path}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#ccff00]">award_star</span> Collection
                    </h3>
                    <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                      <button 
                        onClick={() => setShowAllBadges(false)} 
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!showAllBadges ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
                      >
                        Owned
                      </button>
                      <button 
                        onClick={() => setShowAllBadges(true)} 
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${showAllBadges ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
                      >
                        All
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/2 border border-white/5 rounded-[3rem] p-8">
                    <BadgeGrid
                      badges={showAllBadges ? displayBadges : earnedBadges}
                      maxDisplay={showAllBadges ? displayBadges.length : earnedBadges.length}
                      className={showAllBadges ? 'lg:grid-cols-6' : 'lg:grid-cols-4'}
                      onBadgeClick={handleBadgeClick}
                      lockedBadges={finalLockedIds}
                    />
                  </div>
                </section>

                <section className="bg-linear-to-br from-[#ccff00]/10 to-transparent border border-[#ccff00]/10 rounded-[3rem] p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#ccff00]/5 rounded-full blur-[60px] -mr-24 -mt-24 group-hover:bg-[#ccff00]/10 transition-all duration-700"></div>
                  <h3 className="text-lg font-display font-bold text-white mb-8 relative z-10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ccff00]">auto_awesome</span> Mastery Guides
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                    {/* User Path Guide - Always shown */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest opacity-60">Citizen Activities</p>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                           <div className="flex items-center gap-3">
                             <span className="material-symbols-outlined text-[#ccff00] text-sm">confirmation_number</span>
                             <span className="text-sm text-white/70">Book an Experience</span>
                           </div>
                           <span className="font-mono text-sm text-[#ccff00] font-bold">+{XP_REWARDS.bookEvent} XP</span>
                         </div>
                         <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                           <div className="flex items-center gap-3">
                             <span className="material-symbols-outlined text-[#ccff00] text-sm">local_activity</span>
                             <span className="text-sm text-white/70">Attend an Event</span>
                           </div>
                           <span className="font-mono text-sm text-[#ccff00] font-bold">+{XP_REWARDS.attendEvent} XP</span>
                         </div>
                      </div>
                    </div>

                    {/* Foxer Path Guide */}
                    {activePathTypes.includes('foxer') && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-[#f97316] uppercase tracking-widest opacity-60">Foxer Career</p>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                             <div className="flex items-center gap-3">
                               <span className="material-symbols-outlined text-[#f97316] text-sm">add_box</span>
                               <span className="text-sm text-white/70">Create a Listing</span>
                             </div>
                             <span className="font-mono text-sm text-[#f97316] font-bold">+{XP_REWARDS.createListing} XP</span>
                           </div>
                           <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                             <div className="flex items-center gap-3">
                               <span className="material-symbols-outlined text-[#f97316] text-sm">task_alt</span>
                               <span className="text-sm text-white/70">Complete Event</span>
                             </div>
                             <span className="font-mono text-sm text-[#f97316] font-bold">+{XP_REWARDS.completeEvent} XP</span>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Host Path Guide */}
                    {activePathTypes.includes('host') && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest opacity-60">Host Career</p>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                             <div className="flex items-center gap-3">
                               <span className="material-symbols-outlined text-[#3b82f6] text-sm">apartment</span>
                               <span className="text-sm text-white/70">Upload Venue</span>
                             </div>
                             <span className="font-mono text-sm text-[#3b82f6] font-bold">+{XP_REWARDS.uploadVenue} XP</span>
                           </div>
                           <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                             <div className="flex items-center gap-3">
                               <span className="material-symbols-outlined text-[#3b82f6] text-sm">star_rate</span>
                               <span className="text-sm text-white/70">Venue Featured</span>
                             </div>
                             <span className="font-mono text-sm text-[#3b82f6] font-bold">+{XP_REWARDS.venueFeatured} XP</span>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Mayor Path Guide */}
                    {activePathTypes.includes('mayor') && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest opacity-60">Mayor Career</p>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                             <div className="flex items-center gap-3">
                               <span className="material-symbols-outlined text-[#a855f7] text-sm">domain_add</span>
                               <span className="text-sm text-white/70">List a Venue</span>
                             </div>
                             <span className="font-mono text-sm text-[#a855f7] font-bold">+{XP_REWARDS.uploadMayorVenue} XP</span>
                           </div>
                           <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                             <div className="flex items-center gap-3">
                               <span className="material-symbols-outlined text-[#a855f7] text-sm">assured_workload</span>
                               <span className="text-sm text-white/70">Venue Approved</span>
                             </div>
                             <span className="font-mono text-sm text-[#a855f7] font-bold">+{XP_REWARDS.mayorVenueApproved} XP</span>
                           </div>
                           <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                             <div className="flex items-center gap-3">
                               <span className="material-symbols-outlined text-[#a855f7] text-sm">star_rate</span>
                               <span className="text-sm text-white/70">Venue Featured</span>
                             </div>
                             <span className="font-mono text-sm text-[#a855f7] font-bold">+{XP_REWARDS.mayorVenueFeatured} XP</span>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </motion.div>
            ) : (
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
                      <span className="material-symbols-outlined text-9xl mb-6">menu_book</span>
                      <p className="font-display font-bold text-2xl tracking-tight text-white">Your passport is empty</p>
                      <p className="text-sm mt-2 text-white/60">Attend exclusive events to start your collection!</p>
                   </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <BadgeModal badge={selectedBadge} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
};

export default PassportClient;