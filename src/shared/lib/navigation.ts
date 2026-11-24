import type { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

/**
 * Returns the user to the page they actually came from (via browser history)
 * when that page is on this site, otherwise pushes a sensible fallback route.
 * Prevents "Back" buttons from always landing on the fallback regardless of
 * where the user navigated from, or hanging if opened in a standalone tab/popup.
 */
export function smartBack(router: Router, fallback: string) {
  if (typeof window !== "undefined") {
    // If opened as a popup or new tab from another window on this site:
    if (window.opener && window.history.length <= 1) {
      window.close();
      // If the browser blocked window.close(), fall back to router navigation:
      setTimeout(() => {
        if (!window.closed) {
          router.push(fallback);
        }
      }, 100);
      return;
    }

    const hasExternalReferrer = (() => {
      if (!document.referrer) return false;
      try {
        return new URL(document.referrer).origin !== window.location.origin;
      } catch {
        return false;
      }
    })();

    if (window.history.length > 1 && !hasExternalReferrer) {
      router.back();
      return;
    }
  }

  router.push(fallback);
}
