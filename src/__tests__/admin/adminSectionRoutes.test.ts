import { describe, it, expect, vi, beforeEach } from "vitest";

// `notFound` and `redirect` throw in Next; mirror that so the page stops there.
const nav = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn((to: string) => {
    throw new Error(`NEXT_REDIRECT ${to}`);
  }),
}));
vi.mock("next/navigation", () => nav);

const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
const user = vi.hoisted(() => ({ permissions: [] as string[] }));
vi.mock("@/shared/lib/server/auth", () => auth);

import AdminSectionPage from "@/app/admin/(console)/[section]/page";
import {
  ADMIN_SECTIONS,
  adminSectionHref,
  getAdminSection,
  isAdminSection,
} from "@/features/admin/sections";

const visit = (section: string) =>
  AdminSectionPage({ params: Promise.resolve({ section }) });

/**
 * Every admin section used to share the URL `/admin`: the section lived only
 * in client state, so it could not be linked to and was lost on refresh.
 */
describe("admin section URLs", () => {
  beforeEach(() => {
    nav.notFound.mockClear();
    nav.redirect.mockClear();
    auth.requireAdmin.mockReset();
    auth.requireAdmin.mockResolvedValue(user);
    user.permissions = ["admin:access", "queue:read"];
  });

  it("gives the dashboard /admin and every other section /admin/<id>", () => {
    expect(adminSectionHref("dashboard")).toBe("/admin");
    expect(adminSectionHref("citizens")).toBe("/admin/citizens");
    expect(adminSectionHref("platform-fees")).toBe("/admin/platform-fees");
  });

  it("has unique section ids", () => {
    const ids = ADMIN_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("knows which ids are sections", () => {
    expect(isAdminSection("venues")).toBe(true);
    expect(isAdminSection("bogus")).toBe(false);
    expect(isAdminSection(undefined)).toBe(false);
  });

  it("404s an unknown section", async () => {
    await expect(visit("bogus")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(auth.requireAdmin).not.toHaveBeenCalled();
  });

  it("sends /admin/dashboard to the canonical /admin", async () => {
    await expect(visit("dashboard")).rejects.toThrow("NEXT_REDIRECT /admin");
  });

  it("opens a section the admin holds the permission for", async () => {
    user.permissions.push(getAdminSection("citizens")!.permission);
    await expect(visit("citizens")).resolves.toBeNull();
    expect(auth.requireAdmin).toHaveBeenCalledTimes(1);
  });

  it("sends a section the viewer may not open back to /admin", async () => {
    // The admin secretary: queue permissions only, no users:read.
    await expect(visit("citizens")).rejects.toThrow("NEXT_REDIRECT /admin");
    await expect(visit("venues")).resolves.toBeNull();
  });
});
