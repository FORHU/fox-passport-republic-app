"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, FileQuestion, X } from "lucide-react";
import { PdfPreview } from "@/shared/components/ui/PdfPreview";

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/bmp",
];
const IMAGE_NAME = /\.(jpe?g|png|gif|webp|avif|bmp)$/i;

export type PreviewKind = "image" | "pdf" | "unsupported";

/**
 * What can be shown inline. HEIC and TIFF get past an `image/*` accept, but
 * most browsers can't draw them, so they count as unsupported. The name is
 * only consulted when the browser reported no type.
 */
export function getPreviewKind(
  type: string | undefined,
  name: string,
): PreviewKind {
  const mime = type?.toLowerCase() ?? "";
  if (mime === "application/pdf" || (!mime && /\.pdf$/i.test(name))) {
    return "pdf";
  }
  if (IMAGE_TYPES.includes(mime) || (!mime && IMAGE_NAME.test(name))) {
    return "image";
  }
  return "unsupported";
}

interface FilePreviewModalProps {
  url: string;
  name: string;
  type?: string;
  /** The slot the file was uploaded to, e.g. "NBI Clearance (PDF)". */
  label?: string;
  onClose: () => void;
}

// Full-screen on phones, a centred panel from `sm` up. Same shell as
// ImageLightbox: portalled to <body>, Escape or a backdrop click closes, and
// the page behind doesn't scroll. Closing only unmounts this overlay, so
// whatever form opened it keeps its state.
export function FilePreviewModal({
  url,
  name,
  type,
  label,
  onClose,
}: FilePreviewModalProps) {
  // An image or PDF the browser turns out not to be able to read falls back
  // to the download view, the same as an unsupported type.
  const [failed, setFailed] = useState(false);
  const kind = failed ? "unsupported" : getPreviewKind(type, name);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${name}`}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm sm:p-8 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full h-full sm:max-w-4xl bg-surface sm:border border-white/10 sm:rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-white/5 shrink-0">
          <div className="min-w-0">
            {label && (
              <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">
                {label}
              </p>
            )}
            <p className="text-sm text-white font-medium truncate">{name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              download={name}
              aria-label="Download"
              className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Download className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto bg-black/40 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-6">
          {kind === "image" && (
            <div className="h-full flex items-center justify-center">
              {/* A plain <img>, as in ImageLightbox: the source is a local
                  blob: URL that next/image can't optimise anyway. */}
              <img
                src={url}
                alt={label ?? name}
                onError={() => setFailed(true)}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}

          {kind === "pdf" && (
            <PdfPreview url={url} onError={() => setFailed(true)} />
          )}

          {kind === "unsupported" && (
            <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
              <FileQuestion className="h-10 w-10 text-white/40" />
              <div>
                <p className="text-white font-bold">
                  We can&apos;t preview this file type here
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Download it to check it on your device.
                </p>
              </div>
              <a
                href={url}
                download={name}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-black font-bold text-sm hover:brightness-110 transition-all"
              >
                <Download className="h-4 w-4" />
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
