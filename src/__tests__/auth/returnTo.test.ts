import { describe, it, expect, beforeEach } from "vitest";
import { signInThen, signUpThen, takeReturnTo } from "@/shared/auth/returnTo";
import { useAuthStore } from "@/shared/auth/useAuthStore";

beforeEach(() => {
  sessionStorage.clear();
  useAuthStore.setState({ isOpen: false, view: "login", bookingSummary: null });
});

describe("returnTo", () => {
  it("opens sign-in and resumes the remembered path once", () => {
    signInThen("/booking/config?templateId=t1");
    expect(useAuthStore.getState().isOpen).toBe(true);
    expect(takeReturnTo()).toBe("/booking/config?templateId=t1");
    expect(takeReturnTo()).toBe("/search");
  });

  it("opens sign-up with the package when reserving signed out", () => {
    signUpThen("/booking/config?templateId=t2", { title: "Garden Wedding" });
    const state = useAuthStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.view).toBe("signup");
    expect(state.bookingSummary?.title).toBe("Garden Wedding");
    expect(takeReturnTo()).toBe("/booking/config?templateId=t2");

    state.close();
    expect(useAuthStore.getState().bookingSummary).toBeNull();
  });

  it("falls back to the app home when nothing is remembered", () => {
    expect(takeReturnTo()).toBe("/search");
  });

  it("falls back to the given dashboard when nothing is remembered", () => {
    expect(takeReturnTo("/creator-dashboard")).toBe("/creator-dashboard");
  });

  it("prefers the remembered path over the given dashboard", () => {
    signInThen("/booking/config?templateId=t3");
    expect(takeReturnTo("/creator-dashboard")).toBe(
      "/booking/config?templateId=t3",
    );
  });

  it.each(["https://evil.example", "//evil.example", "javascript:alert(1)"])(
    "never redirects off-site (%s)",
    (path) => {
      sessionStorage.setItem("fox_return_to", path);
      expect(takeReturnTo()).toBe("/search");
    },
  );
});
