import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import ProfileSettingsClient from "../ProfileSettingsClient";

/**
 * The phone field: a country-code picker over the project's countries, the
 * saved number shown in its country's grouping, E.164 sent on save, and an
 * empty field clearing the number.
 */

const profile = vi.hoisted(() => ({
  current: { name: "Ana", username: "ana", phone: "+639171234567" } as Record<
    string,
    unknown
  >,
}));
const updateProfile = vi.hoisted(() => vi.fn(async () => ({})));
vi.mock("@/features/user/hooks/useProfile", () => ({
  useProfile: () => ({
    profile: profile.current,
    isLoading: false,
    updateProfile,
    changePassword: vi.fn(),
    deleteAccount: vi.fn(),
  }),
}));
vi.mock("@/shared/auth/useLogout", () => ({ useLogout: () => vi.fn() }));
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (select: (s: unknown) => unknown) =>
    select({ user: { email: "ana@example.com" } }),
}));
vi.mock("@/features/user/components/AvatarUploader", () => ({
  default: () => null,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/shared/api/geo", () => ({
  fetchCountries: async () => [
    { code: "AQ", name: "Antarctica", flag: "🇦🇶", phoneCode: "", currency: "" },
    { code: "PH", name: "Philippines", flag: "🇵🇭", phoneCode: "63", currency: "PHP" },
    { code: "US", name: "United States", flag: "🇺🇸", phoneCode: "1", currency: "USD" },
  ],
}));

function renderSettings() {
  return render(
    createElement(
      QueryClientProvider,
      { client: new QueryClient() },
      createElement(ProfileSettingsClient),
    ),
  );
}

const phoneInput = () => screen.getByLabelText(/phone number/i);
const save = () =>
  fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

describe("ProfileSettingsClient phone field", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profile.current = { name: "Ana", username: "ana", phone: "+639171234567" };
  });

  it("shows a saved number as its country and grouped digits", async () => {
    renderSettings();
    expect(
      await screen.findByText("🇵🇭 Philippines (+63)"),
    ).toBeInTheDocument();
    expect(phoneInput()).toHaveValue("917 123 4567");
  });

  it("saves a number for the picked country as E.164", async () => {
    renderSettings();
    fireEvent.click(await screen.findByText("🇵🇭 Philippines (+63)"));
    expect(screen.queryByText(/Antarctica/)).not.toBeInTheDocument();
    fireEvent.click(await screen.findByText("🇺🇸 United States (+1)"));
    fireEvent.change(phoneInput(), { target: { value: "415 555 0132" } });
    save();
    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ phone: "+14155550132" }),
      ),
    );
  });

  it("sends an empty phone to clear the saved number", async () => {
    renderSettings();
    await screen.findByText("🇵🇭 Philippines (+63)");
    fireEvent.change(phoneInput(), { target: { value: "" } });
    save();
    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ phone: "" }),
      ),
    );
  });

  it("shows an error and does not save an invalid number", async () => {
    renderSettings();
    await screen.findByText("🇵🇭 Philippines (+63)");
    fireEvent.change(phoneInput(), { target: { value: "12345678" } });
    save();
    expect(
      await screen.findAllByText(/valid phone number for the selected country/i),
    ).not.toHaveLength(0);
    expect(updateProfile).not.toHaveBeenCalled();
  });
});
