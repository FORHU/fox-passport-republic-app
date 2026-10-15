import type { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

/**
 * Returns the user to the page they actually came from (via browser history)
 * when that page is on this site, otherwise pushes a sensible fallback route.
 * Prevents "Back" buttons from always landing on the fallback regardless of
 * where the user navigated from.
 */
export function smartBack(router: Router, fallback: string) {
  if (
    typeof window !== "undefined" &&
    window.history.length > 1 &&
    document.referrer &&
    new URL(document.referrer).origin === window.location.origin
  ) {
    router.back();
  } else {
    router.push(fallback);
  }
}
