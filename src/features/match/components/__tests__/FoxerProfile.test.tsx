// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Foxer } from "@/shared/api/foxers";
import FoxerProfile from "../FoxerProfile";

/**
 * `/foxer/<id>` is public and indexable, so its server HTML has to carry the
 * profile itself. The page hands FoxerProfile the Foxer it fetched; rendered
 * on the server, that is the content, not the loading skeleton.
 */

const api = vi.hoisted(() => ({ fetchFoxerById: vi.fn() }));
vi.mock("@/shared/api/foxers", () => ({ fetchFoxerById: api.fetchFoxerById }));
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "88162d6b-5594-4510-b260-4444d9eadfec" }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/foxer/88162d6b-5594-4510-b260-4444d9eadfec",
}));

const foxer: Foxer = {
  id: "88162d6b-5594-4510-b260-4444d9eadfec",
  name: "Fox Partner",
  city: "Cebu City",
  state: "Cebu",
  roleType: ["providerFoxer"],
  createdAt: "2026-10-01T00:00:00.000Z",
  services: [],
};

function serverRender(initialFoxer?: Foxer) {
  return renderToString(
    <QueryClientProvider client={new QueryClient()}>
      <FoxerProfile initialFoxer={initialFoxer} />
    </QueryClientProvider>,
  );
}

describe("FoxerProfile server render", () => {
  it("puts the profile in the HTML when the page passes the Foxer", () => {
    const html = serverRender(foxer);
    expect(html).toContain("Fox Partner");
    expect(html).toContain("Cebu City, Cebu");
    expect(html).not.toContain("animate-pulse");
    expect(api.fetchFoxerById).not.toHaveBeenCalled();
  });

  it("renders only the skeleton without one", () => {
    const html = serverRender();
    expect(html).toContain("animate-pulse");
    expect(html).not.toContain("Fox Partner");
  });
});
