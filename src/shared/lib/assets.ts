/**
 * Static brand and marketing images (logos, hero photos, destination photos).
 *
 * They are served from the object store (S3 + CDN in production, MinIO in
 * development) rather than from `public/`, so the web app and the mobile app
 * read the same files and an image change doesn't need a web deploy.
 *
 * `NEXT_PUBLIC_ASSETS_URL` is the base the bucket's keys hang off, with no
 * trailing slash — e.g. `https://cdn.example.com/static` or
 * `http://localhost:9000/foxpassport/static`. Keys mirror the old `public/`
 * paths: `public/destinations/paris.jpg` is `<base>/destinations/paris.jpg`.
 *
 * Unset, this falls back to the same-origin path so a checkout without a
 * bucket still renders (while the files remain in `public/`).
 */
const ASSETS_URL = (process.env.NEXT_PUBLIC_ASSETS_URL || "").replace(
  /\/+$/,
  "",
);

/**
 * @param path   Path under the old `public/` root, with or without a leading slash.
 * @param origin Origin to prefix when no assets base is configured. Only needed
 *               where an absolute URL is required (JSON-LD, Open Graph).
 */
export function assetUrl(path: string, origin = ""): string {
  const clean = path.replace(/^\/+/, "");
  return `${ASSETS_URL || origin.replace(/\/+$/, "")}/${clean}`;
}

/**
 * The fox logo for on-screen use: an SVG in `public/`, so it stays sharp at any
 * size. Open Graph and JSON-LD keep `assetUrl("foxonlylogo.png")`, since social
 * and search previews don't take SVG. The name still contains "foxonlylogo" so
 * the light-theme invert rule in globals.css applies.
 */
export const LOGO_SRC = "/foxonlylogo.svg";
