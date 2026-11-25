import { describe, it, expect, vi } from "vitest";

const redirect = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  }),
);
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/shared/lib/server/auth", () => ({
  requireAuth: vi.fn(async () => ({ id: "u1" })),
}));

import UserIndex from "@/app/user/page";

/**
 * The Citizen Dashboard was removed. /user is still linked from back links and
 * the role-less dashboard fallback, so it sends you to your own public
 * passport, where the Passport tab goes.
 */
describe("/user", () => {
  it("redirects to the signed-in user's public passport", async () => {
    await expect(UserIndex()).rejects.toThrow("NEXT_REDIRECT /user/u1");
    expect(redirect).toHaveBeenCalledWith("/user/u1");
  });
});
