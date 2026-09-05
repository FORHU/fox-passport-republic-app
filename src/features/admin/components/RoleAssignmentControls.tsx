"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { hasPermission } from "@/shared/lib/permissions";
import {
  ROLE_TYPES,
  SYSTEM_ROLES,
  type RoleType,
  type SystemRole,
} from "@/shared/constants/roles";
import { changeRoleTypes, changeSystemRole } from "@/features/admin/api/roles";

const SYSTEM_ROLE_LABEL: Record<SystemRole, string> = {
  user: "Citizen",
  admin_secretary: "Queue Secretary",
  admin: "Administrator",
};

const SYSTEM_ROLE_HINT: Record<SystemRole, string> = {
  user: "No console access.",
  admin_secretary:
    "Works the approval queues. Cannot see citizens, bookings, disputes or categories.",
  admin: "Everything, including handing out roles.",
};

const ROLE_TYPE_LABEL: Record<RoleType, string> = {
  venueFoxer: "Venue Foxer",
  eventFoxer: "Event Foxer",
  gearFoxer: "Gear Foxer",
  serviceFoxer: "Service Foxer",
  investor: "Investor",
};

/**
 * Changing what a person is.
 *
 * Deliberately not a one-click control: the select and the checkboxes stage a
 * change and a second press commits it. This is the only write in the console
 * that hands out capability, and the API records every attempt — including the
 * refusals — so it should be hard to do by accident.
 *
 * The server refuses two things this component cannot know in advance: changing
 * your own roles, and demoting the last administrator. Those come back as a
 * message rather than a generic failure, so they are shown as-is.
 */
export function RoleAssignmentControls({
  citizen,
}: {
  citizen: {
    id: string;
    email?: string;
    systemRole?: string;
    roleType?: string[];
  };
}) {
  const viewer = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [systemRole, setSystemRole] = useState<SystemRole>(
    (citizen.systemRole as SystemRole) ?? "user",
  );
  const [roleTypes, setRoleTypes] = useState<RoleType[]>(
    (citizen.roleType ?? []) as RoleType[],
  );

  const mayAssign = hasPermission(viewer, "roles:assign");
  // The server refuses this too; hiding it first saves someone finding out the
  // hard way on their own row.
  const isSelf = viewer?.id === citizen.id || viewer?.userId === citizen.id;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-data", "citizens"] });
    queryClient.invalidateQueries({ queryKey: ["admin-data"] });
  };

  const roleMutation = useMutation({
    mutationFn: () => changeSystemRole(citizen.id, systemRole),
    onSuccess: (updated) => {
      toast.success(
        `${citizen.email ?? "User"} is now ${SYSTEM_ROLE_LABEL[updated.systemRole]}. Their sessions were ended.`,
      );
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const typesMutation = useMutation({
    mutationFn: () => changeRoleTypes(citizen.id, roleTypes),
    onSuccess: () => {
      toast.success("Platform roles updated. Their sessions were ended.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!mayAssign) return null;

  const roleDirty = systemRole !== (citizen.systemRole ?? "user");
  const current = new Set(citizen.roleType ?? []);
  const typesDirty =
    roleTypes.length !== current.size || roleTypes.some((r) => !current.has(r));

  const toggle = (role: RoleType) =>
    setRoleTypes((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );

  return (
    <div className="col-span-2 md:col-span-4 mt-2 pt-5 border-t border-white/5">
      <p className="text-[9px] uppercase font-bold text-accent tracking-widest mb-3">
        Assign roles
      </p>

      {isSelf ? (
        <p className="text-[11px] text-white/40">
          This is your own account. Roles are changed by another administrator —
          nobody changes their own access.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System role */}
          <div>
            <label
              htmlFor={`system-role-${citizen.id}`}
              className="block text-[10px] uppercase tracking-wider text-white/40 mb-2"
            >
              System role
            </label>
            <div className="flex items-center gap-2">
              <select
                id={`system-role-${citizen.id}`}
                value={systemRole}
                onChange={(e) => setSystemRole(e.target.value as SystemRole)}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white focus:border-accent outline-none"
              >
                {SYSTEM_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {SYSTEM_ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!roleDirty || roleMutation.isPending}
                onClick={() => roleMutation.mutate()}
                className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all bg-accent text-black border-accent disabled:opacity-25 disabled:pointer-events-none"
              >
                {roleMutation.isPending ? "Saving…" : "Apply"}
              </button>
            </div>
            <p className="text-[10px] text-white/25 mt-2">
              {SYSTEM_ROLE_HINT[systemRole]}
            </p>
          </div>

          {/* Platform roles */}
          <div>
            <p className="block text-[10px] uppercase tracking-wider text-white/40 mb-2">
              Platform roles
            </p>
            <div className="flex flex-wrap gap-2">
              {ROLE_TYPES.map((r) => {
                const on = roleTypes.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggle(r)}
                    aria-pressed={on}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                      on
                        ? "bg-accent/15 text-accent border-accent/40"
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
                    }`}
                  >
                    {ROLE_TYPE_LABEL[r]}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={!typesDirty || typesMutation.isPending}
              onClick={() => typesMutation.mutate()}
              className="mt-3 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all bg-accent text-black border-accent disabled:opacity-25 disabled:pointer-events-none"
            >
              {typesMutation.isPending ? "Saving…" : "Apply roles"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleAssignmentControls;
