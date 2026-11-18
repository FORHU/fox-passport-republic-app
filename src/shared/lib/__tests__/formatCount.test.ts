import { describe, expect, it } from "vitest";
import { formatCount } from "../formatCount";

describe("formatCount", () => {
  it("keeps small counts as they are", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(7)).toBe("7");
    expect(formatCount(999)).toBe("999");
  });

  it("shortens thousands and millions to one decimal, lowercase", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1234)).toBe("1.2k");
    expect(formatCount(25_400)).toBe("25.4k");
    expect(formatCount(1_500_000)).toBe("1.5m");
  });
});
