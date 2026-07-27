"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
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
  host_support:       { title: 'Creator Support',     desc: '24/7 dedicated event manager',           icon: 'support_agent' },
  analytics_pro:      { title: 'Analytics Pro',      desc: 'Advanced heatmaps for your venues',      icon: 'analytics' },
  featured_listing:   { title: 'Featured Listing',   desc: 'Priority placement in search results',   icon: 'featured_play_list' },
  event_boost:        { title: 'Event Boost',         desc: 'Promoted visibility for your events',    icon: 'rocket_launch' },
  venue_authority:    { title: 'Venue Authority',     desc: 'Priority venue listing approvals',       icon: 'assured_workload' },
  city_badge:         { title: 'City Badge',          desc: 'Verified Venue Foxer status in your city', icon: 'account_balance' },
  venue_spotlight:    { title: 'Venue Spotlight',     desc: 'Top placement in venue listings',        icon: 'auto_awesome' },
  mayor_verified:     { title: 'Venue Verified',      desc: 'Highest tier venue authority',           icon: 'verified_user' },
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
  const [leaderboardPage, setLeaderboardPage] = useState(0);
  const RANKS_PER_PAGE = 10;

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
    <div className="min-h-screen bg-[#0a0a0a] p-3 sm:p-6 lg:p-10 relative pb-28 sm:pb-6 lg:pb-10">
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
          <VisuallyHidden><SheetTitle>Navigation</SheetTitle></VisuallyHidden>
          <div className="flex flex-col h-full p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden">
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
          </div>
        </SheetContent>
      </Sheet>
      {/* Main Content Area */}
      <main className="grow relative bg-[#050505] z-10">
        <div className="fixed top-0 right-0 w-[50%] h-[50%] bg-[#ccff00]/5 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>

        <div className="p-4 sm:p-8 lg:p-12 flex flex-col">
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
                <div className="flex justify-center overflow-x-auto no-scrollbar px-2">
                  <div className="bg-white/5 p-1 rounded-full border border-white/10 flex shrink-0">
                    {isEventFoxer && (
                      <button
                        onClick={() => setMatchSubTab('client-inbox')}
                        className={`px-3 sm:px-8 py-2 rounded-full font-bold text-xs transition-all ${matchSubTab === 'client-inbox' ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
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
                        className={`px-3 sm:px-8 py-2 rounded-full font-bold text-xs transition-all ${matchSubTab === 'outgoing' ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
                      >
                        My Requests
                      </button>
                    )}
                    {isProvider && (
                      <button
                        onClick={() => setMatchSubTab('incoming')}
                        className={`px-3 sm:px-8 py-2 rounded-full font-bold text-xs transition-all ${matchSubTab === 'incoming' ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
                      >
                        Incoming
                      </button>
                    )}
                    <button
                      onClick={() => setMatchSubTab('ranks')}
                      className={`px-3 sm:px-8 py-2 rounded-full font-bold text-xs transition-all ${matchSubTab === 'ranks' ? 'bg-[#ccff00] text-black shadow-glow-accent' : 'text-white/40 hover:text-white'}`}
                    >
                      Global Ranks
                    </button>
                  </div>
                </div>

                {/* ── Client Inbox ── */}
                {matchSubTab === 'client-inbox' && (
                  <div className="space-y-3">
                    {clientInboxLoading && clientInboxAll.length === 0 ? (
                      <div className="flex flex-col items-center py-20 gap-3 opacity-30">
                        <span className="material-symbols-outlined text-6xl animate-pulse">person_search</span>
                        <p className="text-sm text-white/60">Loading requests…</p>
                      </div>
                    ) : clientInboxAll.length === 0 ? (
                      <div className="flex flex-col items-center py-20 gap-3 opacity-20 text-center">
                        <span className="material-symbols-outlined text-6xl">person_search</span>
                        <p className="font-display font-bold text-lg text-white">No client requests yet</p>
                        <p className="text-sm text-white/50">When someone matches with you, their request will appear here.</p>
                      </div>
                    ) : (
                      <>
                        {clientInboxAll.map((req: ClientMatchRequest) => {
                          const sc = statusColor(req.requestStatus);
                          return (
                            <div key={req.id} className="group relative rounded-2xl border overflow-hidden transition-all hover:scale-[1.01]" style={{ borderColor: `${sc}20`, background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)` }}>
                              {/* Color accent strip */}
                              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: sc }} />
                              <div className="pl-5 pr-4 py-4 flex items-center gap-4">
                                {/* Avatar */}
                                <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-sm font-black text-white/50 overflow-hidden shrink-0">
                                  {req.client?.imgId
                                    ? <img src={`https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${req.client.imgId}`} className="h-full w-full object-cover" alt="" />
                                    : (req.client?.name?.charAt(0)?.toUpperCase() ?? '?')}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-white text-sm leading-tight truncate">{req.client?.name}</p>
                                  <p className="text-[10px] text-white/40 font-medium truncate mt-0.5">{req.name}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-[9px] font-black text-white/25 uppercase tracking-widest">{req.guestCount} guests</span>
                                    <span className="text-white/10">·</span>
                                    <span className="text-[9px] font-black text-white/25 uppercase tracking-widest">{new Date(req.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  </div>
                                  {req.template && <p className="text-[9px] mt-1" style={{ color: `${sc}99` }}>Based on: {req.template.name}</p>}
                                </div>
                                {/* Right side */}
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  {req.totalAmount > 0 && <span className="text-sm font-black text-white">₱{req.totalAmount.toLocaleString()}</span>}
                                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ color: sc, backgroundColor: `${sc}18`, border: `1px solid ${sc}30` }}>
                                    {statusLabel(req.requestStatus)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {clientInboxPage?.hasMore && (
                          <button
                            onClick={() => setClientInboxOffset(o => o + 10)}
                            disabled={clientInboxLoading}
                            className="w-full py-3.5 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                          >
                            {clientInboxLoading ? <><span className="material-symbols-outlined text-base animate-spin">autorenew</span> Loading…</> : <><span className="material-symbols-outlined text-base">expand_more</span> Load More</>}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ── My Requests (Outgoing) ── */}
                {matchSubTab === 'outgoing' && (
                  <div className="space-y-4">
                    {outgoingLoading ? (
                      <div className="flex flex-col items-center py-20 gap-3 opacity-30">
                        <span className="material-symbols-outlined text-6xl animate-pulse">handshake</span>
                        <p className="text-sm text-white/60">Loading requests…</p>
                      </div>
                    ) : outgoingGroups.length === 0 ? (
                      <div className="flex flex-col items-center py-20 gap-3 opacity-20 text-center">
                        <span className="material-symbols-outlined text-6xl">handshake</span>
                        <p className="font-display font-bold text-lg text-white">No match requests yet</p>
                        <p className="text-sm text-white/50">Match providers to your event templates to get started.</p>
                      </div>
                    ) : outgoingGroups.map((group: OutgoingMatchGroup) => (
                      <div key={group.templateId} className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        {/* Template header */}
                        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-[#ccff00]/5">
                          <span className="material-symbols-outlined text-[#ccff00] text-base">event</span>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm truncate">{group.templateName}</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest">{group.targetCity}{group.targetState ? `, ${group.targetState}` : ''} · {group.category}</p>
                          </div>
                        </div>
                        {/* Requests */}
                        <div className="divide-y divide-white/5">
                          {group.requests.map((req) => {
                            const sc = statusColor(req.matchRequestStatus);
                            return (
                              <div key={req.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors">
                                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black text-white/40 overflow-hidden shrink-0">
                                  {req.provider?.imgId ? <img src={req.provider.imgId} className="h-full w-full object-cover" alt="" /> : (req.provider?.name?.charAt(0)?.toUpperCase() ?? '?')}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-white truncate">{req.provider?.name ?? 'Unknown'}</p>
                                  <p className="text-[9px] text-white/30 uppercase tracking-widest">{req.item?.name} · {req.type}</p>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0" style={{ color: sc, backgroundColor: `${sc}18`, border: `1px solid ${sc}30` }}>
                                  {statusLabel(req.matchRequestStatus)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Incoming ── */}
                {matchSubTab === 'incoming' && (
                  <div className="space-y-3">
                    {incomingLoading ? (
                      <div className="flex flex-col items-center py-20 gap-3 opacity-30">
                        <span className="material-symbols-outlined text-6xl animate-pulse">inbox</span>
                        <p className="text-sm text-white/60">Loading requests…</p>
                      </div>
                    ) : incomingRequests.length === 0 ? (
                      <div className="flex flex-col items-center py-20 gap-3 opacity-20 text-center">
                        <span className="material-symbols-outlined text-6xl">inbox</span>
                        <p className="font-display font-bold text-lg text-white">No incoming requests</p>
                        <p className="text-sm text-white/50">Event Foxers will appear here when they match your listings.</p>
                      </div>
                    ) : incomingRequests.map((req: IncomingMatchRequest) => {
                      const sc = statusColor(req.matchRequestStatus);
                      return (
                        <div key={req.id} className="group relative rounded-2xl border overflow-hidden transition-all hover:scale-[1.01]" style={{ borderColor: `${sc}20`, background: 'rgba(255,255,255,0.03)' }}>
                          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: sc }} />
                          <div className="pl-5 pr-4 py-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-sm font-black text-white/50 overflow-hidden shrink-0">
                              {req.template.owner?.imgId ? <img src={req.template.owner.imgId} className="h-full w-full object-cover" alt="" /> : (req.template.owner?.name?.charAt(0)?.toUpperCase() ?? '?')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white text-sm truncate">{req.template.owner?.name}</p>
                              <p className="text-[10px] text-white/40 truncate mt-0.5">{req.template.name}</p>
                              <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">{req.item?.name}</p>
                            </div>
                            {req.matchRequestStatus === 'pending' ? (
                              <div className="flex flex-col gap-1.5 shrink-0">
                                <button
                                  onClick={() => respondMutation.mutate({ matchId: req.id, type: req.type, status: 'accepted' })}
                                  disabled={respondMutation.isPending}
                                  className="px-3 py-1.5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-[10px] font-black hover:bg-[#22c55e]/20 transition-all disabled:opacity-50"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => respondMutation.mutate({ matchId: req.id, type: req.type, status: 'declined' })}
                                  disabled={respondMutation.isPending}
                                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0" style={{ color: sc, backgroundColor: `${sc}18`, border: `1px solid ${sc}30` }}>
                                {statusLabel(req.matchRequestStatus)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Global Ranks ── */}
                {matchSubTab === 'ranks' && (() => {
                  const totalPages = Math.ceil(leaderboard.length / RANKS_PER_PAGE);
                  const pageItems = leaderboard.slice(leaderboardPage * RANKS_PER_PAGE, (leaderboardPage + 1) * RANKS_PER_PAGE);
                  const rankColors: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
                  return (
                    <div className="space-y-3">
                      {leaderboardLoading ? (
                        <div className="flex flex-col items-center py-20 gap-3 opacity-30">
                          <span className="material-symbols-outlined text-6xl animate-pulse">leaderboard</span>
                          <p className="text-sm text-white/60">Loading leaderboard…</p>
                        </div>
                      ) : (
                        <>
                          {/* Rank rows */}
                          <div className="space-y-2">
                            {pageItems.map((entry, i) => {
                              const isYou = entry.userId === user?.id;
                              const isTop3 = entry.rank <= 3;
                              const rankColor = rankColors[entry.rank] ?? (isYou ? '#ccff00' : 'rgba(255,255,255,0.3)');
                              const globalIdx = leaderboardPage * RANKS_PER_PAGE + i;
                              return (
                                <div
                                  key={entry.userId}
                                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all"
                                  style={{
                                    background: isYou ? 'rgba(204,255,0,0.06)' : isTop3 ? `${rankColors[entry.rank]}08` : 'rgba(255,255,255,0.02)',
                                    borderColor: isYou ? 'rgba(204,255,0,0.2)' : isTop3 ? `${rankColors[entry.rank]}20` : 'rgba(255,255,255,0.05)',
                                  }}
                                >
                                  {/* Rank number */}
                                  <div className="w-8 text-center shrink-0">
                                    {isTop3 ? (
                                      <span className="text-lg font-black" style={{ color: rankColor }}>#{entry.rank}</span>
                                    ) : (
                                      <span className="text-sm font-bold text-white/30">#{entry.rank}</span>
                                    )}
                                  </div>
                                  {/* Avatar */}
                                  <div
                                    className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black overflow-hidden shrink-0"
                                    style={{ background: isTop3 ? `${rankColors[entry.rank]}20` : 'rgba(255,255,255,0.08)', border: `1px solid ${isTop3 ? rankColors[entry.rank] + '30' : 'rgba(255,255,255,0.08)'}` }}
                                  >
                                    {entry.user.imgId
                                      ? <img src={entry.user.imgId} className="h-full w-full object-cover" alt="" />
                                      : <span style={{ color: isTop3 ? rankColors[entry.rank] : 'rgba(255,255,255,0.3)' }}>{entry.user.name?.charAt(0)}</span>}
                                  </div>
                                  {/* Name */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white text-sm truncate">{entry.user.name}</span>
                                      {isYou && <span className="text-[8px] font-black text-[#ccff00] uppercase tracking-widest bg-[#ccff00]/10 px-2 py-0.5 rounded-full shrink-0">You</span>}
                                    </div>
                                  </div>
                                  {/* XP */}
                                  <div className="text-right shrink-0">
                                    <span className="font-mono text-sm font-black" style={{ color: isTop3 ? rankColors[entry.rank] : isYou ? '#ccff00' : 'rgba(255,255,255,0.5)' }}>
                                      {formatXP(entry.totalXP)}
                                    </span>
                                    <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">XP</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2">
                              <button
                                onClick={() => setLeaderboardPage(p => Math.max(0, p - 1))}
                                disabled={leaderboardPage === 0}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-20"
                              >
                                <span className="material-symbols-outlined text-base">chevron_left</span> Prev
                              </button>
                              <div className="flex items-center gap-1.5">
                                {Array.from({ length: totalPages }, (_, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setLeaderboardPage(i)}
                                    className="h-2 rounded-full transition-all"
                                    style={{ width: leaderboardPage === i ? 20 : 8, backgroundColor: leaderboardPage === i ? '#ccff00' : 'rgba(255,255,255,0.15)' }}
                                  />
                                ))}
                              </div>
                              <button
                                onClick={() => setLeaderboardPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={leaderboardPage === totalPages - 1}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-20"
                              >
                                Next <span className="material-symbols-outlined text-base">chevron_right</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            ) : activeTab === 'progress' ? (
              <motion.div 
                key="progress" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="relative z-20 space-y-12"
              >
                <div className={`grid ${filteredPaths.length > 1 ? 'grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto w-full'} gap-3`}>
                  {filteredPaths.map((path) => {
                    const pathName = path.path === 'user' ? 'Citizen' : path.path === 'gearFoxer' ? 'Gear Foxer' : path.path === 'serviceFoxer' ? 'Service Foxer' : path.path === 'eventFoxer' ? 'Event Foxer' : path.path === 'venueFoxer' ? 'Venue Foxer' : path.path;
                    const pct = Math.min(100, Math.round((path.currentXP / path.requiredXP) * 100));
                    return (
                      <div
                        key={path.path}
                        className="relative flex flex-col items-center text-center rounded-3xl overflow-hidden p-5 gap-3"
                        style={{
                          background: `radial-gradient(ellipse at 50% 0%, ${path.color}18 0%, transparent 70%), rgba(255,255,255,0.03)`,
                          border: `1px solid ${path.color}22`,
                        }}
                      >
                        {/* Glow orb */}
                        <div
                          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
                          style={{ backgroundColor: path.color }}
                        />

                        {/* Circular progress */}
                        <CircularProgress
                          level={path.level}
                          currentXP={path.currentXP}
                          requiredXP={path.requiredXP}
                          color={path.color}
                          size={96}
                          strokeWidth={7}
                        />

                        {/* Path name + tier */}
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black text-white tracking-tight leading-none">{pathName}</p>
                          <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: path.color }}>{path.label}</p>
                        </div>

                        {/* XP bar */}
                        <div className="w-full space-y-1.5">
                          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${pct}%`, backgroundColor: path.color, boxShadow: `0 0 6px ${path.color}80` }}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-mono text-white/30">{formatXP(path.currentXP)} XP</span>
                            <span className="text-[8px] font-black" style={{ color: path.color }}>{pct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

                    {/* Event Foxer Path Guide */}
                    {activePathTypes.includes('eventFoxer') && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest opacity-60">Event Foxer Career</p>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                             <div className="flex items-center gap-3">
                               <span className="material-symbols-outlined text-[#3b82f6] text-sm">celebration</span>
                               <span className="text-sm text-white/70">Complete an Event</span>
                             </div>
                             <span className="font-mono text-sm text-[#3b82f6] font-bold">+{XP_REWARDS.completeEvent} XP</span>
                           </div>
                           <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                             <div className="flex items-center gap-3">
                               <span className="material-symbols-outlined text-[#3b82f6] text-sm">star_rate</span>
                               <span className="text-sm text-white/70">Earn a 5-Star Review</span>
                             </div>
                             <span className="font-mono text-sm text-[#3b82f6] font-bold">+{XP_REWARDS.receive5StarReview} XP</span>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Venue Foxer Path Guide */}
                    {activePathTypes.includes('venueFoxer') && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest opacity-60">Venue Foxer Career</p>
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
