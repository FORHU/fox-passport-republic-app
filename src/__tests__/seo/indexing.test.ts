// @vitest-environment node
import { afterEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * dev.foxpassport.com must say `noindex` in its HTML and its headers, and
 * production must stay indexable. The flag is read when the module loads, so
 * each case imports a fresh copy with the env it wants.
 */

async function load(flag?: string) {
  vi.resetModules();
  if (flag !== undefined) vi.stubEnv("NEXT_PUBLIC_DISABLE_INDEXING", flag);
  const seo = await import("@/shared/lib/seo");
  const { default: proxy } = await import("@/proxy");
  const { default: robots } = await import("@/app/robots");
  return { ...seo, proxy, robots };
}

// A real request carries Host; `new NextRequest(url)` does not add it.
const request = (url: string, headers?: Record<string, string>) =>
  new NextRequest(new URL(url), {
    headers: { host: new URL(url).host, ...headers },
  });

const robotsHeader = (res: Response) => res.headers.get("x-robots-tag");

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robotsMetadata", () => {
  it("hides a disabled build from every crawler, Googlebot included", async () => {
    const { robotsMetadata } = await load();
    expect(robotsMetadata(true)).toEqual({
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    });
  });

  it("keeps production indexable with its Googlebot preview settings", async () => {
    const { robotsMetadata } = await load();
    expect(robotsMetadata(false)).toMatchObject({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    });
  });
});

describe("indexing flag", () => {
  it.each([undefined, "", "false", "1"])(
    "leaves the site indexable when the flag is %j",
    async (flag) => {
      const { indexingDisabled, robots } = await load(flag);
      expect(indexingDisabled).toBe(false);
      expect(robots().sitemap).toBe("https://foxpassport.com/sitemap.xml");
    },
  );

  it("hides the site and drops the Sitemap line when the flag is true", async () => {
    const { indexingDisabled, robots } = await load("true");
    expect(indexingDisabled).toBe(true);
    const txt = robots();
    expect(txt.sitemap).toBeUndefined();
    // Still crawlable: a crawler must fetch a page to read its noindex.
    expect(JSON.stringify(txt.rules)).toContain('"allow":["/"');
  });
});

describe("proxy: X-Robots-Tag", () => {
  it("does not hide production", async () => {
    const { proxy } = await load();
    const res = await proxy(request("https://foxpassport.com/"));
    expect(robotsHeader(res)).toBeNull();
  });

  it.each(["/", "/categories", "/_next/image?url=%2Flogo.png&w=640&q=75"])(
    "hides dev.foxpassport.com%s",
    async (path) => {
      const { proxy } = await load();
      const res = await proxy(request(`https://dev.foxpassport.com${path}`));
      expect(robotsHeader(res)).toBe("noindex, nofollow");
    },
  );

  it("hides dev behind a proxy that rewrites Host", async () => {
    const { proxy } = await load();
    const res = await proxy(
      request("http://10.0.0.5:6001/", {
        "x-forwarded-host": "dev.foxpassport.com",
      }),
    );
    expect(robotsHeader(res)).toBe("noindex, nofollow");
  });

  it("hides any host when the build sets the flag", async () => {
    const { proxy } = await load("true");
    const res = await proxy(request("https://staging2.foxpassport.com/"));
    expect(robotsHeader(res)).toBe("noindex, nofollow");
  });
});

describe("proxy matcher", () => {
  it("runs on optimized images but still skips static chunks and the API", async () => {
    const { config } = await import("@/proxy");
    const matcher = new RegExp(`^${config.matcher[0]}$`);
    expect(matcher.test("/_next/image")).toBe(true);
    expect(matcher.test("/_next/static/chunks/main.js")).toBe(false);
    expect(matcher.test("/api/health")).toBe(false);
  });
});
