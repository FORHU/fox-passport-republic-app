"use client";

import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence } from "motion/react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import {
  PathProgress,
  UserPath,
  Badge,
} from "@/features/gamification/types/gamification";
import { initializePathProgress } from "@/features/gamification/lib/gamification";
import BadgeModal from "@/features/gamification/components/BadgeModal";
import {
  useMyPassport,
  useLeaderboard,
  useOutgoingMatchRequests,
  useIncomingMatchRequests,
  useClientMatchRequests,
} from "@/features/gamification/hooks/usePassport";
import type { ClientMatchRequest } from "@/features/gamification/api/passport";
import { PassportSidebarContent } from "./passport/PassportSidebarContent";
import { PassportMatchesTab } from "./passport/PassportMatchesTab";
import { PassportProgressTab } from "./passport/PassportProgressTab";
import { PassportStampsTab } from "./passport/PassportStampsTab";

interface PassportClientProps {
  user: any;
}

export const PassportClient: React.FC<PassportClientProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<"progress" | "stamps" | "matches">(
    "matches",
  );
  const [clientInboxOffset, setClientInboxOffset] = useState(0);
  const [clientInboxAll, setClientInboxAll] = useState<ClientMatchRequest[]>(
    [],
  );
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [perkTab, setPerkTab] = useState<"unlocked" | "locked">("unlocked");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const {
    paths: apiPaths,
    badges: allBadges,
    stamps,
    perks: earnedPerkKeys,
  } = useMyPassport();

  const roleTypes: string[] = user?.roleType ?? [];
  const isEventFoxer = roleTypes.includes("eventFoxer");
  const isProvider = roleTypes.some((r) =>
    ["gearFoxer", "serviceFoxer", "venueFoxer"].includes(r),
  );

  const { data: leaderboard = [], isLoading: leaderboardLoading } =
    useLeaderboard(20);
  const { data: outgoingGroups = [], isLoading: outgoingLoading } =
    useOutgoingMatchRequests(isEventFoxer);
  const { data: incomingRequests = [], isLoading: incomingLoading } =
    useIncomingMatchRequests(isProvider);
  const { data: clientInboxPage, isLoading: clientInboxLoading } =
    useClientMatchRequests(clientInboxOffset, isEventFoxer);

  // Accumulate pages as user loads more
  useEffect(() => {
    if (clientInboxPage?.data) {
      if (clientInboxOffset === 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setClientInboxAll(clientInboxPage.data);
      } else {
        setClientInboxAll((prev) => [...prev, ...clientInboxPage.data]);
      }
    }
  }, [clientInboxPage, clientInboxOffset]);

  // Map API roleType[] to gamification UserPath[]
  const roleToPath = (role: string): UserPath | null => {
    if (role === "eventFoxer") return "eventFoxer";
    if (role === "venueFoxer") return "venueFoxer";
    if (role === "gearFoxer") return "gearFoxer";
    if (role === "serviceFoxer") return "serviceFoxer";
    return null;
  };
  const rolePaths: UserPath[] = Array.from(
    new Set(
      ((user?.roleType as string[]) || [])
        .map(roleToPath)
        .filter(Boolean) as UserPath[],
    ),
  );
  const activePathTypes: UserPath[] =
    rolePaths.length > 0 ? [...rolePaths, "user"] : ["user"];

  // Merge real paths with defaults for roles that have no XP yet
  const filteredPaths: PathProgress[] = activePathTypes.map(
    (pt) => apiPaths.find((p) => p.path === pt) ?? initializePathProgress(pt),
  );

  const displayBadges = allBadges;
  const earnedBadges = allBadges.filter((b) => !!b.earnedAt);
  const finalLockedIds = allBadges.filter((b) => !b.earnedAt).map((b) => b.id);

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  const totalXP = filteredPaths.reduce((sum, path) => sum + path.totalXP, 0);
  const maxTotalXP = activePathTypes.length * 20000;

  const userName = user?.name || user?.username || "Citizen User";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-3 sm:p-6 lg:p-10 relative pb-28 sm:pb-6 lg:pb-10">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ccff00 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      <div className="flex max-w-[1400px] mx-auto min-h-[calc(100vh-5rem)] rounded-[3rem] overflow-clip border border-white/5 shadow-2xl relative">
        {/* Sidebar — docked on desktop, drawer on mobile */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <div className="md:hidden absolute top-4 right-4 z-30">
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="h-11 w-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
          </div>

          <aside className="hidden md:flex w-80 bg-black border-r border-white/5 p-6 flex-col z-20 sticky top-6 lg:top-10 self-start h-[calc(100vh-3rem)] lg:h-[calc(100vh-5rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

          <SheetContent
            side="left"
            className="w-[85vw] max-w-sm bg-black border-r border-white/10 p-6 flex flex-col overflow-y-auto"
          >
            <SheetTitle className="sr-only">Passport Navigation</SheetTitle>
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

        {/* Main View Area */}
        <main className="flex-1 bg-[#0d0d0d] p-4 sm:p-8 lg:p-12 overflow-y-auto relative custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
            {/* Header Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {activeTab === "matches"
                    ? "Match Status & Inquiries"
                    : activeTab === "progress"
                      ? "Citizenship Journey"
                      : "Verified Event Stamps"}
                </h1>
                <p className="text-xs text-white/40 mt-1">
                  {activeTab === "matches"
                    ? "Track and manage all your collaboration requests"
                    : activeTab === "progress"
                      ? "Track your XP, civic ranks, and milestone rewards"
                      : "Verified passport records of events and experiences attended"}
                </p>
              </div>

              {/* Mobile Tab Quick Switcher */}
              <div className="flex sm:hidden rounded-2xl bg-white/5 p-1 border border-white/10">
                <button
                  onClick={() => setActiveTab("matches")}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    activeTab === "matches"
                      ? "bg-[#ccff00] text-black shadow-md"
                      : "text-white/50"
                  }`}
                >
                  Matches
                </button>
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    activeTab === "progress"
                      ? "bg-[#ccff00] text-black shadow-md"
                      : "text-white/50"
                  }`}
                >
                  Mastery
                </button>
                <button
                  onClick={() => setActiveTab("stamps")}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    activeTab === "stamps"
                      ? "bg-[#ccff00] text-black shadow-md"
                      : "text-white/50"
                  }`}
                >
                  Stamps
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "matches" ? (
                <PassportMatchesTab
                  user={user}
                  isEventFoxer={isEventFoxer}
                  isProvider={isProvider}
                  clientInboxPage={clientInboxPage}
                  clientInboxLoading={clientInboxLoading}
                  clientInboxAll={clientInboxAll}
                  onLoadMoreClientInbox={() =>
                    setClientInboxOffset((o) => o + 10)
                  }
                  outgoingGroups={outgoingGroups}
                  outgoingLoading={outgoingLoading}
                  incomingRequests={incomingRequests}
                  incomingLoading={incomingLoading}
                  leaderboard={leaderboard}
                  leaderboardLoading={leaderboardLoading}
                />
              ) : activeTab === "progress" ? (
                <PassportProgressTab
                  filteredPaths={filteredPaths}
                  activePathTypes={activePathTypes}
                  displayBadges={displayBadges}
                  earnedBadges={earnedBadges}
                  finalLockedIds={finalLockedIds}
                  onBadgeClick={handleBadgeClick}
                />
              ) : (
                <PassportStampsTab stamps={stamps} />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <BadgeModal
        badge={selectedBadge}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default PassportClient;
