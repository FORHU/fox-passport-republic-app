interface PartnerCheckable {
  roleType?: string[] | null;
  systemRole?: string | null;
}

// Partner Foxers (investors) get partner-tier treatment — the "Partner Foxer"
// badge and gold styling — across Republic Foxer profiles and posts.
// Centralized here so every surface — the current user, a post's author, or a
// viewed profile — agrees on the same rule instead of re-deriving it inline
// per component. Admins used to be included, which publicly badged them as
// Partner Foxers without the role; what an admin may post is a permission
// (ComposePostBox), not this badge.
export function isPartnerUser(user: PartnerCheckable): boolean {
  return !!user.roleType?.includes("investor");
}
