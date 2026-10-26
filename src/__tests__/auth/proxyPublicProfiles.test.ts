// @vitest-environment node
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import proxy from "../../proxy";

/**
 * A citizen's profile, `/user/<id>`, is public inside the otherwise signed-in
 * `/user` tree: a signed-out visitor (or a search engine) gets the page, not a
 * redirect to sign in. Everything else under `/user` stays signed-in.
 */

const visit = (path: string) =>
  proxy(new NextRequest(new URL(path, "https://foxpassport.com")));

const redirectsToSignIn = (res: Response) =>
  res.status === 307 &&
  (res.headers.get("location") ?? "").includes("auth=required");

describe("proxy: public citizen profiles", () => {
  it.each(["/user/3f2a9c1e-uuid", "/user/ana_reyes", "/user/ana_reyes/"])(
    "lets a signed-out visitor open %s",
    async (path) => {
      const res = await visit(path);
      expect(redirectsToSignIn(res)).toBe(false);
    },
  );

  it.each([
    "/user",
    "/user/passport",
    "/user/settings",
    "/user/ana_reyes/connections",
  ])("still sends a signed-out visitor to sign in from %s", async (path) => {
    expect(redirectsToSignIn(await visit(path))).toBe(true);
  });
});
