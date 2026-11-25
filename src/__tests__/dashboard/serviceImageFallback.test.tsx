import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ServicesSection } from "@/features/dashboard/components/InventoryServicesSection";
import { PerformersSection } from "@/features/dashboard/components/PerformersSection";
import type { ServiceItem } from "@/features/dashboard/data/dashboardData";

vi.mock("next/image", () => ({
  default: ({ alt, fill: _fill, ...props }: any) => (
    <img alt={alt ?? ""} {...props} />
  ),
}));

// Money reads the currency context; the amount itself is not under test.
vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

/**
 * api#443: a service picture that fails to load shows the service's
 * placeholder, never the browser's broken-image icon with its alt text.
 */

function service(overrides: Partial<ServiceItem> = {}): ServiceItem {
  return {
    id: "s1",
    name: "Serbicio y Polio",
    price: 100,
    priceUnit: "hourly",
    status: "Paused",
    icon: "restaurant",
    color: "text-orange-400 bg-orange-500/20",
    img: "https://cdn.example.com/users/u1/uploads/a.jpg",
    category: "catering",
    ...overrides,
  };
}

const picture = () => screen.queryByRole("img", { name: "Serbicio y Polio" });
const placeholder = (icon: string) => screen.queryByText(icon);

describe("service pictures on the dashboard", () => {
  it("shows the picture while it loads", () => {
    render(<ServicesSection services={[service()]} />);
    expect(picture()).toHaveAttribute(
      "src",
      "https://cdn.example.com/users/u1/uploads/a.jpg",
    );
    expect(placeholder("restaurant")).toBeNull();
  });

  it("shows the placeholder when there is no picture", () => {
    render(<ServicesSection services={[service({ img: undefined })]} />);
    expect(picture()).toBeNull();
    expect(placeholder("restaurant")).toBeInTheDocument();
  });

  it("swaps a picture that fails to load for the placeholder", () => {
    render(<ServicesSection services={[service()]} />);
    fireEvent.error(picture()!);
    expect(picture()).toBeNull();
    expect(placeholder("restaurant")).toBeInTheDocument();
  });

  it("catches a picture that failed before React was listening", () => {
    const complete = vi
      .spyOn(HTMLImageElement.prototype, "complete", "get")
      .mockReturnValue(true);
    const width = vi
      .spyOn(HTMLImageElement.prototype, "naturalWidth", "get")
      .mockReturnValue(0);
    try {
      render(<ServicesSection services={[service()]} />);
      expect(picture()).toBeNull();
      expect(placeholder("restaurant")).toBeInTheDocument();
    } finally {
      complete.mockRestore();
      width.mockRestore();
    }
  });

  it("gives a replaced picture its own chance to load", () => {
    const { rerender } = render(<ServicesSection services={[service()]} />);
    fireEvent.error(picture()!);
    rerender(
      <ServicesSection
        services={[service({ img: "https://cdn.example.com/users/u1/uploads/b.jpg" })]}
      />,
    );
    expect(picture()).toHaveAttribute(
      "src",
      "https://cdn.example.com/users/u1/uploads/b.jpg",
    );
  });

  it("does the same on a Performer gig card", () => {
    render(
      <PerformersSection
        services={[service({ category: "photography", icon: "camera_alt" })]}
      />,
    );
    fireEvent.error(picture()!);
    expect(picture()).toBeNull();
    expect(screen.getAllByText("camera_alt").length).toBeGreaterThan(0);
  });
});
