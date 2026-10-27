import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * /foxer/create-listing mounts exactly one builder, chosen by `?type=`. Both
 * builders share one store, and mounting both used to flip the Assets Studio
 * into service mode, so its My Drafts opened the Services list.
 */

const nav = vi.hoisted(() => ({ params: new URLSearchParams() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => nav.params,
}));
vi.mock("@/shared/auth/RequireAuth", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock(
  "@/features/asset/components/listing-builder",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@/features/asset/components/listing-builder")
    >()),
    ListingSidebar: () => null,
    ListingPreviewCard: () => null,
    ListingStatusPanel: () => null,
  }),
);

function fakeBuilder(activeType: string, myDraftsHref: string) {
  return {
    activeType,
    title: "",
    isSubmitting: false,
    error: null,
    isNotification: false,
    handleBack: vi.fn(),
    handleSaveDraft: vi.fn(),
    handlePublish: vi.fn(),
    myDraftsHref,
  };
}

const hooks = vi.hoisted(() => ({
  useInventoryBuilder: vi.fn(),
  useServicesBuilder: vi.fn(),
}));
vi.mock("@/features/asset/hooks/useInventoryBuilder", () => ({
  useInventoryBuilder: hooks.useInventoryBuilder,
}));
vi.mock("@/features/service/hooks/useServicesBuilder", () => ({
  useServicesBuilder: hooks.useServicesBuilder,
}));

import ListingBuilderClient from "../ListingBuilderClient";

beforeEach(() => {
  vi.clearAllMocks();
  hooks.useInventoryBuilder.mockReturnValue(
    fakeBuilder("inventory", "/creator-dashboard/assets?status=draft"),
  );
  hooks.useServicesBuilder.mockReturnValue(
    fakeBuilder("service", "/creator-dashboard/services?status=draft"),
  );
});

describe("listing builder page", () => {
  it("an Assets Studio mounts only the assets builder and links to Assets", () => {
    nav.params = new URLSearchParams();
    render(<ListingBuilderClient />);

    expect(hooks.useInventoryBuilder).toHaveBeenCalled();
    expect(hooks.useServicesBuilder).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: /my drafts/i })).toHaveAttribute(
      "href",
      "/creator-dashboard/assets?status=draft",
    );
  });

  it("?type=service mounts only the services builder and links to Services", () => {
    nav.params = new URLSearchParams("type=service");
    render(<ListingBuilderClient />);

    expect(hooks.useServicesBuilder).toHaveBeenCalled();
    expect(hooks.useInventoryBuilder).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: /my drafts/i })).toHaveAttribute(
      "href",
      "/creator-dashboard/services?status=draft",
    );
  });

  it("shows one My Drafts link and no View Draft or New Draft", () => {
    nav.params = new URLSearchParams();
    render(<ListingBuilderClient />);

    expect(screen.getAllByRole("link", { name: /my drafts/i })).toHaveLength(1);
    expect(screen.queryByText(/view draft/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/new draft/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save draft/i }),
    ).toBeInTheDocument();
  });
});
