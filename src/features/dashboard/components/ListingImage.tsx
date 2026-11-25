"use client";

import React, { useState, type ReactNode } from "react";

interface ListingImageProps {
  /** The listing's picture. Empty or missing shows the fallback. */
  src?: string | null;
  /** Shown when there is no picture, or when it fails to load. */
  fallback: ReactNode;
  /**
   * Renders the picture. Pass `onError` to it; pass `ref` too for a plain
   * `<img>`, which can fail before hydration, when React is not yet listening.
   */
  children: (image: {
    src: string;
    onError: () => void;
    ref: (img: HTMLImageElement | null) => void;
  }) => ReactNode;
}

/**
 * A listing picture that falls back to the listing's placeholder instead of
 * the browser's broken-image icon. A link that no longer loads used to leave
 * the alt text in an empty frame on the dashboard (api#443).
 */
export function ListingImage({ src, fallback, children }: ListingImageProps) {
  // Keyed by address, so a replaced picture gets its own chance to load.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) return <>{fallback}</>;

  const fail = () => setFailedSrc(src);
  return (
    <>
      {children({
        src,
        onError: fail,
        ref: (img) => {
          if (img?.complete && img.naturalWidth === 0) fail();
        },
      })}
    </>
  );
}
