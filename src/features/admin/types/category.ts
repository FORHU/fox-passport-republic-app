/** The two roots of the category catalog; every other category sits under one. */
export type CategoryGroup = "event" | "listing";

/** One row of `GET /categories`: a catalog entry with its listing counts. */
export interface CategorySummary {
  /** The slug; the API keeps it as `name` for older readers. */
  name: string;
  count: number;
  isEventCategory: boolean;
  sources: {
    assets: number;
    venues: number;
    services: number;
    events: number;
  };
  /** Null for a value listings carry that has no catalog row (not editable). */
  id?: string | null;
  slug?: string;
  /** The display name an admin edits. */
  label?: string | null;
  description?: string | null;
  icon?: string | null;
  parentCategoryId?: string | null;
  group?: CategoryGroup | null;
}

/** A root category (`event` or `listing`), as `GET /categories/top-level` returns it. */
export interface CategoryRoot {
  id: string;
  slug: string;
  name: string;
}

export interface CategoryCreateInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentCategoryId: string;
}

/** Slugs are fixed at creation, so an update never carries one. */
export type CategoryUpdateInput = Partial<Omit<CategoryCreateInput, "slug">>;
