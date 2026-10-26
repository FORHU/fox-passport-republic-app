import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type React from "react";

vi.mock("@/features/booking/api/bookings", () => ({
  checkInBooking: vi.fn(),
}));
const scanFile = vi.hoisted(() => vi.fn());
vi.mock("html5-qrcode", () => ({
  Html5Qrcode: vi.fn(() => ({ scanFile, clear: vi.fn() })),
}));

import { useQRScanner } from "@/app/creator-dashboard/_components/scanner/useQRScanner";

const pick = (file: File) =>
  ({
    target: { files: [file], value: "C:\\fakepath\\" + file.name },
  }) as unknown as React.ChangeEvent<HTMLInputElement>;

/**
 * Uploading a PDF or EXE to the check-in scanner used to fail as "Could not
 * detect a valid QR code in this image", which never said the file was the
 * problem.
 */
describe("QR scanner upload", () => {
  it("says a non-image file isn't supported, without trying to scan it", async () => {
    const { result } = renderHook(() => useQRScanner());
    const event = pick(
      new File(["%PDF"], "ticket.pdf", { type: "application/pdf" }),
    );

    await act(() => result.current.handleFileUpload(event));

    expect(result.current.scanState).toBe("error");
    expect(result.current.lastResult?.message).toMatch(/isn't an image/i);
    expect(scanFile).not.toHaveBeenCalled();
    // Cleared, so choosing the same file again still triggers a change.
    expect(event.target.value).toBe("");
  });
});
