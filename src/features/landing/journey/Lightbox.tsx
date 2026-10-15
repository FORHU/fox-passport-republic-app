"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import type { Photo } from "./data";

/**
 * The photos of one place, full size. It renders into the body because the
 * pin card it opens from is scaled, and a scaled parent would shrink it.
 */
export function Lightbox({
  title,
  photos,
  index,
  onIndex,
  onClose,
}: {
  title: string;
  photos: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const count = photos.length;
  const step = (d: number) => onIndex((index + d + count) % count);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onIndex((index + 1) % count);
      else if (e.key === "ArrowLeft") onIndex((index - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    // The page behind keeps still while a photo is open.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [index, count, onIndex, onClose]);

  const photo = photos[index];
  const arrow =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#fff]/10 text-xl text-[#fff] backdrop-blur transition-colors hover:bg-[#fff]/25";

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#000]/92 p-4 text-[#fff]"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#fff]/10 text-xl backdrop-blur transition-colors hover:bg-[#fff]/25"
      >
        ✕
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className={`${arrow} left-3 sm:left-6`}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className={`${arrow} right-3 sm:right-6`}
          >
            →
          </button>
        </>
      )}
      <img
        key={photo.src}
        src={photo.src}
        alt={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[78svh] max-w-[94vw] rounded-lg object-contain shadow-2xl"
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="font-landing-mono mt-4 text-center text-[11px] uppercase tracking-[0.16em] text-[#fff]/70"
      >
        <p className="font-bold text-[#fff]">
          {title} · {index + 1} / {count}
        </p>
        <a
          href={photo.credit.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-1 inline-block text-[#fff]/60 hover:text-[#fff]"
        >
          Photo: {photo.credit.author} ({photo.credit.license})
        </a>
      </div>
    </motion.div>,
    document.body,
  );
}
