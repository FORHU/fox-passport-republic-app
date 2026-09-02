"use client";

import React, { useState } from "react";
import FileUploader from "@/shared/components/layout/FileUploader";
import { ShieldCheck } from "lucide-react";

interface KycDocumentSectionProps {
  onUpload: (field: string, fileId: string) => void;
  title?: string;
  description?: string;
}

interface FileSignature {
  name: string;
  size: number;
}

export function KycDocumentSection({
  onUpload,
  title = "Identity Verification",
  description = "Please provide the following documents to verify your identity and business status.",
}: KycDocumentSectionProps) {
  // Tracks the file picked for each slot so the same document can't be reused
  // across two different required uploads (e.g. ID photo also submitted as the selfie).
  const [usedFiles, setUsedFiles] = useState<Record<string, FileSignature>>(
    {},
  );

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
        <FileUploader
          label="Primary Valid ID *"
          onUploadComplete={(id) => onUpload("validId1FileId", id)}
          validateFile={validateAgainstOtherSlots("validId1FileId")}
          onFileSelected={registerFile("validId1FileId")}
          onFileCleared={clearFile("validId1FileId")}
        />
        <FileUploader
          label="NBI Clearance (PDF) *"
          accept="application/pdf"
          onUploadComplete={(id) => onUpload("nbiFileId", id)}
          validateFile={validateAgainstOtherSlots("nbiFileId")}
          onFileSelected={registerFile("nbiFileId")}
          onFileCleared={clearFile("nbiFileId")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploader
          label="TIN ID / Certificate *"
          onUploadComplete={(id) => onUpload("tinIdFileId", id)}
          validateFile={validateAgainstOtherSlots("tinIdFileId")}
          onFileSelected={registerFile("tinIdFileId")}
          onFileCleared={clearFile("tinIdFileId")}
        />
        <FileUploader
          label="BIR 2303 / Permit *"
          onUploadComplete={(id) => onUpload("birPermitFileId", id)}
          validateFile={validateAgainstOtherSlots("birPermitFileId")}
          onFileSelected={registerFile("birPermitFileId")}
          onFileCleared={clearFile("birPermitFileId")}
        />
      </div>

      <FileUploader
        label="Verification Selfie *"
        onUploadComplete={(id) => onUpload("selfieFileId", id)}
        validateFile={validateAgainstOtherSlots("selfieFileId")}
        onFileSelected={registerFile("selfieFileId")}
        onFileCleared={clearFile("selfieFileId")}
      />
    </div>
  );
}
