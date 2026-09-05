"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useUserMenu } from "@/shared/auth/useUserMenu";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { refreshUserSession } from "@/shared/lib/server/auth-actions";
import { toast } from "sonner";
import { RoleDef } from "./user-menu/types";
import { RoleLockDialog } from "./user-menu/RoleLockDialog";
import { UserMenuProfileHeader } from "./user-menu/UserMenuProfileHeader";
import { UserMenuRoleSection } from "./user-menu/UserMenuRoleSection";
import { UserMenuNavLinks } from "./user-menu/UserMenuNavLinks";

interface UserMenuButtonProps {
  onSignIn?: () => void;
}

export default function UserMenuButton({ onSignIn }: UserMenuButtonProps = {}) {
  const router = useRouter();
  const { user, setUser, openLogin } = useAuthStore();
  const { isOpen, toggle, close, menuRef } = useUserMenu();
  const [lockedRole, setLockedRole] = useState<RoleDef | null>(null);
  const [syncing, setSyncing] = useState(false);

  const sysRole = user?.systemRole ?? "user";
  const roleTypes: string[] = user?.roleType ?? [];
  const isAdmin = sysRole === "admin" || sysRole === "admin_secretary";

  // Sync session on mount so imgId + roles are always fresh without waiting
  // for the menu to open. hasSyncedRef prevents duplicate calls.
  const hasSyncedRef = useRef(false);
  useEffect(() => {
    if (!user || hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    refreshUserSession()
      .then((freshUser) => {
        if (freshUser) setUser(freshUser as any);
      })
      .catch(() => {});
  }, [user, setUser]);

  const hasRoleAccess = (def: RoleDef) => {
    if (isAdmin) return true;
    // Citizen Dashboard is always accessible to any authenticated user
    if (def.key === "user") return !!user;
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

  const handleSelectRole = (def: RoleDef, unlocked: boolean) => {
    close();
    if (unlocked) {
      router.push(def.href);
    } else {
      setLockedRole(def);
    }
  };

  const handleSelectAdmin = () => {
    close();
    router.push("/admin");
  };

  return (
    <>
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
          className={`h-10 w-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(204,255,0,0.2)] flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 backdrop-blur-md group cursor-pointer ${
            isOpen ? "ring-2 ring-[#ccff00]/50 bg-white/10 text-white" : ""
          }`}
          aria-label="User menu"
        >
          <Menu className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        {isOpen && user && (
          <div className="fixed inset-x-4 top-16 sm:absolute sm:right-0 sm:top-full sm:inset-x-auto sm:mt-2 w-auto sm:w-72 max-h-[80vh] overflow-y-auto custom-scrollbar bg-[#1a1a24] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10 py-2 z-[100] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Identity */}
            <UserMenuProfileHeader user={user} />

            {/* Role Dashboards */}
            <UserMenuRoleSection
              isAdmin={isAdmin}
              hasRoleAccess={hasRoleAccess}
              onSelectRole={handleSelectRole}
              onSelectAdmin={handleSelectAdmin}
            />

            {/* Standard links, sync, and logout */}
            <UserMenuNavLinks
              userId={user?.id}
              isAdmin={isAdmin}
              syncing={syncing}
              onSync={handleSyncSession}
              onClose={close}
            />
          </div>
        )}
      </div>

      {lockedRole && (
        <RoleLockDialog role={lockedRole} onClose={() => setLockedRole(null)} />
      )}
    </>
  );
}
