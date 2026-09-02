import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * `ACCESS_TOKEN_SECRET` is the API's signing key, and HS256 is symmetric: the
 * value that verifies a token also mints one. While `middleware.ts` verified
 * the session cookie itself, this app held that key - which meant the frontend
 * could forge an admin token for its own backend.
 *
 * The middleware now checks only that a cookie is present. Authentication and
 * authorization are the API's, plus the page-level `requireAuth`/`requireAdmin`
 * guards that read a live `/profile` rather than a cookie claim.
 *
 * These are source scans, which are the weak kind of test - but the thing being
 * guarded is an absence, and an absence has no behaviour to assert. The failure
 * they catch is someone reaching for `jwtVerify` again and quietly copying the
 * secret back into this repo's environment.
 */

/**
 * Comments are stripped before matching, for the same reason
 * `queryDefaults.test.ts` strips them: the comment in `middleware.ts` that
 * explains why the secret is gone has to name it, and a scan of raw source
 * would fail against the very code it is meant to approve.
 */
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const root = process.cwd();
const read = (rel: string) =>
  stripComments(readFileSync(join(root, rel), "utf-8"));

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      sourceFiles(full, acc);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

describe("the frontend holds no backend signing key", () => {
  it("middleware.ts does not read ACCESS_TOKEN_SECRET", () => {
    expect(read("middleware.ts")).not.toMatch(/ACCESS_TOKEN_SECRET/);
  });

  it("middleware.ts does not verify the token itself", () => {
    const middleware = read("middleware.ts");
    expect(middleware).not.toMatch(/jwtVerify/);
    expect(middleware).not.toMatch(/from "jose"/);
  });

  it("no source file anywhere reads it", () => {
    const offenders = [
      join(root, "middleware.ts"),
      ...sourceFiles(join(root, "src")),
    ]
      .filter((file) =>
        stripComments(readFileSync(file, "utf-8")).includes(
          "ACCESS_TOKEN_SECRET",
        ),
      )
      // This file names the variable in code, not just in prose.
      .filter((file) => !file.endsWith("middlewareSecrets.test.ts"));

    expect(
      offenders,
      `these still read the API's signing key: ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("the env example does not tell anyone to copy it in", () => {
    expect(read(".env.example")).not.toMatch(/ACCESS_TOKEN_SECRET/);
  });
});

describe("what middleware still does", () => {
  const middleware = read("middleware.ts");

  it("gates on the presence of the session cookie", () => {
    expect(middleware).toMatch(/cookies\.get\(TOKEN_COOKIE\)/);
    expect(middleware).toMatch(/redirectToLogin/);
  });

  it("reads the same cookie name the login flow writes", () => {
    const authActions = read("src/shared/lib/server/auth-actions.ts");
    const name = middleware.match(/const TOKEN_COOKIE = "([^"]+)"/)?.[1];
    expect(name, "middleware no longer names a cookie").toBeTruthy();
    expect(authActions).toContain(`"${name}"`);
  });
});

/**
 * Moving the check out of the middleware moved it somewhere weaker unless every
 * protected tree grew a guard of its own - and six of them had none, because
 * they had been leaning on the edge check nobody remembered was load-bearing.
 *
 * The routes are read out of `middleware.ts` rather than restated here, so
 * adding one to `PROTECTED_ROUTES` without guarding it fails this.
 */
describe("every protected route tree guards itself", () => {
  const middleware = read("middleware.ts");
  const routes = (
    middleware.match(/const PROTECTED_ROUTES = \[([\s\S]*?)\]/)?.[1] ?? ""
  )
    .split(",")
    .map((entry) => entry.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  const GUARDS = /requireAuth|requireAdmin|requireHost|RequireAuth/;

  it("reads the route list out of the middleware", () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it.each(routes)("%s is guarded", (route) => {
    const dir = join(root, "src", "app", route.replace(/^\//, ""));
    let pages: string[];
    try {
      pages = sourceFiles(dir).filter((file) => file.endsWith("page.tsx"));
    } catch {
      // A route with no pages yet - nothing to guard, and the middleware
      // redirect still applies the day one appears.
      return;
    }
    if (pages.length === 0) return;

    // Comments are stripped first: every one of these layouts *explains*
    // `requireAuth` in its header, so a raw scan would call a file guarded on
    // the strength of its own prose.
    const layout = join(dir, "layout.tsx");
    let treeGuarded = false;
    try {
      treeGuarded = GUARDS.test(stripComments(readFileSync(layout, "utf-8")));
    } catch {
      treeGuarded = false;
    }
    if (treeGuarded) return;

    // No tree-level guard, so every page has to carry its own.
    const unguarded = pages.filter(
      (file) => !GUARDS.test(stripComments(readFileSync(file, "utf-8"))),
    );
    expect(
      unguarded,
      `no layout guard on ${route}, and these pages have none either`,
    ).toEqual([]);
  });
});
