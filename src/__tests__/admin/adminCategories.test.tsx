import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

const auth = vi.hoisted(() => ({
  user: { permissions: ["categories:manage"] as string[] },
}));
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (select: (s: typeof auth) => unknown) => select(auth),
}));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

const revalidate = vi.hoisted(() => vi.fn(async () => true));
vi.mock("@/features/admin/api/revalidate-categories", () => ({
  revalidateCategories: revalidate,
}));

import { AdminCategoriesTable } from "@/features/admin/components/AdminCategoriesTable";
import { slugify } from "@/features/admin/components/CategoryModal";
import type { CategorySummary } from "@/features/admin/types/category";

/**
 * BUG-19 (app#135): an admin who may manage categories creates and edits them
 * from Admin → Categories. Without the permission the page stays read-only.
 * Invalid input is caught in the form, the API's per-field errors show under
 * their inputs, and a save refreshes the lists.
 */

const EVENT = "00000000-0000-4000-8000-000000000001";
const LISTING = "00000000-0000-4000-8000-000000000002";

const sources = { assets: 0, venues: 0, services: 0, events: 0 };
const CATEGORIES: CategorySummary[] = [
  {
    name: "birthday",
    count: 2,
    isEventCategory: true,
    sources: { ...sources, events: 2 },
    id: "cat-birthday",
    slug: "birthday",
    label: "Birthday",
    description: null,
    icon: "cake",
    parentCategoryId: EVENT,
    group: "event",
  },
  {
    name: "legacy_value",
    count: 1,
    isEventCategory: false,
    sources: { ...sources, assets: 1 },
    id: null,
    slug: "legacy_value",
    label: null,
    group: "listing",
  },
];

function renderTable(permissions: string[] = ["categories:manage"]) {
  auth.user = { permissions };
  api.get.mockResolvedValue({
    data: {
      data: [
        { id: EVENT, slug: "event", name: "Event" },
        { id: LISTING, slug: "listing", name: "Listing" },
      ],
    },
  });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  render(
    <QueryClientProvider client={client}>
      <AdminCategoriesTable categories={CATEGORIES} isLoading={false} />
    </QueryClientProvider>,
  );
  return { invalidate };
}

async function chooseParent(label: "Event" | "Listing") {
  const trigger = screen.getByLabelText("Parent");
  await waitFor(() => expect(trigger).not.toBeDisabled());
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("option", { name: label }));
}

/** Reads the approval notice and types the word that finishes the save. */
async function approve(word: "CREATE" | "UPDATE") {
  const input = await screen.findByLabelText(`Type ${word} to confirm`);
  fireEvent.change(input, { target: { value: word } });
  fireEvent.click(screen.getByRole("button", { name: /^confirm and/i }));
}

async function fillValidCreate() {
  fireEvent.click(screen.getByRole("button", { name: /new category/i }));
  await chooseParent("Event");
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Pool Party" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create Category" }));
}

describe("AdminCategoriesTable: managing categories", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("stays read-only without categories:manage", () => {
    renderTable(["queue:read"]);

    expect(screen.getByText("Birthday")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /new category/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^edit/i }),
    ).not.toBeInTheDocument();
  });

  it("offers edit only on catalog rows, not on bare listing values", () => {
    renderTable();

    expect(
      screen.getByRole("button", { name: "Edit Birthday" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^edit/i })).toHaveLength(1);
  });

  it("creates a category under its parent and refreshes the lists", async () => {
    api.post.mockResolvedValue({ data: { data: { id: "new" } } });
    const { invalidate } = renderTable();

    fireEvent.click(screen.getByRole("button", { name: /new category/i }));
    await chooseParent("Event");
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Pool Party" },
    });
    expect(screen.getByLabelText("Slug")).toHaveValue("pool_party");
    fireEvent.change(screen.getByLabelText(/^Icon/), {
      target: { value: "pool" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Category" }));

    // Nothing is sent until the notice is read and CREATE is typed.
    expect(
      await screen.findByRole("heading", { name: "Category Creation Notice" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/formally approved/)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
    await approve("CREATE");

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/categories/create", {
        parentCategoryId: EVENT,
        name: "Pool Party",
        slug: "pool_party",
        icon: "pool",
      }),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Category created"),
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["admin-data", "categories"],
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["categories"] });
    expect(revalidate).toHaveBeenCalled();
    // The modal closes once saved.
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("blocks an incomplete form before any request", async () => {
    renderTable();

    fireEvent.click(screen.getByRole("button", { name: /new category/i }));
    fireEvent.click(screen.getByRole("button", { name: "Create Category" }));

    expect(
      await screen.findByText("Choose Event or Listing."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter a name of at least 2 characters."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    // An invalid form never reaches the approval notice.
    expect(screen.queryByLabelText(/to confirm$/)).not.toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("keeps the confirm button disabled until CREATE is typed exactly", async () => {
    renderTable();
    await fillValidCreate();

    const input = await screen.findByLabelText("Type CREATE to confirm");
    const confirm = screen.getByRole("button", { name: "Confirm and create" });
    expect(confirm).toBeDisabled();

    for (const wrong of ["create", "Create", "UPDATE", "CREATED"]) {
      fireEvent.change(input, { target: { value: wrong } });
      expect(confirm).toBeDisabled();
    }
    fireEvent.keyDown(input, { key: "Enter" });
    expect(api.post).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "CREATE" } });
    expect(confirm).toBeEnabled();
  });

  it("cancelling the notice returns to the form with nothing sent", async () => {
    renderTable();
    await fillValidCreate();

    await screen.findByLabelText("Type CREATE to confirm");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(
        screen.queryByLabelText("Type CREATE to confirm"),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByLabelText("Name")).toHaveValue("Pool Party");
    expect(api.post).not.toHaveBeenCalled();

    // Reopening asks again from an empty box.
    fireEvent.click(screen.getByRole("button", { name: "Create Category" }));
    expect(await screen.findByLabelText("Type CREATE to confirm")).toHaveValue(
      "",
    );
  });

  it("edits only the changed fields and never sends the slug", async () => {
    api.put.mockResolvedValue({ data: { data: {} } });
    renderTable();

    fireEvent.click(screen.getByRole("button", { name: "Edit Birthday" }));
    expect(screen.getByLabelText("Slug")).toHaveAttribute("readonly");
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Birthdays" },
    });
    fireEvent.change(screen.getByLabelText(/^Description/), {
      target: { value: "Cakes and candles" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(
      await screen.findByRole("heading", { name: "Category Change Notice" }),
    ).toBeInTheDocument();
    // Editing asks for UPDATE, not CREATE.
    expect(
      screen.queryByLabelText("Type CREATE to confirm"),
    ).not.toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
    await approve("UPDATE");

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/categories/cat-birthday", {
        name: "Birthdays",
        description: "Cakes and candles",
      }),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Category updated"),
    );
  });

  it("shows the API's refusal and its field errors under the inputs", async () => {
    api.post.mockRejectedValue({
      response: {
        status: 409,
        data: {
          message: "A category with this slug already exists",
          fields: [],
        },
      },
    });
    renderTable();

    fireEvent.click(screen.getByRole("button", { name: /new category/i }));
    await chooseParent("Listing");
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Birthday" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Category" }));
    await approve("CREATE");

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "A category with this slug already exists",
      ),
    );
    // The notice closes; the form stays open for a correction.
    await waitFor(() =>
      expect(
        screen.queryByLabelText("Type CREATE to confirm"),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    api.post.mockRejectedValue({
      response: {
        status: 400,
        data: {
          message: "Name is too long",
          code: "VALIDATION",
          fields: [{ field: "name", message: "Name is too long" }],
        },
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Category" }));
    await approve("CREATE");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Name is too long",
    );
  });
});

describe("slugify", () => {
  it("turns a name into the underscore style listing values use", () => {
    expect(slugify("Pool Party!")).toBe("pool_party");
    expect(slugify("  Café  Night ")).toBe("cafe_night");
    expect(slugify("DJ & MC")).toBe("dj_mc");
  });
});
