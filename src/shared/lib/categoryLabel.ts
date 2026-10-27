/**
 * A stored category value (a snake_case enum) as the words people read:
 * "sound_system" → "Sound system". Shared because search, Event Studio and
 * the category pages all show categories.
 */

// Category values that don't read right once de-snaked.
const CATEGORY_WORDS: Record<string, string> = {
  furnitures: "Furniture",
  dj: "DJ",
  mc: "MC",
};

export function categoryLabel(value?: string | null): string {
  if (!value) return "";
  const known = CATEGORY_WORDS[value.toLowerCase()];
  if (known) return known;
  const words = value.replace(/_/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
