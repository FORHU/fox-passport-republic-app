/**
 * #405: the Service Studio's preview shows the unsaved form as the public
 * listing, and closing it hands back to the Studio.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ServicePreviewModal,
  type ServicePreviewModalProps,
} from "../ServicePreviewModal";

vi.mock("@/shared/providers/CurrencyProvider", () => ({
  useCurrency: () => ({ format: (n: number) => `₱${n.toFixed(2)}` }),
}));

vi.mock("@/shared/api/cancellation-policies", () => ({
  fetchCancellationPolicies: () =>
    Promise.resolve([
      {
        id: "p1",
        name: "Non-Refundable",
        description: "No refunds once booked.",
        isDefault: false,
        rules: [],
      },
    ]),
}));

const base: ServicePreviewModalProps = {
  open: true,
  onClose: () => {},
  lowerNoun: "service",
  title: "Serbicio y Polio",
  description: "QA Sample",
  displayCategory: "Service Staff",
  image: "data:image/png;base64,AAAA",
  price: 100,
  unit: "Per Hour",
  status: "paused",
  cancellationPolicyId: "p1",
  city: "City of Baguio",
  country: "Philippines",
};

function renderPreview(props: Partial<ServicePreviewModalProps> = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ServicePreviewModal {...base} {...props} />
    </QueryClientProvider>,
  );
}

describe("ServicePreviewModal", () => {
  it("renders nothing while closed", () => {
    renderPreview({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows what the creator entered", async () => {
    renderPreview();
    const dialog = screen.getByRole("dialog", {
      name: "Preview of Serbicio y Polio",
    });
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Serbicio y Polio" }),
    ).toBeInTheDocument();
    expect(screen.getByText("QA Sample")).toBeInTheDocument();
    expect(screen.getByText("Service Staff")).toBeInTheDocument();
    expect(screen.getByText("₱100.00 / hr")).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.getByText("City of Baguio, Philippines")).toBeInTheDocument();
    expect(screen.getByAltText("Serbicio y Polio")).toHaveAttribute(
      "src",
      base.image,
    );
    expect(await screen.findByText("Non-Refundable")).toBeInTheDocument();
  });

  it("shows placeholders for an empty form", () => {
    renderPreview({
      title: "  ",
      description: "",
      image: "",
      city: "",
      country: "",
      cancellationPolicyId: null,
    });
    expect(
      screen.getByRole("heading", { name: "Untitled service" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No description yet.")).toBeInTheDocument();
    expect(screen.getByText("No location yet.")).toBeInTheDocument();
    expect(
      screen.getByText("No cancellation policy picked yet."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("leaves out the location when the page doesn't give one", () => {
    renderPreview({ city: undefined, country: undefined });
    expect(
      screen.queryByRole("heading", { name: "Location" }),
    ).not.toBeInTheDocument();
  });

  it("uses the Gig Studio's words", () => {
    renderPreview({
      title: "",
      lowerNoun: "gig",
    });
    expect(
      screen.getByRole("heading", { name: "Untitled gig" }),
    ).toBeInTheDocument();
  });

  it("closes from Back to editing and from Escape", () => {
    const onClose = vi.fn();
    renderPreview({ onClose });
    fireEvent.click(screen.getByRole("button", { name: /Back to editing/ }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("keeps booking turned off", () => {
    renderPreview();
    expect(
      screen.getByRole("button", { name: /Proceed to Payment/ }),
    ).toBeDisabled();
  });
});
