import api from "@/shared/lib/axios";
import type { RoleType, SystemRole } from "@/shared/constants/roles";

/**
 * The two writes that hand out capability.
 *
 * Both refuse for reasons the person needs to see rather than a generic
 * failure — you cannot change your own roles, and the last administrator
 * cannot be demoted — so the refusal `reason` is surfaced rather than swallowed.
 */

export interface RoleAssignmentResult {
  id: string;
  email: string;
  systemRole: SystemRole;
  roleType: RoleType[];
}

/** Turns the API's `{ message, reason }` refusal into something throwable. */
function toError(e: unknown): Error {
  const res = (e as { response?: { data?: { message?: string } } })?.response;
  return new Error(res?.data?.message ?? "Could not change roles");
}

export async function changeSystemRole(
  userId: string,
  systemRole: SystemRole,
): Promise<RoleAssignmentResult> {
  try {
    const { data } = await api.patch(`/admin/users/${userId}/system-role`, {
      systemRole,
    });
    return data.data;
  } catch (e) {
    throw toError(e);
  }
}

export async function changeRoleTypes(
  userId: string,
  roleType: RoleType[],
): Promise<RoleAssignmentResult> {
  try {
    const { data } = await api.patch(`/admin/users/${userId}/role-types`, {
      roleType,
    });
    return data.data;
  } catch (e) {
    throw toError(e);
  }
}
