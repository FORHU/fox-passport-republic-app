// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HouseRules } from "@/features/venue/components/detail";

afterEach(cleanup);

describe("HouseRules (api#433)", () => {
  it("shows the venue's own policies", () => {
    render(<HouseRules policies={["No confetti", "Out by 10 PM"]} />);

    expect(screen.getByText("No confetti")).toBeDefined();
    expect(screen.getByText("Out by 10 PM")).toBeDefined();
    expect(screen.queryByText(/hasn't listed any rules/i)).toBeNull();
  });

  it("invents no rules or safety equipment for a venue without them", () => {
    render(<HouseRules policies={[]} />);

    expect(screen.getByText(/hasn't listed any rules/i)).toBeDefined();
    expect(screen.queryByText(/outside catering/i)).toBeNull();
    expect(screen.queryByText(/alarm|security camera/i)).toBeNull();
  });

  it("promises no refund when the venue has no cancellation policy", () => {
    render(<HouseRules cancellationPolicy={null} />);

    expect(screen.getByText(/no refund is offered/i)).toBeDefined();
    expect(screen.queryByText(/free cancellation/i)).toBeNull();
    expect(screen.queryByText(/flexible/i)).toBeNull();
  });

  it("lists every rule, most notice first", () => {
    render(
      <HouseRules
        cancellationPolicy={{
          name: "Flexible",
          rules: [
            { hoursBeforeEvent: 0, refundPercent: 50 },
            { hoursBeforeEvent: 24, refundPercent: 100 },
          ],
        }}
      />,
    );

    expect(screen.getByText("Cancellation Policy (Flexible)")).toBeDefined();
    expect(
      screen.getAllByText(/refund if cancelled/i).map((n) => n.textContent),
    ).toEqual([
      "100% refund if cancelled at least 24 hours before the event starts.",
      "50% refund if cancelled before the event starts.",
    ]);
  });

  it("says non-refundable when no rule refunds anything", () => {
    render(
      <HouseRules
        cancellationPolicy={{
          name: "Non-Refundable",
          rules: [{ hoursBeforeEvent: 0, refundPercent: 0 }],
        }}
      />,
    );

    expect(screen.getByText(/^Non-refundable\./)).toBeDefined();
  });
});
