import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useYearsOfExperienceInput } from "../useYearsOfExperienceInput";

describe("useYearsOfExperienceInput", () => {
  it("accepts edits up to 30 with no message", () => {
    const { result } = renderHook(() => useYearsOfExperienceInput());

    let accepted = false;
    act(() => {
      accepted = result.current.accept("30");
    });

    expect(accepted).toBe(true);
    expect(result.current.error("30")).toBeNull();
  });

  it("refuses an edit over 30, says why and points to the claim", () => {
    const { result } = renderHook(() => useYearsOfExperienceInput());

    let accepted = true;
    act(() => {
      accepted = result.current.accept("31");
    });

    // The field keeps "3", and the message explains the refusal.
    expect(accepted).toBe(false);
    expect(result.current.error("3")).toBe(
      "Maximum is 30 years. More than that? Tick the box below.",
    );

    act(() => {
      result.current.accept("2");
    });
    expect(result.current.error("2")).toBeNull();
  });

  it("takes up to 50 once more than 30 is claimed (api#423)", () => {
    const { result, rerender } = renderHook(
      ({ max }) => useYearsOfExperienceInput(max),
      { initialProps: { max: 30 } },
    );

    act(() => {
      result.current.accept("42");
    });
    // Ticking the box raises the limit, and the old refusal no longer shows.
    rerender({ max: 50 });
    expect(result.current.error("4")).toBeNull();

    let accepted = false;
    act(() => {
      accepted = result.current.accept("42");
    });
    expect(accepted).toBe(true);

    act(() => {
      accepted = result.current.accept("51");
    });
    expect(accepted).toBe(false);
    expect(result.current.error("5")).toBe("Maximum is 50 years");
  });

  it("offers the claim only after an edit over 30 is refused", () => {
    const { result } = renderHook(() => useYearsOfExperienceInput());
    expect(result.current.offerClaim).toBe(false);

    act(() => {
      result.current.accept("3");
      result.current.accept("30");
      result.current.accept("2.5");
    });
    expect(result.current.offerClaim).toBe(false);

    act(() => {
      result.current.accept("31");
    });
    expect(result.current.offerClaim).toBe(true);

    // It stays, so the box doesn't vanish before it can be ticked.
    act(() => {
      result.current.accept("3");
    });
    expect(result.current.offerClaim).toBe(true);
  });

  it("offers the claim for a pasted 45 too", () => {
    const { result } = renderHook(() => useYearsOfExperienceInput());
    act(() => {
      result.current.accept("45");
    });
    expect(result.current.offerClaim).toBe(true);
  });

  it("keeps non-digit input and flags it (app#327)", () => {
    const { result } = renderHook(() => useYearsOfExperienceInput());

    let accepted = false;
    act(() => {
      accepted = result.current.accept("2.5");
    });

    expect(accepted).toBe(true);
    expect(result.current.error("2.5")).toBe("Enter whole years (0–30)");
  });
});
