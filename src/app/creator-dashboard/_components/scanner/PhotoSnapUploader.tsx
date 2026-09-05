"use client";

import React, { RefObject } from "react";

interface PhotoSnapUploaderProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isProcessingFile: boolean;
}

export function PhotoSnapUploader({
  fileInputRef,
  onFileUpload,
  isProcessingFile,
}: PhotoSnapUploaderProps) {
  return (
    <div className="space-y-3 py-2">
      {/* Direct Phone Camera Capture (works in mobile browsers even without HTTPS!) */}
      <div>
        <input
          id="phone-camera-capture"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onFileUpload}
        />
        <label
          htmlFor="phone-camera-capture"
          className="w-full py-3.5 px-4 rounded-2xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] cursor-pointer transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">
            photo_camera
          </span>
          <span>Snap QR with Phone Camera</span>
        </label>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-white/20 hover:border-[#ccff00]/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group text-center"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileUpload}
        />
        <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-[#ccff00]/10 flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-xl text-white/60 group-hover:text-[#ccff00] transition-colors">
            upload_file
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-white group-hover:text-[#ccff00] transition-colors">
            {isProcessingFile
              ? "Scanning QR Image..."
              : "Or upload screenshot from files / photo gallery"}
          </p>
          <p className="text-[10px] text-white/40 mt-0.5">
            PNG, JPG, WebP supported
          </p>
        </div>
      </div>
    </div>
  );
}
