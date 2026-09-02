"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { useFileUpload } from "@/shared/hooks/useFileUpload";
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

interface FileUploaderProps {
  label: string;
  onUploadComplete: (fileId: string) => void;
  accept?: string;
  maxSizeMB?: number;
  /** Returns an error message to reject the file (e.g. duplicate check), or null to allow it. */
  validateFile?: (file: File) => string | null;
  /** Called once a file has been picked and passed validation, before upload starts. */
  onFileSelected?: (file: File) => void;
  /** Called when the slot is cleared, either manually or after a failed/rejected selection. */
  onFileCleared?: () => void;
}

export default function FileUploader({
  label,
  onUploadComplete,
  accept = "image/*,application/pdf",
  maxSizeMB = 10,
  validateFile,
  onFileSelected,
  onFileCleared,
}: FileUploaderProps) {
  const { uploadFile } = useFileUpload();
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File type validation
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    const matchesType = acceptedTypes.some((type) => {
      if (type.endsWith("/*"))
        return file.type.startsWith(type.replace("/*", "/"));
      return file.type === type;
    });
    if (!matchesType) {
      toast.error(`Invalid file type. Accepted: ${accept}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Basic size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${maxSizeMB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validationError = validateFile?.(file);
    if (validationError) {
      toast.error(validationError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFileName(file.name);
    setStatus("uploading");
    onFileSelected?.(file);

    const result = await uploadFile(file);

    if (result) {
      setStatus("success");
      onUploadComplete(result.fileId);
    } else {
      setStatus("error");
      onFileCleared?.();
    }
  };

  const reset = () => {
    setFileName(null);
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFileCleared?.();
  };

  const isImage = fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-white/50 uppercase tracking-widest block">
        {label}
      </label>

      <div
        className={`relative group h-32 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-4 overflow-hidden
          ${status === "idle" ? "border-white/10 hover:border-accent/40 bg-white/5" : ""}
          ${status === "uploading" ? "border-accent/50 bg-accent/5" : ""}
          ${status === "success" ? "border-green-500/50 bg-green-500/5" : ""}
          ${status === "error" ? "border-red-500/50 bg-red-500/5" : ""}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
          disabled={status === "uploading" || status === "success"}
        />

        {status === "idle" && (
          <>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Upload
                className="text-white/40 group-hover:text-accent"
                size={20}
              />
            </div>
            <p className="text-xs text-white/40 group-hover:text-white/60 text-center font-medium">
              Click or drag to upload <br />
              <span className="text-[10px] opacity-60">
                {accept === "application/pdf" ? "PDF only" : "PDF, JPG, or PNG"}{" "}
                (Max {maxSizeMB}MB)
              </span>
            </p>
          </>
        )}

        {status === "uploading" && (
          <>
            <Loader2 className="text-accent animate-spin mb-2" size={24} />
            <p className="text-xs text-accent font-bold animate-pulse">
              Uploading {fileName}...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                {isImage ? (
                  <ImageIcon className="text-green-500" size={20} />
                ) : (
                  <FileText className="text-green-500" size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-bold truncate">
                  {fileName}
                </p>
                <p className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Uploaded Successfully
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  reset();
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all relative z-20 shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-xs text-red-500 font-bold mb-2">Upload Failed</p>
            <button
              onClick={(e) => {
                e.preventDefault();
                reset();
              }}
              className="text-[10px] text-white/40 hover:text-white underline"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
