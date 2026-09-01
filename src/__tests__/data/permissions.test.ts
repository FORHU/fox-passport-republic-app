import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  hasPermission,
  canAccessAdmin,
  permissionsFor,
  PERMISSIONS,
} from "@/shared/lib/permissions";

/**
 * This table decides what renders, never what is permitted — the API re-derives
 * every guard from the role. But getting it wrong shows someone a screen that
 * then 403s, so the secretary's boundary is pinned here as well as server-side.
 */

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf-8");

describe("admin_secretary", () => {
  const secretary = { systemRole: "admin_secretary" };

  it("reaches the admin console", () => {
    expect(canAccessAdmin(secretary)).toBe(true);
  });

  it("works the queues", () => {
    expect(hasPermission(secretary, "queue:read")).toBe(true);
    expect(hasPermission(secretary, "queue:decide")).toBe(true);
  });

  it("cannot see who anyone is, or change it", () => {
    expect(hasPermission(secretary, "users:read")).toBe(false);
    expect(hasPermission(secretary, "roles:manage")).toBe(false);
    expect(hasPermission(secretary, "bookings:read:all")).toBe(false);
    expect(hasPermission(secretary, "categories:manage")).toBe(false);
  });
});

describe("the other roles", () => {
  it("admin holds everything", () => {
    for (const p of PERMISSIONS) {
      expect(hasPermission({ systemRole: "admin" }, p)).toBe(true);
    }
  });

  it("a citizen holds nothing, and cannot reach admin", () => {
    expect(permissionsFor("user")).toEqual([]);
    expect(canAccessAdmin({ systemRole: "user" })).toBe(false);
  });

  it("denies unknown roles rather than defaulting them", () => {
    for (const role of ["super_admin", "moderator", "", null, undefined]) {
      expect(canAccessAdmin({ systemRole: role as string })).toBe(false);
    }
    expect(canAccessAdmin(null)).toBe(false);
  });
});

describe("the user's own list wins over the table", () => {
  it("uses permissions from the token when present", () => {
    const withClaim = { systemRole: "user", permissions: ["admin:access"] };
    expect(canAccessAdmin(withClaim)).toBe(true);
  });

  it("and an empty claim means empty, not fall back", () => {
    const stripped = { systemRole: "admin", permissions: [] };
    expect(canAccessAdmin(stripped)).toBe(false);
  });
});

describe("the gates are expressed as capabilities", () => {
  it.each([
    "middleware.ts",
    "src/shared/lib/server/auth.ts",
    "src/features/admin/components/AdminAuthGuard.tsx",
    "src/shared/lib/dashboard-path.ts",
  ])("%s no longer compares systemRole to a literal", (path) => {
    const source = read(path);
    expect(source).not.toMatch(/systemRole\s*[!=]==\s*["']admin["']/);
  });

  it("every admin nav item names the permission it needs", () => {
    const sidebar = read("src/features/admin/components/AdminSidebar.tsx");
    const items = sidebar.match(/\{ label: "/g) ?? [];
    const perms = sidebar.match(/permission: "/g) ?? [];
    expect(perms.length).toBe(items.length);
  });
});
