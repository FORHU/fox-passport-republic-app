import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression guard for docs/responsive-plan.md section 3.1.
 *
 * The navbar previously showed its desktop menu at `md` (>=768) but hid the
 * hamburger at `sm` (>=640), leaving 640-767px with no navigation at all.
 * `md` is the single mobile/desktop line (plan section 5) — every toggle in the
 * navbar must agree on it.
 */
const read = (p: string) => readFileSync(join(process.cwd(), p), "utf-8");

describe("Navbar — no navigation dead zone", () => {
  const navbar = read("src/shared/components/layout/Navbar.tsx");

  it("uses no sm: breakpoint for show/hide toggles", () => {
    expect(navbar).not.toMatch(/sm:hidden/);
    expect(navbar).not.toMatch(/hidden sm:flex/);
  });

  it("hides the hamburger at md, where the desktop menu appears", () => {
    expect(navbar).toMatch(/flex md:hidden/);
    expect(navbar).toMatch(/hidden md:flex/);
  });

  it("agrees with the mobile menu panel's own breakpoint", () => {
    const panel = read(
      "src/shared/components/layout/navbar/NavMobileMenu.tsx",
    );
    expect(panel).toMatch(/md:hidden/);
    expect(panel).not.toMatch(/sm:hidden/);
  });

  it("agrees with useIsMobile", () => {
    expect(read("src/shared/hooks/useMobile.ts")).toMatch(
      /MOBILE_BREAKPOINT\s*=\s*768/,
    );
  });
});

describe("Builders are guarded below md", () => {
  const shells = [
    "src/app/foxer/create-event/page.tsx",
    "src/app/mayor/create-venue/_components/VenueCreationClient.tsx",
    "src/app/creator-dashboard/venues/[id]/edit/_components/VenueEditClient.tsx",
  ];

  it.each(shells)("%s renders BuilderDesktopOnly", (path) => {
    expect(read(path)).toMatch(/<BuilderDesktopOnly\b/);
  });

  it("the guard hides itself at md and covers the shell below it", () => {
    const guard = read("src/shared/components/layout/BuilderDesktopOnly.tsx");
    expect(guard).toMatch(/md:hidden/);
    expect(guard).toMatch(/absolute inset-0/);
  });
});
