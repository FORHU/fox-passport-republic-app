import { describe, it, expect, vi } from "vitest";
import { useInvoiceStatusPoll } from "../useInvoiceStatus";
import * as ReactQuery from "@tanstack/react-query";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

describe("useInvoiceStatusPoll refetchInterval logic", () => {
  it("polls while paymentStatus is pending — the real pre-confirmation value, not 'processing'", () => {
    useInvoiceStatusPoll("inv-123");

    const config = vi.mocked(ReactQuery.useQuery).mock.calls[0][0] as any;
    const refetchInterval = config.refetchInterval;

    // This is the case that matters most: right after a Stripe redirect,
    // before the webhook has landed, the API reports "pending" — never
    // "processing", which nothing in the backend ever sets. A regression
    // back to checking "processing" would pass every other assertion below
    // and still silently stop the success page from ever polling.
    expect(
      refetchInterval({ state: { data: { paymentStatus: "pending" } } }),
    ).toBe(2000);
  });

  it("stops polling on every terminal paymentStatus", () => {
    useInvoiceStatusPoll("inv-123");
    const config = vi.mocked(ReactQuery.useQuery).mock.calls[0][0] as any;
    const refetchInterval = config.refetchInterval;

    for (const status of [
      "paid",
      "failed",
      "cancelled",
      "refunded",
      "partially_refunded",
    ]) {
      expect(
        refetchInterval({ state: { data: { paymentStatus: status } } }),
      ).toBe(false);
    }
  });

  it("stops polling when there is no data yet", () => {
    useInvoiceStatusPoll("inv-123");
    const config = vi.mocked(ReactQuery.useQuery).mock.calls[0][0] as any;
    const refetchInterval = config.refetchInterval;

    expect(refetchInterval({ state: { data: undefined } })).toBe(false);
  });
});
