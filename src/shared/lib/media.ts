/**
 * Post and chat media are stored as plain URLs, so the file extension is the
 * only hint of what each one is. Matches the video formats uploads accept
 * (see uploadRules.ts).
 */
export const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];

export function isVideoUrl(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}
