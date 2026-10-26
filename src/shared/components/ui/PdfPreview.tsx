"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist/legacy/build/pdf.mjs";

// Retina is sharp enough; 3x phones would triple canvas memory for no visible gain.
const MAX_PIXEL_RATIO = 2;

interface PdfPreviewProps {
  url: string;
  /** The file couldn't be read or drawn as a PDF; the caller shows a fallback. */
  onError: () => void;
}

// Draws every page of a PDF to a canvas with PDF.js, fitted to the container's
// width. Not an <iframe>: that leans on the browser's own PDF viewer, which
// Android Chrome doesn't have and iOS Safari only half has. The legacy build
// keeps older iOS Safari working, and the dynamic import keeps PDF.js out of
// the page bundle (and out of SSR, which it can't run in) until a PDF opens.
export function PdfPreview({ url, onError }: PdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const onErrorRef = useRef(onError);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        // Read the bytes here rather than handing PDF.js the URL, so a blob:
        // URL never depends on range requests.
        const data = await (await fetch(url)).arrayBuffer();
        if (cancelled) return;
        task = pdfjs.getDocument({ data });
        const loaded = await task.promise;
        if (!cancelled) setDoc(loaded);
      } catch {
        if (!cancelled) onErrorRef.current();
      }
    })();
    // Destroying the loading task also tears down the document and its worker.
    return () => {
      cancelled = true;
      task?.destroy();
    };
  }, [url]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width)),
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const pages = pagesRef.current;
    if (!doc || !pages || width === 0) return;
    let cancelled = false;
    let task: RenderTask | null = null;
    (async () => {
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      try {
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;
          const scale = width / page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale: scale * ratio });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.className = "block w-full h-auto rounded-md bg-white shadow-lg";
          canvas.setAttribute("aria-label", `Page ${n} of ${doc.numPages}`);
          task = page.render({ canvas, viewport });
          await task.promise;
          if (cancelled) return;
          // Swap the old pages out only once the first new one is drawn, so a
          // resize never flashes an empty panel.
          if (n === 1) pages.replaceChildren(canvas);
          else pages.append(canvas);
          setReady(true);
        }
      } catch {
        if (!cancelled) onErrorRef.current();
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, width]);

  return (
    <div ref={containerRef} className="relative w-full min-h-full">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="text-accent animate-spin" size={28} />
        </div>
      )}
      <div ref={pagesRef} className="flex flex-col gap-4" />
    </div>
  );
}
