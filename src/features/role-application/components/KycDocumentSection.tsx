"use client";

import React, { useState } from "react";
import FileUploader from "@/shared/components/layout/FileUploader";
import { ShieldCheck } from "lucide-react";

export interface KycDocument {
  /** The application column the uploaded file id is stored under. */
  field: string;
  label: string;
  accept?: string;
}

// The business-verification set every Foxer role has always asked for.
export const FOXER_KYC_DOCUMENTS: KycDocument[] = [
  { field: "validId1FileId", label: "Primary Valid ID *" },
  { field: "nbiFileId", label: "NBI Clearance (PDF) *", accept: "application/pdf" },
  { field: "tinIdFileId", label: "TIN ID / Certificate *" },
  { field: "birPermitFileId", label: "BIR 2303 / Permit *" },
  { field: "selfieFileId", label: "Verification Selfie *" },
];

// An Organizer is vetted as a person, not a business: identity only, and
// named generically rather than after one country's paperwork.
export const ORGANIZER_KYC_DOCUMENTS: KycDocument[] = [
  { field: "validId1FileId", label: "Government-issued ID *" },
  {
    field: "backgroundClearanceFileId",
    label: "Police / Background Clearance *",
  },
  { field: "selfieFileId", label: "Verification Selfie *" },
];

interface KycDocumentSectionProps {
  onUpload: (field: string, fileId: string) => void;
  title?: string;
  description?: string;
  documents?: KycDocument[];
}

interface FileSignature {
  name: string;
  size: number;
}

export function KycDocumentSection({
  onUpload,
  title = "Identity Verification",
  description = "Please provide the following documents to verify your identity and business status.",
  documents = FOXER_KYC_DOCUMENTS,
}: KycDocumentSectionProps) {
  // Tracks the file picked for each slot so the same document can't be reused
  // across two different required uploads (e.g. ID photo also submitted as the selfie).
  const [usedFiles, setUsedFiles] = useState<Record<string, FileSignature>>({});

  const validateAgainstOtherSlots = (key: string) => (file: File) => {
    const duplicate = Object.entries(usedFiles).find(
      ([slotKey, signature]) =>
        slotKey !== key &&
        signature.name === file.name &&
        signature.size === file.size,
    );
    return duplicate
      ? "This file has already been uploaded for another document. Please select a different file."
      : null;
  };

  const registerFile = (key: string) => (file: File) => {
    setUsedFiles((prev) => ({
      ...prev,
      [key]: { name: file.name, size: file.size },
    }));
  };

  const clearFile = (key: string) => () => {
    setUsedFiles((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <div className="space-y-6 pt-6 border-t border-white/5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-white">{title}</h3>
          <p className="text-sm text-white/50">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map(({ field, label, accept }, i) => (
          <div
            key={field}
            // An odd one out (the selfie, in both sets) takes the full row.
            className={
              documents.length % 2 === 1 && i === documents.length - 1
                ? "md:col-span-2"
                : undefined
            }
          >
            <FileUploader
              label={label}
              accept={accept}
              onUploadComplete={(id) => onUpload(field, id)}
              validateFile={validateAgainstOtherSlots(field)}
              onFileSelected={registerFile(field)}
              onFileCleared={clearFile(field)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
