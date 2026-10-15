interface PartnerCheckable {
  roleType?: string[] | null;
  systemRole?: string | null;
}

// Partner Foxers (investors) and admins get partner-tier treatment across
// Republic Foxer profiles, posts, and compose options. Centralized here so
// every surface — the current user, a post's author, or a viewed profile —
// agrees on the same rule instead of re-deriving it inline per component.
export function isPartnerUser(user: PartnerCheckable): boolean {
  return !!user.roleType?.includes("investor") || user.systemRole === "admin";
}
