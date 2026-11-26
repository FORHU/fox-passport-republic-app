import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AccountSetupForm, {
  USERNAME_CHECK_DELAY_MS,
} from "@/features/auth/components/AccountSetupForm";
import CredentialSetupGate from "@/features/auth/components/CredentialSetupGate";
import type { User } from "@/shared/auth/types";

/**
 * api#419: a Google account without a username or a password picks them on
 * /account-setup before using the app. Only the missing fields are asked, the
 * username is checked as it is typed, and every other page sends the person
 * back there until it's done.
 */

const mocks = vi.hoisted(() => ({
  params: {} as Record<string, string>,
  pathname: "/search",
  replace: vi.fn(),
  setUser: vi.fn(),
  state: { user: null as unknown, isAuthenticated: true },
  isUsernameAvailable: vi.fn(),
  submitAccountSetup: vi.fn(),
  endSession: vi.fn(async () => {}),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => ({ get: (k: string) => mocks.params[k] ?? null }),
  usePathname: () => mocks.pathname,
}));

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (select: (s: unknown) => unknown) =>
    select({ ...mocks.state, setUser: mocks.setUser }),
}));

vi.mock("@/features/auth/api/accountSetup", () => ({
  ACCOUNT_SETUP_PATH: "/account-setup",
  isUsernameAvailable: mocks.isUsernameAvailable,
  submitAccountSetup: mocks.submitAccountSetup,
}));

vi.mock("@/shared/auth/endSession", () => ({ endSession: mocks.endSession }));

vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

const GOOD_PASSWORD = "Str0ng!Passw0rd";

const googleUser = (over: Partial<User> = {}): User =>
  ({
    id: "u1",
    email: "g@example.com",
    name: "Google Person",
    systemRole: "user",
    username: null,
    hasPassword: false,
    needsCredentialSetup: true,
    ...over,
  }) as unknown as User;

function type(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  mocks.params = {};
  mocks.pathname = "/search";
  mocks.state = { user: googleUser(), isAuthenticated: true };
  mocks.isUsernameAvailable.mockResolvedValue(true);
  sessionStorage.clear();
});

describe("AccountSetupForm", () => {
  it("asks for a username and a password when both are missing", () => {
    render(<AccountSetupForm />);
    expect(screen.getByLabelText(/^username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password/i)).toBeInTheDocument();
  });

  it("asks only for the password when the username is already set", () => {
    mocks.state.user = googleUser({ username: "kept.name" });
    render(<AccountSetupForm />);
    expect(screen.queryByLabelText(/^username/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
  });

  it("asks only for the username when the password is already set", () => {
    mocks.state.user = googleUser({ hasPassword: true });
    render(<AccountSetupForm />);
    expect(screen.getByLabelText(/^username/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^password/i)).not.toBeInTheDocument();
  });

  it("sends someone with nothing left to set on to their landing page", async () => {
    mocks.state.user = googleUser({
      username: "a.b",
      hasPassword: true,
      needsCredentialSetup: false,
    });
    render(<AccountSetupForm />);
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/search"));
  });

  it("shows a taken username once typing pauses", async () => {
    vi.useFakeTimers();
    mocks.isUsernameAvailable.mockResolvedValue(false);
    render(<AccountSetupForm />);

    type(/^username/i, "Taken.Name");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(USERNAME_CHECK_DELAY_MS);
    });

    expect(mocks.isUsernameAvailable).toHaveBeenCalledTimes(1);
    expect(mocks.isUsernameAvailable).toHaveBeenCalledWith("taken.name");
    expect(screen.getByText("Already taken")).toBeInTheDocument();
  });

  it("doesn't check a username that breaks the rule", async () => {
    vi.useFakeTimers();
    render(<AccountSetupForm />);
    type(/^username/i, "no spaces");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(USERNAME_CHECK_DELAY_MS * 2);
    });
    expect(mocks.isUsernameAvailable).not.toHaveBeenCalled();
  });

  it("refuses passwords that don't match without calling the API", async () => {
    render(<AccountSetupForm />);
    type(/^username/i, "new.name");
    type(/^password/i, GOOD_PASSWORD);
    type(/^confirm password/i, `${GOOD_PASSWORD}x`);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
    expect(mocks.submitAccountSetup).not.toHaveBeenCalled();
  });

  it("saves both, stores the fresh user and goes on to onboarding", async () => {
    mocks.params = { then: "onboarding" };
    const fresh = googleUser({
      username: "new.name",
      hasPassword: true,
      needsCredentialSetup: false,
    });
    mocks.submitAccountSetup.mockResolvedValue(fresh);
    render(<AccountSetupForm />);

    type(/^username/i, "New.Name");
    type(/^password/i, GOOD_PASSWORD);
    type(/^confirm password/i, GOOD_PASSWORD);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/onboarding"),
    );
    expect(mocks.submitAccountSetup).toHaveBeenCalledWith({
      username: "new.name",
      password: GOOD_PASSWORD,
      confirmPassword: GOOD_PASSWORD,
    });
    expect(mocks.setUser).toHaveBeenCalledWith(fresh);
  });

  it("sends only the password when that is all that's missing", async () => {
    mocks.state.user = googleUser({ username: "kept.name" });
    mocks.submitAccountSetup.mockResolvedValue(
      googleUser({ username: "kept.name", hasPassword: true, needsCredentialSetup: false }),
    );
    render(<AccountSetupForm />);

    type(/^password/i, GOOD_PASSWORD);
    type(/^confirm password/i, GOOD_PASSWORD);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(mocks.submitAccountSetup).toHaveBeenCalled());
    expect(mocks.submitAccountSetup).toHaveBeenCalledWith({
      password: GOOD_PASSWORD,
      confirmPassword: GOOD_PASSWORD,
    });
  });

  it("hides both passwords by default and shows or hides each with its own eye button", () => {
    mocks.state.user = googleUser({ username: "kept.name" });
    render(<AccountSetupForm />);

    const password = screen.getByLabelText(/^password/i);
    const confirm = screen.getByLabelText(/^confirm password/i);
    const [passwordEye, confirmEye] = screen.getAllByRole("button", {
      name: "Show password",
    });
    expect(password).toHaveAttribute("type", "password");
    expect(confirm).toHaveAttribute("type", "password");
    expect(passwordEye).toHaveAttribute("aria-pressed", "false");

    type(/^password/i, GOOD_PASSWORD);
    fireEvent.click(passwordEye);
    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue(GOOD_PASSWORD);
    expect(passwordEye).toHaveAttribute("aria-pressed", "true");
    expect(confirm).toHaveAttribute("type", "password");

    fireEvent.click(passwordEye);
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveValue(GOOD_PASSWORD);

    fireEvent.click(confirmEye);
    expect(confirm).toHaveAttribute("type", "text");
    expect(password).toHaveAttribute("type", "password");
  });

  it("submits the same values after the passwords were shown", async () => {
    mocks.state.user = googleUser({ username: "kept.name" });
    mocks.submitAccountSetup.mockResolvedValue(
      googleUser({ username: "kept.name", hasPassword: true, needsCredentialSetup: false }),
    );
    render(<AccountSetupForm />);

    type(/^password/i, GOOD_PASSWORD);
    type(/^confirm password/i, GOOD_PASSWORD);
    for (const eye of screen.getAllByRole("button", { name: "Show password" })) {
      fireEvent.click(eye);
    }
    expect(mocks.submitAccountSetup).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(mocks.submitAccountSetup).toHaveBeenCalledWith({
        password: GOOD_PASSWORD,
        confirmPassword: GOOD_PASSWORD,
      }),
    );
  });

  it("shows the API's refusal under the field it names", async () => {
    mocks.submitAccountSetup.mockRejectedValue({
      response: {
        status: 400,
        data: { message: "Username already taken", field: "username" },
      },
    });
    render(<AccountSetupForm />);

    type(/^username/i, "raced.name");
    type(/^password/i, GOOD_PASSWORD);
    type(/^confirm password/i, GOOD_PASSWORD);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText("Username already taken"),
    ).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("lets the person sign out instead", async () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, set href(v: string) { assign(v); } },
      configurable: true,
    });
    render(<AccountSetupForm />);
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(mocks.endSession).toHaveBeenCalled());
    await waitFor(() => expect(assign).toHaveBeenCalledWith("/"));
  });
});

describe("CredentialSetupGate", () => {
  it("sends a Google account that must set up to /account-setup", () => {
    render(<CredentialSetupGate />);
    expect(mocks.replace).toHaveBeenCalledWith("/account-setup");
  });

  it.each(["/account-setup", "/auth/google/callback"])(
    "leaves %s alone",
    (path) => {
      mocks.pathname = path;
      render(<CredentialSetupGate />);
      expect(mocks.replace).not.toHaveBeenCalled();
    },
  );

  it("lets an account with both set through", () => {
    mocks.state.user = googleUser({
      username: "a.b",
      hasPassword: true,
      needsCredentialSetup: false,
    });
    render(<CredentialSetupGate />);
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("does nothing when signed out", () => {
    mocks.state = { user: null, isAuthenticated: false };
    render(<CredentialSetupGate />);
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
