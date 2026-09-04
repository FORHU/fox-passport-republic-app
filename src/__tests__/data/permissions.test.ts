import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  hasPermission,
  canAccessAdmin,
  PERMISSIONS,
} from "@/shared/lib/permissions";

/**
 * The app is told its permissions; it does not work them out.
 *
 * There used to be a copy of the API's grant table here, consulted whenever a
 * user arrived without a `permissions` array. Two hand-maintained answers to
 * one question is the shape that drifts — mapanytime's client copy drifted so
 * far that none of its role names or permission codes exist in its own API.
 * The API now derives the list on login, refresh, the Google exchange and
 * `/profile`, and this file holds only the vocabulary.
 */

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf-8");

describe("permissions come from the server", () => {
  it("reads the user's list and nothing else", () => {
    const secretary = {
      systemRole: "admin_secretary",
      permissions: ["admin:access", "queue:read", "queue:decide"],
    };
    expect(canAccessAdmin(secretary)).toBe(true);
    expect(hasPermission(secretary, "queue:decide")).toBe(true);
    expect(hasPermission(secretary, "users:read")).toBe(false);
    expect(hasPermission(secretary, "refunds:manage")).toBe(false);
  });

  it("never infers anything from the role name", () => {
    // The most important case in this file. An admin with no list from the
    // server holds nothing here — because the app is not entitled to guess,
    // and the API would refuse anyway.
    expect(canAccessAdmin({ systemRole: "admin" })).toBe(false);
    expect(hasPermission({ systemRole: "admin" }, "users:read")).toBe(false);
  });

  it("treats an empty list as empty", () => {
    expect(canAccessAdmin({ systemRole: "admin", permissions: [] })).toBe(
      false,
    );
  });

  it("denies a missing user", () => {
    expect(canAccessAdmin(null)).toBe(false);
    expect(canAccessAdmin(undefined)).toBe(false);
    expect(hasPermission({}, "queue:read")).toBe(false);
  });
});

describe("the app owns no grant decision", () => {
  it.each([
    "src/shared/lib/permissions.ts",
    "src/shared/constants/permissions.ts",
    "src/shared/constants/roles.ts",
  ])("%s holds no role-to-permission map", (path) => {
    const source = read(path);
    expect(source).not.toMatch(/GRANTS/);
    expect(source).not.toMatch(/admin_secretary["']?\s*:/);
    expect(source).not.toMatch(/permissionsFor\s*\(/);
  });

  it("keeps the vocabulary in constants, not beside the logic", () => {
    // The names are shared with role lists and nav items; the question
    // `hasPermission` answers is not. Splitting them keeps a future import of
    // the vocabulary from dragging in the auth helpers.
    expect(read("src/shared/lib/permissions.ts")).toMatch(
      /from "@\/shared\/constants\/permissions"/,
    );
  });
});

describe("the vocabulary matches the API's", () => {
  // The API is a sibling checkout in this workspace. Skipped rather than
  // failed when it is absent, so CI on this repo alone stays green — the check
  // is here to catch drift on a developer's machine, where both are present.
  const apiPermissions = join(
    process.cwd(),
    "..",
    "fox-passport-republic-api",
    "src",
    "types",
    "permissions.ts",
  );

  it("is declared once, in shared/constants", () => {
    // Anywhere else re-declaring it would be a second vocabulary to keep in
    // step, which is the thing this file exists to prevent.
    const lib = read("src/shared/lib/permissions.ts");
    expect(lib).not.toMatch(/export const PERMISSIONS = \[/);
  });

  it.runIf(existsSync(apiPermissions))("same names, same order", () => {
    const source = readFileSync(apiPermissions, "utf-8");
    const block = source.match(
      /export const PERMISSIONS = \[([\s\S]*?)\] as const;/,
    );
    expect(block, "could not find PERMISSIONS in the API").not.toBeNull();
    const names = [...block![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(names).toEqual([...PERMISSIONS]);
  });
});

describe("the gates are expressed as capabilities", () => {
  it.each([
    "middleware.ts",
    "src/shared/lib/server/auth.ts",
    "src/features/admin/components/AdminAuthGuard.tsx",
    "src/shared/lib/dashboard-path.ts",
  ])("%s no longer compares systemRole to a literal", (path) => {
    expect(read(path)).not.toMatch(/systemRole\s*[!=]==\s*["']admin["']/);
  });

  it("every admin nav item names the permission it needs", () => {
    const sidebar = read("src/features/admin/components/AdminSidebar.tsx");
    const items = sidebar.match(/label: "/g) ?? [];
    const perms = sidebar.match(/permission: "/g) ?? [];
    expect(perms.length).toBe(items.length);
  });
});

/**
 * `/admin` fetched eight things in one `Promise.all` for every admin, including
 * `/users`, which needs `users:read`. `admin_secretary` does not hold it, the
 * API answered 403, `serverFetch` throws on a non-ok response, and the whole
 * page went down — so the role could not open the console at all.
 *
 * Nothing caught it: 41 tests pinned the grant table and the nav, and none of
 * them rendered a page. Found by signing in as the role for the first time.
 */
describe("the admin page asks only for what the viewer may read", () => {
  const page = read("src/app/admin/page.tsx");

  it.each([
    ["getUsers", "users:read"],
    ["getAllBookings", "bookings:read:all"],
  ])("%s is gated on %s", (fetcher, permission) => {
    const call = page.indexOf(`${fetcher}()`);
    expect(
      call,
      `${fetcher}() is not called on the admin page`,
    ).toBeGreaterThan(-1);
    const guard = page.lastIndexOf(
      `hasPermission(user, "${permission}")`,
      call,
    );
    expect(
      guard,
      `${fetcher}() is not guarded by ${permission} — a role without it cannot open /admin`,
    ).toBeGreaterThan(-1);
  });
});
