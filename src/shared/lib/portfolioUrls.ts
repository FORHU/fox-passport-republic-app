/**
 * Links to an applicant's work hosted elsewhere, typed as one comma-separated
 * field (app#371). A copy of the API's src/utils/portfolio-urls.ts, which has
 * the final word — change both together.
 */

export const MAX_PORTFOLIO_URLS = 5;
const MAX_PORTFOLIO_URL_LENGTH = 2048;

/** The links in the field: trimmed, blanks and repeats dropped. */
export function splitPortfolioUrls(value: string): string[] {
  const links = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(links)];
}

function linkError(link: string): string | null {
  if (link.length > MAX_PORTFOLIO_URL_LENGTH) {
    return `This link is too long: ${link.slice(0, 40)}…`;
  }
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return `Enter a full web address starting with https://, not "${link}"`;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return `Use a web address starting with https://, not "${link}"`;
  }
  if (!url.hostname.includes(".") || url.hostname.endsWith(".")) {
    return `"${link}" isn't a complete web address`;
  }
  if (url.username || url.password) {
    return `Remove the sign-in details from "${link}"`;
  }
  return null;
}

/** Why the links field can't be sent, as a message to show, or null. */
export function portfolioUrlsError(value: string): string | null {
  const links = splitPortfolioUrls(value);
  for (const link of links) {
    const error = linkError(link);
    if (error) return error;
  }
  if (links.length > MAX_PORTFOLIO_URLS) {
    return `Add at most ${MAX_PORTFOLIO_URLS} portfolio links`;
  }
  return null;
}
