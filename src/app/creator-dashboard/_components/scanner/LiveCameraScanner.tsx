"use client";

import React, { RefObject } from "react";
import { ScanState } from "./types";

interface LiveCameraScannerProps {
  scanState: ScanState;
  isStarting: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  onStartScanner: () => void;
  onCancel: () => void;
}

export function LiveCameraScanner({
  scanState,
  isStarting,
  containerRef,
  onStartScanner,
  onCancel,
}: LiveCameraScannerProps) {
  if (scanState === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-6 text-center">
        <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center bg-white/[0.02]">
          <span className="material-symbols-outlined text-white/30 text-5xl">
            photo_camera
          </span>
        </div>
        <p className="text-white/50 text-xs max-w-xs">
          Use your laptop webcam or attached camera to scan the physical or screen-displayed QR ticket.
        </p>
        <button
          onClick={onStartScanner}
          disabled={isStarting}
          className="px-8 py-3 rounded-full bg-[#ccff00] text-black font-black text-xs hover:bg-[#b8e600] transition-all flex items-center gap-2 shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">
            videocam
          </span>
          {isStarting ? "Starting Camera..." : "Launch Camera Scanner"}
        </button>
      </div>
    );
  }

  if (scanState === "scanning") {
    return (
      <div className="space-y-4">
        <div
          id="qr-reader"
          ref={containerRef as any}
          className="w-full rounded-2xl overflow-hidden [&_video]:rounded-xl [&_select]:bg-white/10 [&_select]:text-white [&_select]:border [&_select]:border-white/20 [&_select]:rounded-lg [&_select]:px-2 [&_select]:py-1"
        />
        <button
          onClick={onCancel}
          className="w-full py-2.5 rounded-full border border-white/10 text-white/60 text-xs font-bold hover:text-white hover:border-white/30 transition-all cursor-pointer"
        >
          Cancel Camera
        </button>
      </div>
    );
  }

  return null;
}
