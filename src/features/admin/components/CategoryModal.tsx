"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { StyledSelect } from "@/shared/components/ui/StyledSelect";
import { FieldControl, FieldError } from "@/shared/components/ui/FieldError";
import { cn } from "@/shared/lib/utils";
import { getCategoryRoots } from "../api/categories";
import {
  useSaveCategory,
  type SaveCategoryArgs,
} from "../hooks/useCategoryMutations";
import { CategoryApprovalNotice } from "./CategoryApprovalNotice";
import type {
  CategoryCreateInput,
  CategorySummary,
  CategoryUpdateInput,
} from "../types/category";

// The same rules the API applies, so most mistakes are caught before a request.
const SLUG_PATTERN = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/;
const LIMITS = { name: 100, slug: 60, description: 500, icon: 50 } as const;

/** "Pool Party!" -> "pool_party": the style listing category values use. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, LIMITS.slug);
}

type Field = "parentCategoryId" | "name" | "slug" | "description" | "icon";
type Errors = Partial<Record<Field, string>>;

function validate(v: Record<Field, string>, isEdit: boolean): Errors {
  const errors: Errors = {};
  if (!v.parentCategoryId) errors.parentCategoryId = "Choose Event or Listing.";
  const name = v.name.trim();
  if (name.length < 2) errors.name = "Enter a name of at least 2 characters.";
  else if (name.length > LIMITS.name)
    errors.name = `Keep the name under ${LIMITS.name} characters.`;
  if (!isEdit) {
    if (!v.slug) errors.slug = "Enter a slug.";
    else if (!SLUG_PATTERN.test(v.slug) || v.slug.length > LIMITS.slug)
      errors.slug =
        "Use lowercase letters and numbers, separated by single underscores or hyphens.";
  }
  if (v.description.trim().length > LIMITS.description)
    errors.description = `Keep the description under ${LIMITS.description} characters.`;
  if (v.icon.trim().length > LIMITS.icon)
    errors.icon = `Keep the icon name under ${LIMITS.icon} characters.`;
  return errors;
}

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all";
const labelClass =
  "text-[10px] uppercase font-bold text-white/40 tracking-widest";

/**
 * Create a category (no `category`) or edit one. A category is a subcategory of
 * Event or Listing; its slug is the value listings store, so it is set once at
 * creation and read-only afterwards.
 */
export function CategoryModal({
  category,
  onClose,
}: {
  category?: CategorySummary | null;
  onClose: () => void;
}) {
  const isEdit = !!category?.id;
  const initial = {
    parentCategoryId: category?.parentCategoryId ?? "",
    name: category?.label ?? "",
    slug: category?.slug ?? category?.name ?? "",
    description: category?.description ?? "",
    icon: category?.icon ?? "",
  };
  const [values, setValues] = useState<Record<Field, string>>(initial);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [errors, setErrors] = useState<Errors>({});
  // A valid save waiting on the approval notice; null when the notice is shut.
  const [pendingSave, setPendingSave] = useState<SaveCategoryArgs | null>(null);

  const { data: roots = [], isLoading: rootsLoading } = useQuery({
    queryKey: ["category-roots"],
    queryFn: getCategoryRoots,
    staleTime: Infinity,
  });

  const save = useSaveCategory({ onSaved: onClose });

  const set = (field: Field, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !slugTouched) next.slug = slugify(value);
      return next;
    });
    // Editing a field clears its error; the name also drives the slug.
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      ...(field === "name" && !slugTouched ? { slug: undefined } : {}),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values, isEdit);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const trimmed = {
      parentCategoryId: values.parentCategoryId,
      name: values.name.trim(),
      description: values.description.trim(),
      icon: values.icon.trim(),
    };

    if (isEdit && category?.id) {
      // Only what changed, so an edit never rewrites fields it did not touch.
      const changes: CategoryUpdateInput = {};
      (Object.keys(trimmed) as (keyof typeof trimmed)[]).forEach((key) => {
        if (trimmed[key] !== initial[key]) changes[key] = trimmed[key];
      });
      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }
      setPendingSave({ id: category.id, input: changes });
      return;
    }

    const input: CategoryCreateInput = {
      parentCategoryId: trimmed.parentCategoryId,
      name: trimmed.name,
      slug: values.slug,
      ...(trimmed.description ? { description: trimmed.description } : {}),
      ...(trimmed.icon ? { icon: trimmed.icon } : {}),
    };
    setPendingSave({ input });
  };

  /** Runs once the admin has read the notice and typed the word. */
  const confirmSave = () => {
    if (!pendingSave) return;
    save.mutate(pendingSave, {
      // Back to the form, where the API's field errors show under the inputs.
      onError: (err) => {
        setErrors(err.fields as Errors);
        setPendingSave(null);
      },
    });
  };

  const parentName = (id?: string) =>
    roots.find((r) => r.id === id)?.name ?? "";

  // What the notice shows the admin they are approving.
  const summary: { label: string; value: string }[] = !pendingSave
    ? []
    : pendingSave.id
      ? [
          { label: "Category", value: initial.name || initial.slug },
          { label: "Slug", value: initial.slug },
          ...(pendingSave.input.parentCategoryId !== undefined
            ? [
                {
                  label: "New parent",
                  value: parentName(pendingSave.input.parentCategoryId),
                },
              ]
            : []),
          ...(pendingSave.input.name !== undefined
            ? [{ label: "New name", value: pendingSave.input.name }]
            : []),
          ...(pendingSave.input.description !== undefined
            ? [
                {
                  label: "New description",
                  value: pendingSave.input.description || "(cleared)",
                },
              ]
            : []),
          ...(pendingSave.input.icon !== undefined
            ? [
                {
                  label: "New icon",
                  value: pendingSave.input.icon || "(cleared)",
                },
              ]
            : []),
        ]
      : [
          {
            label: "Parent",
            value: parentName(pendingSave.input.parentCategoryId),
          },
          { label: "Name", value: pendingSave.input.name ?? "" },
          { label: "Slug", value: values.slug },
        ];

  const fieldProps = (field: Field) => ({
    id: `category-${field}`,
    "aria-invalid": !!errors[field],
    "aria-describedby": errors[field] ? `category-${field}-error` : undefined,
  });

  return (
    <>
      <div
        className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
          className="bg-surface border border-white/10 rounded-2xl p-6 sm:p-8 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
              <span className="material-symbols-outlined text-accent text-[20px]">
                category
              </span>
            </div>
            <div className="flex-1">
              <h2
                id="category-modal-title"
                className="text-white font-bold text-lg leading-tight"
              >
                {isEdit ? "Edit Category" : "New Category"}
              </h2>
              <p className="text-white/40 text-xs leading-tight mt-0.5">
                Categories sit under Event or Listing.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="category-parentCategoryId" className={labelClass}>
                Parent
              </label>
              <StyledSelect
                id="category-parentCategoryId"
                value={values.parentCategoryId}
                onChange={(v) => set("parentCategoryId", v)}
                placeholder={rootsLoading ? "Loading…" : "Event or Listing"}
                disabled={rootsLoading}
                options={roots.map((r) => ({ value: r.id, label: r.name }))}
              />
              <FieldError
                id="category-parentCategoryId-error"
                message={errors.parentCategoryId}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="category-name" className={labelClass}>
                Name
              </label>
              <FieldControl invalid={!!errors.name}>
                <input
                  {...fieldProps("name")}
                  type="text"
                  value={values.name}
                  maxLength={LIMITS.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Pool Party"
                  className={cn(inputClass, errors.name && "field-invalid")}
                />
              </FieldControl>
              <FieldError id="category-name-error" message={errors.name} />
            </div>

            <div className="space-y-1">
              <label htmlFor="category-slug" className={labelClass}>
                Slug
              </label>
              <FieldControl invalid={!!errors.slug}>
                <input
                  {...fieldProps("slug")}
                  type="text"
                  value={values.slug}
                  maxLength={LIMITS.slug}
                  readOnly={isEdit}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase());
                  }}
                  className={cn(
                    inputClass,
                    "font-mono",
                    isEdit && "opacity-50 cursor-not-allowed",
                    errors.slug && "field-invalid",
                  )}
                />
              </FieldControl>
              <FieldError id="category-slug-error" message={errors.slug} />
              <p className="text-[11px] text-white/30">
                {isEdit
                  ? "The slug links this category to its listings, so it can't be changed."
                  : "Set once: listings store this value."}
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="category-description" className={labelClass}>
                Description{" "}
                <span className="normal-case font-normal text-white/25">
                  — optional
                </span>
              </label>
              <textarea
                {...fieldProps("description")}
                value={values.description}
                maxLength={LIMITS.description}
                rows={3}
                onChange={(e) => set("description", e.target.value)}
                className={cn(
                  inputClass,
                  "resize-none",
                  errors.description && "field-invalid",
                )}
              />
              <FieldError
                id="category-description-error"
                message={errors.description}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="category-icon" className={labelClass}>
                Icon{" "}
                <span className="normal-case font-normal text-white/25">
                  — optional, a Material Symbols name
                </span>
              </label>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <span
                    aria-hidden
                    className="material-symbols-outlined text-[20px] text-white/70"
                  >
                    {values.icon.trim() || "label"}
                  </span>
                </div>
                <FieldControl invalid={!!errors.icon} className="flex-1">
                  <input
                    {...fieldProps("icon")}
                    type="text"
                    value={values.icon}
                    maxLength={LIMITS.icon}
                    onChange={(e) => set("icon", e.target.value)}
                    placeholder="e.g. pool"
                    className={cn(
                      inputClass,
                      "font-mono",
                      errors.icon && "field-invalid",
                    )}
                  />
                </FieldControl>
              </div>
              <FieldError id="category-icon-error" message={errors.icon} />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 font-semibold text-sm hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={save.isPending}
                className="flex-1 py-3 rounded-xl bg-accent text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {save.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black/80 animate-spin" />
                    Saving...
                  </span>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Create Category"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* A sibling of the overlay, not a child: portal events bubble through
        the React tree and would otherwise reach the overlay's onClose. */}
      <CategoryApprovalNotice
        open={pendingSave !== null}
        mode={isEdit ? "update" : "create"}
        summary={summary}
        pending={save.isPending}
        onConfirm={confirmSave}
        onCancel={() => setPendingSave(null)}
      />
    </>
  );
}
