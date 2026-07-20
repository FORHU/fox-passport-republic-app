"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
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
  formatXP,
  initializePathProgress,
} from '@/features/gamification/lib/gamification';
import BadgeModal from '@/features/gamification/components/BadgeModal';
import { useMyPassport, useLeaderboard, useOutgoingMatchRequests, useIncomingMatchRequests, useClientMatchRequests, useRespondToMatch } from '@/features/gamification/hooks/usePassport';
import type { OutgoingMatchGroup, IncomingMatchRequest, ClientMatchRequest } from '@/features/gamification/api/passport';

interface PassportClientProps {
  user: any;
}

const PATH_SHORT: Record<string, string> = {
  user: 'Citizen',
  eventFoxer: 'Event',
  venueFoxer: 'Venue',
  gearFoxer: 'Gear',
  serviceFoxer: 'Service',
};

const PATH_COLORS: Record<string, string> = {
  user: '#ccff00',
  eventFoxer: '#3b82f6',
  venueFoxer: '#a855f7',
  gearFoxer: '#f97316',
  serviceFoxer: '#22c55e',
};

// Frontend mirror of API PERK_THRESHOLDS — level at which each perk unlocks per path
const PATH_PERKS: Record<string, { level: number; perk: string }[]> = {
  user:         [{ level: 1, perk: 'early_bird' }, { level: 5, perk: 'priority_access' }, { level: 10, perk: 'vip_lounge' }, { level: 15, perk: 'founding_citizen' }],
  eventFoxer:   [{ level: 1, perk: 'host_support' }, { level: 5, perk: 'analytics_pro' }, { level: 10, perk: 'featured_listing' }, { level: 15, perk: 'event_boost' }],
  venueFoxer:   [{ level: 1, perk: 'venue_authority' }, { level: 3, perk: 'city_badge' }, { level: 8, perk: 'venue_spotlight' }, { level: 15, perk: 'mayor_verified' }],
  gearFoxer:    [{ level: 1, perk: 'gear_verified' }, { level: 3, perk: 'lower_fees' }, { level: 8, perk: 'gear_featured' }],
  serviceFoxer: [{ level: 1, perk: 'service_verified' }, { level: 3, perk: 'service_lower_fees' }, { level: 8, perk: 'service_featured' }],
};

// Perk key → display metadata
const PERK_META: Record<string, { title: string; desc: string; icon: string }> = {
  early_bird:         { title: 'Early Bird',         desc: 'Book events 24h before others',         icon: 'schedule' },
  priority_access:    { title: 'Priority Access',    desc: 'Skip the line at partner venues',        icon: 'confirmation_number' },
  vip_lounge:         { title: 'VIP Lounge',         desc: 'Access to exclusive event areas',        icon: 'diamond' },
  founding_citizen:   { title: 'Founding Citizen',   desc: 'OG member recognition',                  icon: 'workspace_premium' },
  host_support:       { title: 'Host Support',        desc: '24/7 dedicated event manager',           icon: 'support_agent' },
  analytics_pro:      { title: 'Analytics Pro',      desc: 'Advanced heatmaps for your venues',      icon: 'analytics' },
  featured_listing:   { title: 'Featured Listing',   desc: 'Priority placement in search results',   icon: 'featured_play_list' },
  event_boost:        { title: 'Event Boost',         desc: 'Promoted visibility for your events',    icon: 'rocket_launch' },
  venue_authority:    { title: 'Venue Authority',     desc: 'Priority venue listing approvals',       icon: 'assured_workload' },
  city_badge:         { title: 'City Badge',          desc: 'Verified mayor status in your city',     icon: 'account_balance' },
  venue_spotlight:    { title: 'Venue Spotlight',     desc: 'Top placement in venue listings',        icon: 'auto_awesome' },
  mayor_verified:     { title: 'Mayor Verified',      desc: 'Highest tier city authority',            icon: 'verified_user' },
  gear_verified:      { title: 'Gear Verified',       desc: 'Exclusive gear provider status',         icon: 'verified' },
  lower_fees:         { title: 'Lower Fees',          desc: '5% lower commission on bookings',        icon: 'percent' },
  gear_featured:      { title: 'Gear Featured',       desc: 'Priority in equipment listings',         icon: 'star' },
  service_verified:   { title: 'Service Verified',    desc: 'Exclusive service provider status',      icon: 'verified' },
  service_lower_fees: { title: 'Lower Fees',          desc: '5% lower commission on bookings',        icon: 'percent' },
  service_featured:   { title: 'Service Featured',    desc: 'Priority in service listings',           icon: 'star' },
};

const PassportClient: React.FC<PassportClientProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'stamps' | 'matches'>('matches');
  const [matchSubTab, setMatchSubTab] = useState<'outgoing' | 'incoming' | 'client-inbox' | 'ranks'>('client-inbox');
  const [clientInboxOffset, setClientInboxOffset] = useState(0);
  const [clientInboxAll, setClientInboxAll] = useState<ClientMatchRequest[]>([]);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [perkTab, setPerkTab] = useState<'unlocked' | 'locked'>('unlocked');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { paths: apiPaths, badges: allBadges, stamps, perks: earnedPerkKeys } = useMyPassport();

  const roleTypes: string[] = user?.roleType ?? [];
  const isEventFoxer = roleTypes.includes('eventFoxer');
  const isProvider = roleTypes.some((r) => ['gearFoxer', 'serviceFoxer', 'venueFoxer'].includes(r));

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useLeaderboard(20);
  const { data: outgoingGroups = [], isLoading: outgoingLoading } = useOutgoingMatchRequests(isEventFoxer);
  const { data: incomingRequests = [], isLoading: incomingLoading } = useIncomingMatchRequests(isProvider);
  const { data: clientInboxPage, isLoading: clientInboxLoading } = useClientMatchRequests(clientInboxOffset, isEventFoxer);
  // Accumulate pages as user loads more
  React.useEffect(() => {
    if (clientInboxPage?.data) {
      if (clientInboxOffset === 0) {
        setClientInboxAll(clientInboxPage.data);
      } else {
        setClientInboxAll(prev => [...prev, ...clientInboxPage.data]);
      }
    }
  }, [clientInboxPage, clientInboxOffset]);
  const respondMutation = useRespondToMatch();

  const statusColor = (s: string) => {
    if (s === 'accepted' || s === 'approved') return '#22c55e';
    if (s === 'declined' || s === 'rejected') return '#ef4444';
    if (s === 'secured') return '#ccff00';
    return '#f97316';
  };
  const statusLabel = (s: string) => {
    if (s === 'accepted' || s === 'approved') return 'Approved';
    if (s === 'declined' || s === 'rejected') return 'Declined';
    if (s === 'secured') return 'Secured';
    return 'Pending';
  };

  // Map API roleType[] to gamification UserPath[]
  const roleToPath = (role: string): UserPath | null => {
    if (role === 'eventFoxer') return 'eventFoxer';
    if (role === 'venueFoxer') return 'venueFoxer';
    if (role === 'gearFoxer') return 'gearFoxer';
    if (role === 'serviceFoxer') return 'serviceFoxer';
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

  const totalXP = filteredPaths.reduce((sum, path) => sum + path.totalXP, 0);
  const maxTotalXP = activePathTypes.length * 20000;

  const userName = user?.name || user?.username || 'Citizen User';
  const userInitials = userName.charAt(0).toUpperCase();


  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 lg:p-10 relative">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ccff00 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

      <div className="flex max-w-[1400px] mx-auto min-h-[calc(100vh-5rem)] rounded-[3rem] overflow-clip border border-white/5 shadow-2xl relative">

      {/* Sidebar — docked on desktop, drawer on mobile */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <div className="md:hidden absolute top-4 right-4 z-30">
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              className="h-11 w-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
        </div>

        <aside className="hidden md:flex w-80 bg-black border-r border-white/5 p-8 flex-col z-20 sticky top-6 lg:top-10 self-start h-[calc(100vh-3rem)] lg:h-[calc(100vh-5rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <PassportSidebarContent
            user={user}
            userName={userName}
            userInitials={userInitials}
            activePathTypes={activePathTypes}
            totalXP={totalXP}
            maxTotalXP={maxTotalXP}
            expandedPath={expandedPath}
            setExpandedPath={setExpandedPath}
            perkTab={perkTab}
            setPerkTab={setPerkTab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            earnedPerkKeys={earnedPerkKeys}
            onTabSelect={() => {}}
          />
        </aside>

        <SheetContent side="left" className="w-80 bg-black border-white/5 p-0 [&::-webkit-scrollbar]:hidden overflow-y-auto">
          <PassportSidebarContent
            user={user}
            userName={userName}
            userInitials={userInitials}
            activePathTypes={activePathTypes}
            totalXP={totalXP}
            maxTotalXP={maxTotalXP}
            expandedPath={expandedPath}
            setExpandedPath={setExpandedPath}
            perkTab={perkTab}
            setPerkTab={setPerkTab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            earnedPerkKeys={earnedPerkKeys}
            onTabSelect={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>
      {/* Main Content Area */}
      <main className="grow relative bg-[#050505] z-10">
        <div className="fixed top-0 right-0 w-[50%] h-[50%] bg-[#ccff00]/5 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>

        <div className="p-12 flex flex-col">
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
                    {isEventFoxer && (
                      <button
                        onClick={() => setMatchSubTab('client-inbox')}
                        className={`px-8 py-2 rounded-full font-bold text-xs transition-all ${matchSubTab === 'client-inbox' ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
                      >
                        Client Inbox
                        {(clientInboxPage?.total ?? 0) > 0 && (
                          <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#ff00aa] text-white text-[9px] font-black">
                            {clientInboxPage!.total}
                          </span>
                        )}
                      </button>
                    )}
                    {isEventFoxer && (
                      <button
                        onClick={() => setMatchSubTab('outgoing')}
                        className={`px-8 py-2 rounded-full font-bold text-xs transition-all ${matchSubTab === 'outgoing' ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
                      >
                        My Requests
                      </button>
                    )}
                    {isProvider && (
                      <button
                        onClick={() => setMatchSubTab('incoming')}
                        className={`px-8 py-2 rounded-full font-bold text-xs transition-all ${matchSubTab === 'incoming' ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
                      >
                        Incoming
                      </button>
                    )}
                    <button
                      onClick={() => setMatchSubTab('ranks')}
                      className={`px-8 py-2 rounded-full font-bold text-xs transition-all ${matchSubTab === 'ranks' ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
                    >
                      Global Ranks
                    </button>
                  </div>
                </div>

                {matchSubTab === 'client-inbox' && (
                  <div className="space-y-4">
                    {clientInboxLoading ? (
                      <div className="text-center py-16 text-white/30 text-sm">Loading requests…</div>
                    ) : clientInboxAll.length === 0 ? (
                      <div className="flex flex-col items-center py-24 opacity-20 text-center">
                        <span className="material-symbols-outlined text-8xl mb-4">person_search</span>
                        <p className="font-display font-bold text-xl text-white">No client requests yet</p>
                        <p className="text-sm mt-1 text-white/60">When someone matches with you, their request will appear here.</p>
                      </div>
                    ) : (<>
                    {clientInboxAll.map((req: ClientMatchRequest) => (
                      <div key={req.id} className="flex items-center justify-between p-5 bg-white/3 border border-white/5 rounded-[1.5rem] hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white/40 overflow-hidden shrink-0">
                            {req.client?.imgId
                              ? <img src={`https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${req.client.imgId}`} className="h-full w-full object-cover" alt="" />
                              : (req.client?.name?.charAt(0) ?? '?')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{req.client?.name}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">
                              {req.name} · {req.guestCount} guests · {new Date(req.startAt).toLocaleDateString()}
                            </p>
                            {req.template && (
                              <p className="text-[10px] text-accent/60 mt-0.5">Based on: {req.template.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {req.totalAmount > 0 && (
                            <span className="text-xs font-bold text-white/50">₱{req.totalAmount.toLocaleString()}</span>
                          )}
                          <span
                            className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                            style={{
                              color: statusColor(req.requestStatus),
                              borderColor: `${statusColor(req.requestStatus)}30`,
                              backgroundColor: `${statusColor(req.requestStatus)}10`,
                            }}
                          >
                            {statusLabel(req.requestStatus)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {clientInboxPage?.hasMore && (
                      <div className="flex justify-center pt-2">
                        <button
                          onClick={() => setClientInboxOffset(o => o + 10)}
                          disabled={clientInboxLoading}
                          className="px-8 py-3 rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30"
                        >
                          {clientInboxLoading ? 'Loading…' : 'Load More'}
                        </button>
                      </div>
                    )}
                    </>)}
                  </div>
                )}

                {matchSubTab === 'outgoing' && (
                  <div className="space-y-4">
                    {outgoingLoading ? (
                      <div className="text-center py-16 text-white/30 text-sm">Loading requests…</div>
                    ) : outgoingGroups.length === 0 ? (
                      <div className="flex flex-col items-center py-24 opacity-20 text-center">
                        <span className="material-symbols-outlined text-8xl mb-4">handshake</span>
                        <p className="font-display font-bold text-xl text-white">No match requests yet</p>
                        <p className="text-sm mt-1 text-white/60">Match providers to your event templates to get started.</p>
                      </div>
                    ) : outgoingGroups.map((group: OutgoingMatchGroup) => (
                      <div key={group.templateId} className="bg-white/3 border border-white/5 rounded-[2rem] p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="material-symbols-outlined text-[#ccff00] text-lg">event</span>
                          <div>
                            <p className="font-bold text-white">{group.templateName}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">{group.targetCity}{group.targetState ? `, ${group.targetState}` : ''} · {group.category}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {group.requests.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white/40 overflow-hidden">
                                  {req.provider?.imgId ? <img src={req.provider.imgId} className="h-full w-full object-cover" alt="" /> : (req.provider?.name?.charAt(0) ?? '?')}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">{req.provider?.name ?? 'Unknown'}</p>
                                  <p className="text-[10px] text-white/30 uppercase tracking-widest">{req.item?.name} · {req.type}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: statusColor(req.matchRequestStatus), borderColor: `${statusColor(req.matchRequestStatus)}30`, backgroundColor: `${statusColor(req.matchRequestStatus)}10` }}>
                                {statusLabel(req.matchRequestStatus)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {matchSubTab === 'incoming' && (
                  <div className="space-y-3">
                    {incomingLoading ? (
                      <div className="text-center py-16 text-white/30 text-sm">Loading requests…</div>
                    ) : incomingRequests.length === 0 ? (
                      <div className="flex flex-col items-center py-24 opacity-20 text-center">
                        <span className="material-symbols-outlined text-8xl mb-4">inbox</span>
                        <p className="font-display font-bold text-xl text-white">No incoming requests</p>
                        <p className="text-sm mt-1 text-white/60">Event Foxers will appear here when they match your listings.</p>
                      </div>
                    ) : incomingRequests.map((req: IncomingMatchRequest) => (
                      <div key={req.id} className="flex items-center justify-between p-5 bg-white/3 border border-white/5 rounded-[1.5rem] hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white/40 overflow-hidden shrink-0">
                            {req.template.owner?.imgId ? <img src={req.template.owner.imgId} className="h-full w-full object-cover" alt="" /> : (req.template.owner?.name?.charAt(0) ?? '?')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{req.template.owner?.name}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">{req.template.name} · {req.item?.name}</p>
                          </div>
                        </div>
                        {req.matchRequestStatus === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => respondMutation.mutate({ matchId: req.id, type: req.type, status: 'accepted' })}
                              disabled={respondMutation.isPending}
                              className="px-4 py-2 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-bold hover:bg-[#22c55e]/20 transition-all disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => respondMutation.mutate({ matchId: req.id, type: req.type, status: 'declined' })}
                              disabled={respondMutation.isPending}
                              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-bold hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: statusColor(req.matchRequestStatus), borderColor: `${statusColor(req.matchRequestStatus)}30`, backgroundColor: `${statusColor(req.matchRequestStatus)}10` }}>
                            {statusLabel(req.matchRequestStatus)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {matchSubTab === 'ranks' && (
                  <div className="bg-white/3 border border-white/5 rounded-[3rem] overflow-hidden">
                    {leaderboardLoading ? (
                      <div className="text-center py-16 text-white/30 text-sm">Loading leaderboard…</div>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="px-8 py-6 text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Rank</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Citizen</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase text-white/20 tracking-[0.2em] text-right">Total XP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {leaderboard.map((entry) => (
                            <tr key={entry.userId} className="hover:bg-white/2 transition-colors">
                              <td className="px-8 py-5 text-xl font-display font-bold text-[#ccff00]">#{entry.rank}</td>
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white/40 overflow-hidden shrink-0">
                                    {entry.user.imgId ? <img src={entry.user.imgId} className="h-full w-full object-cover" alt="" /> : entry.user.name?.charAt(0)}
                                  </div>
                                  <span className="font-bold text-white">{entry.user.name}</span>
                                  {entry.userId === user?.id && <span className="text-[9px] font-black text-[#ccff00] uppercase tracking-widest bg-[#ccff00]/10 px-2 py-0.5 rounded-full">You</span>}
                                </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <span className="font-mono text-sm text-[#ccff00] font-bold">{formatXP(entry.totalXP)} XP</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
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
                      <h4 className="text-2xl font-display font-bold text-white mb-1 capitalize tracking-tight">{path.path === 'user' ? 'Citizen' : path.path === 'gearFoxer' ? 'Gear Foxer' : path.path === 'serviceFoxer' ? 'Service Foxer' : path.path === 'eventFoxer' ? 'Event Foxer' : path.path === 'venueFoxer' ? 'Venue Foxer' : path.path} Path</h4>
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
                              Lvl {path.level} • {path.path === 'user' ? 'Citizen' : path.path === 'gearFoxer' ? 'Gear Foxer' : path.path === 'serviceFoxer' ? 'Service Foxer' : path.path === 'eventFoxer' ? 'Event Foxer' : path.path === 'venueFoxer' ? 'Venue Foxer' : path.path}
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
                    {(activePathTypes.includes('gearFoxer') || activePathTypes.includes('serviceFoxer')) && (
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
                    {activePathTypes.includes('eventFoxer') && (
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
                    {activePathTypes.includes('venueFoxer') && (
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

      </div>

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

interface PassportSidebarContentProps {
  user: any;
  userName: string;
  userInitials: string;
  activePathTypes: UserPath[];
  totalXP: number;
  maxTotalXP: number;
  expandedPath: string | null;
  setExpandedPath: (p: string | null) => void;
  perkTab: 'unlocked' | 'locked';
  setPerkTab: (t: 'unlocked' | 'locked') => void;
  activeTab: 'progress' | 'stamps' | 'matches';
  setActiveTab: (t: 'progress' | 'stamps' | 'matches') => void;
  earnedPerkKeys: string[];
  onTabSelect: () => void;
}

const PassportSidebarContent: React.FC<PassportSidebarContentProps> = ({
  user,
  userName,
  userInitials,
  activePathTypes,
  totalXP,
  maxTotalXP,
  expandedPath,
  setExpandedPath,
  perkTab,
  setPerkTab,
  activeTab,
  setActiveTab,
  earnedPerkKeys,
  onTabSelect,
}) => {
  return (
    <>
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
            .map(p => p === 'eventFoxer' ? 'Event Foxer' : p === 'gearFoxer' ? 'Gear Foxer' : p === 'serviceFoxer' ? 'Service Foxer' : p === 'venueFoxer' ? 'Venue Foxer' : p === 'investor' ? 'Investor' : p)
            .join(' · ') || 'Citizen'}
        </p>
      </div>

      <div className="space-y-5 grow">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            <span>Mastery XP</span>
            <span className="text-[#ccff00] font-mono">{formatXP(totalXP)}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div
              className="h-full bg-linear-to-r from-[#22c55e] to-[#ccff00] transition-all duration-1000 shadow-[0_0_10px_#ccff0044]"
              style={{ width: `${Math.min(100, (totalXP / maxTotalXP) * 100)}%` }}
            ></div>
          </div>
        </div>

        {(() => {
          const pathPerkData = activePathTypes.map(path => {
            const perks = (PATH_PERKS[path] ?? []).map(({ level, perk }) => ({
              perk, level,
              earned: earnedPerkKeys.includes(perk),
              meta: PERK_META[perk],
              color: PATH_COLORS[path] ?? '#ccff00',
            })).filter(p => p.meta);
            return {
              path,
              label: PATH_SHORT[path] ?? path,
              color: PATH_COLORS[path] ?? '#ccff00',
              unlocked: perks.filter(p => p.earned),
              locked: perks.filter(p => !p.earned),
              total: perks.length,
            };
          });
          const totalEarned = pathPerkData.reduce((s, p) => s + p.unlocked.length, 0);
          const totalAll = pathPerkData.reduce((s, p) => s + p.total, 0);

          return (
            <div className="rounded-2xl bg-white/2 border border-white/5 overflow-hidden">
              <div className="px-3.5 pt-3 pb-2.5 flex items-center justify-between border-b border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Perks</p>
                <span className="text-[9px] font-mono font-bold text-[#ccff00]">{totalEarned}<span className="text-white/20">/{totalAll}</span></span>
              </div>

              <div className="divide-y divide-white/5">
                {pathPerkData.map(({ path, label, color, unlocked, locked, total }) => {
                  const isOpen = expandedPath === path;
                  const display = perkTab === 'unlocked' ? unlocked : locked;
                  return (
                    <div key={path}>
                      <button
                        onClick={() => { setExpandedPath(isOpen ? null : path); setPerkTab('unlocked'); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-white/3 transition-all"
                      >
                        <div className="h-5 w-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                        </div>
                        <span className="text-[10px] font-bold text-white/60 flex-1 text-left">{label} Perks</span>
                        <span className="text-[8px] font-mono text-white/20 mr-1">{unlocked.length}/{total}</span>
                        <span className={`material-symbols-outlined text-[14px] text-white/20 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                      </button>

                      {isOpen && (
                        <div className="px-3 pb-3">
                          <div className="flex gap-1 mb-2.5 bg-white/3 rounded-xl p-0.5">
                            <button
                              onClick={() => setPerkTab('unlocked')}
                              className="flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                              style={perkTab === 'unlocked' ? { backgroundColor: color, color: '#000' } : { color: 'rgba(255,255,255,0.3)' }}
                            >
                              Active{unlocked.length > 0 ? ` (${unlocked.length})` : ''}
                            </button>
                            <button
                              onClick={() => setPerkTab('locked')}
                              className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${perkTab === 'locked' ? 'bg-white/10 text-white' : 'text-white/30'}`}
                            >
                              Locked{locked.length > 0 ? ` (${locked.length})` : ''}
                            </button>
                          </div>

                          <div className="space-y-0.5">
                            {display.length === 0 ? (
                              <p className="text-center text-[8px] text-white/20 py-3">
                                {perkTab === 'unlocked' ? 'No perks unlocked yet — keep leveling up!' : 'All perks for this path unlocked!'}
                              </p>
                            ) : perkTab === 'unlocked' ? (
                              display.map(({ perk, meta, color: c }) => (
                                <div key={perk} className="flex items-center gap-2 px-2 py-1.5 rounded-xl" style={{ backgroundColor: `${c}08` }}>
                                  <div className="h-6 w-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${c}18` }}>
                                    <span className="material-symbols-outlined text-[13px]" style={{ color: c }}>{meta!.icon}</span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold text-white leading-tight">{meta!.title}</p>
                                    <p className="text-[8px] text-white/30 leading-none mt-0.5 truncate">{meta!.desc}</p>
                                  </div>
                                  <span className="material-symbols-outlined text-[12px] shrink-0" style={{ color: c }}>check_circle</span>
                                </div>
                              ))
                            ) : (
                              display.map(({ perk, level, meta }) => (
                                <div key={perk} className="flex items-center gap-2 px-2 py-1.5 rounded-xl">
                                  <div className="relative h-6 w-6 rounded-md bg-white/4 border border-white/5 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[13px] text-white/15">{meta!.icon}</span>
                                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-[#111] rounded-full border border-white/10 flex items-center justify-center">
                                      <span className="material-symbols-outlined text-[7px] text-white/25">lock</span>
                                    </div>
                                  </div>
                                  <p className="text-[10px] font-bold text-white/25 leading-tight flex-1">{meta!.title}</p>
                                  <span className="text-[7px] font-black text-white/20 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-full shrink-0">LVL {level}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      <div className="mt-auto pt-8 flex flex-col gap-3">
        <button
          onClick={() => { setActiveTab('matches'); onTabSelect(); }}
          className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${activeTab === 'matches' ? 'bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'}`}
        >
          <span className="material-symbols-outlined text-[20px]">handshake</span> Match Status
        </button>
        <button
          onClick={() => { setActiveTab('progress'); onTabSelect(); }}
          className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${activeTab === 'progress' ? 'bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'}`}
        >
          <span className="material-symbols-outlined text-[20px]">analytics</span> Mastery
        </button>
        <button
          onClick={() => { setActiveTab('stamps'); onTabSelect(); }}
          className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${activeTab === 'stamps' ? 'bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'}`}
        >
          <span className="material-symbols-outlined text-[20px]">menu_book</span> Passport
        </button>
      </div>
    </>
  );
};

export default PassportClient;
