import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WelcomeGuide from "@/features/onboarding/components/WelcomeGuide";

const authState = vi.hoisted(() => ({
  isAuthenticated: false,
  isLoading: false,
  isOpen: false,
  openSignup: vi.fn(),
  openLogin: vi.fn(),
}));

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (selector: (s: typeof authState) => any) => selector(authState),
}));

vi.mock("@/shared/lib/assets", () => ({
  assetUrl: (path: string) => `/assets/${path}`,
}));

// Simplify motion/react for jsdom: render children directly without animation
vi.mock("motion/react", () => ({
  motion: {
    div: (props: any) => {
      const { children, className, style, ...rest } = props;
      return (
        <div className={className} style={style} {...rest}>
          {children}
        </div>
      );
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  authState.isAuthenticated = false;
  authState.isLoading = false;
  authState.isOpen = false;
  localStorage.removeItem("fp-welcome-seen");
});

afterEach(() => {
  localStorage.removeItem("fp-welcome-seen");
});

describe("WelcomeGuide visibility", () => {
  it("shows the guide for an unauthenticated first-time visitor", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    expect(screen.getByText("1 / 6")).toBeInTheDocument();
  });

  it("hides the guide when already seen (localStorage set)", () => {
    localStorage.setItem("fp-welcome-seen", "1");
    render(<WelcomeGuide />);
    expect(screen.queryByText("Welcome to FoxPassport")).not.toBeInTheDocument();
  });

  it("hides the guide when the user is authenticated", () => {
    authState.isAuthenticated = true;
    render(<WelcomeGuide />);
    expect(screen.queryByText("Welcome to FoxPassport")).not.toBeInTheDocument();
  });

  it("hides the guide while auth is loading", () => {
    authState.isLoading = true;
    render(<WelcomeGuide />);
    expect(screen.queryByText("Welcome to FoxPassport")).not.toBeInTheDocument();
  });

  it("hides the guide when the auth modal is open", () => {
    authState.isOpen = true;
    render(<WelcomeGuide />);
    expect(screen.queryByText("Welcome to FoxPassport")).not.toBeInTheDocument();
  });
});

describe("Slide navigation", () => {
  it("starts on slide 1 and advances with Next", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    expect(screen.getByText("1 / 6")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Show me around/i }));
    expect(screen.getByText("Discover experiences")).toBeInTheDocument();
    expect(screen.getByText("2 / 6")).toBeInTheDocument();
  });

  it("navigates back with the Back button", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Show me around/i }));
    expect(screen.getByText("Discover experiences")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument();
    expect(screen.getByText("1 / 6")).toBeInTheDocument();
  });

  it("jumps to a slide via progress dots", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    const dot4 = screen.getByRole("button", {
      name: /Go to slide 4: Stamp your passport/i,
    });
    fireEvent.click(dot4);
    expect(screen.getByText("Stamp your passport")).toBeInTheDocument();
    expect(screen.getByText("4 / 6")).toBeInTheDocument();
  });

  it("does not go past the last slide", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    // Click Next 5 times to reach slide 6
    for (let i = 0; i < 5; i++) {
      const next = screen.getByRole("button", {
        name: /(Show me around|Next)/i,
      });
      fireEvent.click(next);
    }
    expect(screen.getByText("Ready when you are")).toBeInTheDocument();
    expect(screen.getByText("6 / 6")).toBeInTheDocument();

    // Next button should not exist on the last slide
    expect(screen.queryByRole("button", { name: /Next/i })).not.toBeInTheDocument();
  });
});

describe("Dismiss actions", () => {
  it("Skip button dismisses the guide and marks it seen", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Skip/i }));
    expect(screen.queryByText("Welcome to FoxPassport")).not.toBeInTheDocument();
    expect(localStorage.getItem("fp-welcome-seen")).toBe("1");
  });

  it("Just look around dismisses the guide and marks it seen", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    // Navigate to last slide
    for (let i = 0; i < 5; i++) {
      const next = screen.getByRole("button", {
        name: /(Show me around|Next)/i,
      });
      fireEvent.click(next);
    }
    fireEvent.click(screen.getByRole("button", { name: /Just look around/i }));
    expect(screen.queryByText("Ready when you are")).not.toBeInTheDocument();
    expect(localStorage.getItem("fp-welcome-seen")).toBe("1");
  });
});

describe("Last slide auth buttons", () => {
  it("Create free account calls openSignup and dismisses", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    // Navigate to last slide
    for (let i = 0; i < 5; i++) {
      const next = screen.getByRole("button", {
        name: /(Show me around|Next)/i,
      });
      fireEvent.click(next);
    }
    fireEvent.click(screen.getByRole("button", { name: /Create free account/i }));
    expect(authState.openSignup).toHaveBeenCalled();
    expect(localStorage.getItem("fp-welcome-seen")).toBe("1");
  });

  it("I already have an account calls openLogin and dismisses", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    // Navigate to last slide
    for (let i = 0; i < 5; i++) {
      const next = screen.getByRole("button", {
        name: /(Show me around|Next)/i,
      });
      fireEvent.click(next);
    }
    fireEvent.click(screen.getByRole("button", { name: /I already have an account/i }));
    expect(authState.openLogin).toHaveBeenCalled();
    expect(localStorage.getItem("fp-welcome-seen")).toBe("1");
  });
});

describe("Keyboard navigation", () => {
  it("Escape dismisses the guide", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("Welcome to FoxPassport")).not.toBeInTheDocument();
    expect(localStorage.getItem("fp-welcome-seen")).toBe("1");
  });

  it("ArrowRight advances to the next slide", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("Discover experiences")).toBeInTheDocument();
    expect(screen.getByText("2 / 6")).toBeInTheDocument();
  });

  it("ArrowLeft goes back to the previous slide", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("Discover experiences")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument();
    expect(screen.getByText("1 / 6")).toBeInTheDocument();
  });
});

describe("Slide content", () => {
  it("renders all 6 slides with correct titles when navigated to each", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());

    const titles = [
      "Welcome to FoxPassport",
      "Discover experiences",
      "Book Foxers in one place",
      "Stamp your passport",
      "Join the Republic",
      "Ready when you are",
    ];
    for (let i = 0; i < titles.length; i++) {
      if (i > 0) {
        fireEvent.click(screen.getByRole("button", { name: /(Show me around|Next)/i }));
      }
      expect(screen.getByText(titles[i])).toBeInTheDocument();
      expect(screen.getByText(`${i + 1} / 6`)).toBeInTheDocument();
    }
  });

  it("shows role chips on the Book Foxers slide", async () => {
    render(<WelcomeGuide />);
    await waitFor(() => expect(screen.getByText("Welcome to FoxPassport")).toBeInTheDocument());
    // Navigate to slide 3 (Book Foxers)
    fireEvent.click(screen.getByRole("button", { name: /Show me around/i }));
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    expect(screen.getByText("Event")).toBeInTheDocument();
    expect(screen.getByText("Venue")).toBeInTheDocument();
    expect(screen.getByText("Gear")).toBeInTheDocument();
    expect(screen.getByText("Talent")).toBeInTheDocument();
    expect(screen.getByText("Performer")).toBeInTheDocument();
  });
});
