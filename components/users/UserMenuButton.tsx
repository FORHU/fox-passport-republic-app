'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, Briefcase, MessageSquare, User, Settings, Globe,
  HelpCircle, UserPlus, Gift, LogOut, Menu, Lock, RefreshCw,
  LayoutDashboard, Building2, MapPin, Cpu, ShieldCheck,
} from 'lucide-react';
import { useUserMenu } from '@/hooks/auth/useUserMenu';
import { useAuthStore } from '@/store/useAuthStore';
import { refreshUserSession } from '@/lib/server/auth-actions';
import { toast } from 'sonner';

interface RoleDef {
  key: string;
  label: string;
  href: string;
  applyHref: string;
  description: string;
  icon: React.ElementType;
  emoji: string;
  // which roleType values grant access
  roleTypes: string[];
  // which systemRoles grant access (admin sees everything)
  systemRoles?: string[];
}

const ROLE_DEFS: RoleDef[] = [
  {
    key: 'user',
    label: 'Citizen Dashboard',
    href: '/user',
    applyHref: '',
    description: 'Your personal passport hub',
    icon: LayoutDashboard,
    emoji: '🏙️',
    roleTypes: [],
    systemRoles: ['user', 'host', 'mayor', 'foxer', 'admin', 'super_admin'],
  },
  {
    key: 'host',
    label: 'Host Dashboard',
    href: '/host',
    applyHref: '/host/apply',
    description: 'Manage your venues & events',
    icon: Building2,
    emoji: '🏠',
    roleTypes: ['host', 'mayor'],
  },
  {
    key: 'mayor',
    label: 'Mayor Dashboard',
    href: '/mayor',
    applyHref: '/onboarding',
    description: 'Lead your district',
    icon: MapPin,
    emoji: '🏛️',
    roleTypes: ['mayor'],
  },
  {
    key: 'foxer',
    label: 'Foxer Dashboard',
    href: '/foxer',
    applyHref: '/onboarding',
    description: 'Build & manage services / assets',
    icon: Cpu,
    emoji: '🦊',
    roleTypes: ['foxerAsset', 'foxerService', 'foxer'],
  },
];

function RoleLockDialog({
  role,
  onClose,
}: {
  role: RoleDef;
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0f111a] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
            {role.emoji}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{role.label}</h3>
            <p className="text-white/40 text-xs">{role.description}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <Lock className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-yellow-300/80 text-sm leading-relaxed">
            You need the <span className="font-bold text-yellow-300">{role.label.replace(' Dashboard', '')}</span> role
            to access this dashboard. Apply and wait for admin approval.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { onClose(); router.push(role.applyHref); }}
            className="flex-1 py-2.5 rounded-xl bg-[#ccff00] text-black font-bold text-sm hover:bg-[#b8e600] transition"
          >
            Apply Now
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 font-bold text-sm hover:bg-white/10 transition"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserMenuButton() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { isOpen, toggle, close, menuRef } = useUserMenu();
  const [lockedRole, setLockedRole] = useState<RoleDef | null>(null);
  const [syncing, setSyncing] = useState(false);

  const sysRole = (user?.systemRole || user?.role || '').toLowerCase();
  const roleTypes: string[] = user?.roleType || [];
  const isAdmin = sysRole === 'admin' || sysRole === 'super_admin';

  const hasRoleAccess = (def: RoleDef) => {
    if (isAdmin) return true;
    if (def.systemRoles?.includes(sysRole)) return true;
    return def.roleTypes.some((r) => roleTypes.includes(r));
  };

  const handleSyncSession = async () => {
    setSyncing(true);
    close();
    try {
      const freshUser = await refreshUserSession();
      if (freshUser) {
        setUser(freshUser as any);
        toast.success('Account synced — your latest roles are now active');
      } else {
        toast.error('Could not sync. Try logging out and back in.');
      }
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const userInitial =
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    'U';

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          className={`flex items-center gap-3 pl-3 pr-1 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all duration-300 backdrop-blur-md group ${
            isOpen ? 'ring-2 ring-[#ccff00]/50 bg-white/10' : ''
          }`}
          aria-label="User menu"
        >
          <Menu className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          <div className="w-8 h-8 rounded-full bg-[#ccff00] flex items-center justify-center border border-[#ccff00]/50 shadow-sm">
            <span className="text-black text-xs font-bold">{userInitial}</span>
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-[#1a1a24] rounded-xl shadow-2xl border border-white/10 py-2 z-50 backdrop-blur-xl">

            {/* User identity */}
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-white font-bold text-sm truncate">{user?.name || user?.email}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
              {roleTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {roleTypes.map((r) => (
                    <span key={r} className="px-2 py-0.5 rounded-full bg-[#ccff00]/10 text-[#ccff00] text-[10px] font-bold border border-[#ccff00]/20 capitalize">
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Role Dashboards */}
            <div className="px-2 py-2 border-b border-white/5">
              <p className="px-2 text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">My Dashboards</p>
              {ROLE_DEFS.map((def) => {
                const unlocked = hasRoleAccess(def);
                const Icon = def.icon;
                return (
                  <button
                    key={def.key}
                    onClick={() => {
                      if (unlocked) {
                        close();
                        router.push(def.href);
                      } else {
                        close();
                        setLockedRole(def);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all group ${
                      unlocked
                        ? 'hover:bg-white/5 cursor-pointer'
                        : 'opacity-50 cursor-pointer hover:opacity-70'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      unlocked ? 'bg-[#ccff00]/10 border border-[#ccff00]/20' : 'bg-white/5 border border-white/10'
                    }`}>
                      {unlocked
                        ? <Icon className="w-4 h-4 text-[#ccff00]" />
                        : <Lock className="w-3.5 h-3.5 text-white/40" />
                      }
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-sm font-medium truncate ${unlocked ? 'text-white group-hover:text-[#ccff00]' : 'text-white/40'}`}>
                        {def.label}
                      </p>
                      <p className="text-[10px] text-white/30 truncate">{def.description}</p>
                    </div>
                    {!unlocked && (
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider shrink-0">Apply</span>
                    )}
                  </button>
                );
              })}
              {isAdmin && (
                <button
                  onClick={() => { close(); router.push('/admin'); }}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10 border border-red-500/20">
                    <ShieldCheck className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white group-hover:text-red-400">Admin Dashboard</p>
                    <p className="text-[10px] text-white/30">Platform management</p>
                  </div>
                </button>
              )}
            </div>

            {/* Standard links */}
            <div className="px-2 py-2 border-b border-white/5 space-y-0.5">
              {[
                { label: 'Wishlists', icon: Heart, href: '/wishlists' },
                { label: 'Trips', icon: Briefcase, href: '/trips' },
                { label: 'Messages', icon: MessageSquare, href: '/messages' },
                { label: 'Account settings', icon: Settings, href: '/settings' },
                { label: 'Languages & currency', icon: Globe, href: '/settings/language' },
                { label: 'Help Center', icon: HelpCircle, href: '/help' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { close(); router.push(item.href); }}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <item.icon className="w-4 h-4 text-white/40 group-hover:text-[#ccff00] transition-colors shrink-0" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">{item.label}</span>
                </button>
              ))}
              {!isAdmin && (
                <button
                  onClick={() => { close(); router.push('/onboarding'); }}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[#ccff00]/5 transition-colors group"
                >
                  <UserPlus className="w-4 h-4 text-[#ccff00]/60 group-hover:text-[#ccff00] transition-colors shrink-0" />
                  <span className="text-sm text-[#ccff00]/60 group-hover:text-[#ccff00] transition-colors font-medium">Apply for a Role</span>
                </button>
              )}
            </div>

            {/* Sync + Logout */}
            <div className="px-2 py-2 space-y-0.5">
              <button
                onClick={handleSyncSession}
                disabled={syncing}
                className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors group disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-white/40 group-hover:text-blue-400 transition-colors shrink-0 ${syncing ? 'animate-spin' : ''}`} />
                <span className="text-sm text-white/50 group-hover:text-blue-400 transition-colors">
                  {syncing ? 'Syncing account…' : 'Sync Account'}
                </span>
              </button>
              <button
                onClick={() => {
                  close();
                  useAuthStore.getState().logout();
                  router.push('/');
                }}
                className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors group"
              >
                <LogOut className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors shrink-0" />
                <span className="text-sm text-white/50 group-hover:text-red-400 transition-colors">Log out</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {lockedRole && (
        <RoleLockDialog role={lockedRole} onClose={() => setLockedRole(null)} />
      )}
    </>
  );
}
