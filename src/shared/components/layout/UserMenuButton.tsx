"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useUserMenu } from "@/shared/auth/useUserMenu";
import { useUnreadMessagesCount } from "@/shared/hooks/useUnreadMessagesCount";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { refreshSession } from "@/shared/auth/session-api";
import { toast } from "sonner";
import { canAccessAdmin } from "@/shared/lib/permissions";
import { ROLES } from "@/shared/data/roleCatalog";
import { RoleDef } from "./user-menu/types";
import { UserMenuProfileHeader } from "./user-menu/UserMenuProfileHeader";
import { UserMenuRoleSection } from "./user-menu/UserMenuRoleSection";
import { UserMenuAppNav } from "./user-menu/UserMenuAppNav";
import { UserMenuNavLinks } from "./user-menu/UserMenuNavLinks";

interface UserMenuButtonProps {
  onSignIn?: () => void;
  /** Adds the app's main places (Map, Republic, …) to the menu, for headers
   * that don't show the app nav themselves (creator dashboard, admin). */
  showAppNav?: boolean;
}

export default function UserMenuButton({
  onSignIn,
  showAppNav = false,
}: UserMenuButtonProps = {}) {
  const router = useRouter();
  const { user, setUser, openLogin } = useAuthStore();
  const { isOpen, toggle, close, menuRef } = useUserMenu();
  const [syncing, setSyncing] = useState(false);
  const { unreadCount: unreadMessages } = useUnreadMessagesCount();

  const roleTypes: string[] = user?.roleType ?? [];
  // The server-granted capability, as `requireAdmin` checks — not systemRole.
  const isAdmin = canAccessAdmin(user);
  // Nothing left to apply for once every applicable role is held.
  const canApply =
    !isAdmin && ROLES.some((role) => !roleTypes.includes(role.roleType));

  // Sync session on mount so imgId + roles are always fresh without waiting
  // for the menu to open. hasSyncedRef prevents duplicate calls.
  const hasSyncedRef = useRef(false);
  useEffect(() => {
    if (!user || hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    // A reply that started under the previous account is that account's —
    // see `sessionEpoch`.
    const startedIn = useAuthStore.getState().sessionEpoch;
    refreshSession()
      .then((freshUser) => {
        if (freshUser && useAuthStore.getState().sessionEpoch === startedIn) {
          setUser(freshUser as any);
        }
      })
      .catch(() => {});
  }, [user, setUser]);

  // Each dashboard's own rule, admins included: an admin isn't shown a
  // dashboard their permissions don't open.
  const hasRoleAccess = (def: RoleDef) => !!user && def.canOpen(user);

  const handleSyncSession = async () => {
    setSyncing(true);
    close();
    try {
      const startedIn = useAuthStore.getState().sessionEpoch;
      const freshUser = await refreshSession();
      if (useAuthStore.getState().sessionEpoch !== startedIn) return;
      if (freshUser) {
        setUser(freshUser as any);
        toast.success("Account synced — your latest roles are now active");
      } else {
        toast.error("Could not sync. Try logging out and back in.");
      }
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  // The menu lists only dashboards the user can open; applying for the
  // others is "Apply for a Role".
  const handleSelectRole = (def: RoleDef) => {
    close();
    router.push(def.href);
  };

  const handleSelectAdmin = () => {
    close();
    router.push("/admin");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!user) {
            if (onSignIn) onSignIn();
            else openLogin();
            return;
          }
          toggle();
        }}
        className={`h-10 w-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 backdrop-blur-md group cursor-pointer ${
          isOpen ? "ring-2 ring-accent/50 bg-white/10 text-white" : ""
        }`}
        aria-label="User menu"
      >
        <Menu className="w-5 h-5 transition-transform group-hover:scale-110" />
        {user && unreadMessages > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-black">
            {unreadMessages > 9 ? "9+" : unreadMessages}
          </span>
        )}
      </button>

      {isOpen && user && (
        <div className="fixed inset-x-4 top-16 sm:absolute sm:right-0 sm:top-full sm:inset-x-auto sm:mt-2 w-auto sm:w-96 max-h-[80vh] overflow-y-auto custom-scrollbar bg-surface-raised rounded-2xl border border-white/10 py-2 z-[100] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Identity */}
          <UserMenuProfileHeader user={user} />

          {/* Role Dashboards */}
          <UserMenuRoleSection
            isAdmin={isAdmin}
            roleTypes={roleTypes}
            hasRoleAccess={hasRoleAccess}
            onSelectRole={handleSelectRole}
            onSelectAdmin={handleSelectAdmin}
          />

          {showAppNav && <UserMenuAppNav onClose={close} />}

          {/* Standard links, sync, and logout */}
          <UserMenuNavLinks
            userId={user?.id}
            canApply={canApply}
            syncing={syncing}
            onSync={handleSyncSession}
            onClose={close}
          />
        </div>
      )}
    </div>
  );
}
