import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RankBadge } from "@/features/gamification/components/RankBadge";
import { getRankInfo } from "@/features/gamification/types/gamification";

describe("RankBadge component", () => {
  it("renders Citizen rank correctly for level 1 (Newcomer)", () => {
    render(<RankBadge level={1} isCitizen={true} showTitle={true} />);
    expect(screen.getByText(/Newcomer/)).toBeTruthy();
    const img = screen.getByAltText(/Newcomer/i) as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain("rank-1-newcomer.svg");
  });

  it("renders Citizen rank correctly for level 5 (Explorer)", () => {
    render(<RankBadge level={5} isCitizen={true} showTitle={true} />);
    expect(screen.getByText(/Explorer/)).toBeTruthy();
    const img = screen.getByAltText(/Explorer/i) as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain("rank-3-explorer.svg");
  });

  it("renders Foxer rank correctly for level 1 (Rookie)", () => {
    render(<RankBadge level={1} isCitizen={false} showTitle={true} />);
    expect(screen.getByText(/Rookie/)).toBeTruthy();
  });

  it("renders Foxer rank correctly for level 50+ (Legend)", () => {
    render(<RankBadge level={50} isCitizen={false} showTitle={true} />);
    expect(screen.getByText(/Legend/)).toBeTruthy();
    const img = screen.getByAltText(/Legend/i) as HTMLImageElement;
    expect(img.src).toContain("rank-9-legend.svg");
  });

  it("maps all 9 rank tiers accurately in getRankInfo", () => {
    expect(getRankInfo(1, true).title).toBe("Newcomer");
    expect(getRankInfo(3, true).title).toBe("Wanderer");
    expect(getRankInfo(5, true).title).toBe("Explorer");
    expect(getRankInfo(10, true).title).toBe("Trailblazer");
    expect(getRankInfo(15, true).title).toBe("Voyager");
    expect(getRankInfo(20, true).title).toBe("Adventurer");
    expect(getRankInfo(30, true).title).toBe("Pioneer");
    expect(getRankInfo(40, true).title).toBe("Vanguard");
    expect(getRankInfo(50, true).title).toBe("Legend");
  });
});
