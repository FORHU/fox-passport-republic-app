import { describe, it, expect, beforeEach, vi } from "vitest";

type Stores = {
  auth: typeof import("@/shared/auth/useAuthStore").useAuthStore;
  builder: typeof import("@/features/event/store/useEventBuilderStore").useEventBuilderStore;
};

/** Fresh copies of both stores, as on a page load, with `userId` signed in. */
async function load(userId: string | null = null): Promise<Stores> {
  vi.resetModules();
  const { useAuthStore } = await import("@/shared/auth/useAuthStore");
  if (userId) signIn(useAuthStore, userId);
  const { useEventBuilderStore } =
    await import("@/features/event/store/useEventBuilderStore");
  return { auth: useAuthStore, builder: useEventBuilderStore };
}

function signIn(auth: Stores["auth"], id: string) {
  auth.setState({ isAuthenticated: true, user: { id } as never });
}

const saved = (id: string) => {
  const raw = localStorage.getItem(`fp-event-builder:${id}`);
  return raw ? JSON.parse(raw).state : null;
};

/**
 * Event Studio keeps an unsaved draft in localStorage. It used to be one key
 * for the whole browser, so the next account to sign in on it opened the
 * previous account's draft.
 */
describe("Event Studio drafts are kept per account", () => {
  beforeEach(() => localStorage.clear());

  it("saves and restores a draft for the signed-in account", async () => {
    const { builder } = await load("host-a");
    builder.getState().setEventTitle("A's garden wedding");
    expect(saved("host-a").eventTitle).toBe("A's garden wedding");
    expect(localStorage.getItem("fp-event-builder")).toBeNull();

    // A reload as the same account picks the draft back up.
    const reloaded = await load("host-a");
    expect(reloaded.builder.getState().eventTitle).toBe("A's garden wedding");
  });

  it("never shows one account's draft to the next after sign-out", async () => {
    const { auth, builder } = await load("host-a");
    builder.getState().setEventTitle("A's draft");
    builder.getState().setDraftId("tmpl-a");

    auth.getState().logout();
    expect(builder.getState().eventTitle).toBe("");
    expect(builder.getState().draftId).toBeNull();

    signIn(auth, "host-b");
    expect(builder.getState().eventTitle).toBe("");
    expect(builder.getState().draftId).toBeNull();

    // B's edits land under B, and A's saved draft is untouched.
    builder.getState().setEventTitle("B's draft");
    expect(saved("host-b").eventTitle).toBe("B's draft");
    expect(saved("host-a").eventTitle).toBe("A's draft");
    expect(saved("host-a").draftId).toBe("tmpl-a");
  });

  it("keeps drafts apart when switching accounts directly", async () => {
    const { auth, builder } = await load("host-a");
    builder.getState().setEventTitle("A's draft");

    signIn(auth, "host-b");
    expect(builder.getState().eventTitle).toBe("");
    builder.getState().setEventTitle("B's draft");

    signIn(auth, "host-a");
    expect(builder.getState().eventTitle).toBe("A's draft");
    expect(saved("host-b").eventTitle).toBe("B's draft");
  });

  it("restores the draft when the same account signs back in", async () => {
    const { auth, builder } = await load("host-a");
    builder.getState().setEventTitle("A's draft");
    auth.getState().logout();
    signIn(auth, "host-a");
    expect(builder.getState().eventTitle).toBe("A's draft");
  });

  it("reads and writes nothing without a usable user id", async () => {
    localStorage.setItem(
      "fp-event-builder:",
      JSON.stringify({ state: { eventTitle: "stray" }, version: 0 }),
    );
    const { auth, builder } = await load(null);
    expect(builder.getState().eventTitle).toBe("");
    builder.getState().setEventTitle("typed while signed out");

    signIn(auth, "   ");
    builder.getState().setEventTitle("blank id");

    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith("fp-event-builder"),
    );
    expect(keys).toEqual(["fp-event-builder:"]);
  });

  it("drops the old shared draft, whose owner can't be known", async () => {
    localStorage.setItem(
      "fp-event-builder",
      JSON.stringify({ state: { eventTitle: "someone's" }, version: 0 }),
    );
    const { builder } = await load("host-b");
    expect(builder.getState().eventTitle).toBe("");
    expect(localStorage.getItem("fp-event-builder")).toBeNull();
  });

  it("starts blank on corrupt storage instead of keeping the last account's draft", async () => {
    localStorage.setItem("fp-event-builder:host-b", "{not json");
    const { auth, builder } = await load("host-a");
    builder.getState().setEventTitle("A's draft");

    signIn(auth, "host-b");
    expect(builder.getState().eventTitle).toBe("");
    expect(saved("host-a").eventTitle).toBe("A's draft");
  });

  it("reset clears only the signed-in account's draft", async () => {
    const { auth, builder } = await load("host-a");
    builder.getState().setEventTitle("A's draft");
    signIn(auth, "host-b");
    builder.getState().setEventTitle("B's published event");

    builder.getState().reset();
    expect(builder.getState().eventTitle).toBe("");
    expect(saved("host-b")?.eventTitle ?? "").toBe("");
    expect(saved("host-a").eventTitle).toBe("A's draft");
  });
});
