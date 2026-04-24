"use client";

import React from "react";
import FileUploader from "./FileUploader";
import { ShieldCheck } from "lucide-react";

interface KycDocumentSectionProps {
  onUpload: (field: string, fileId: string) => void;
  title?: string;
  description?: string;
}

export default function KycDocumentSection({
  onUpload,
  title = "Identity Verification",
  description = "Please provide the following documents to verify your identity and business status.",
}: KycDocumentSectionProps) {
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
        />
        <FileUploader 
          label="NBI Clearance (PDF) *" 
          onUploadComplete={(id) => onUpload("nbiFileId", id)} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploader 
          label="TIN ID / Certificate *" 
          onUploadComplete={(id) => onUpload("tinIdFileId", id)} 
        />
        <FileUploader 
          label="BIR 2303 / Permit *" 
          onUploadComplete={(id) => onUpload("birPermitFileId", id)} 
        />
      </div>

      <FileUploader 
        label="Verification Selfie *" 
        onUploadComplete={(id) => onUpload("selfieFileId", id)} 
      />
    </div>
  );
}
