"use client";

import { useId } from "react";
import FileUploader from "@/shared/components/layout/FileUploader";
import {
  BASE_MAX_YEARS_OF_EXPERIENCE,
  CLAIM_MAX_YEARS_OF_EXPERIENCE,
  experienceCvError,
  typedBracketLabel,
} from "../utils/yearsOfExperience";

/**
 * "I have more than 30 years of experience" (api#423). Ticking it lets the
 * Years of Experience field go up to 50 and asks for a CV, with references,
 * that an admin checks before the claim stands. The CV is the application's
 * `portfolioFileId`, the same PDF or Word upload as a Portfolio / Resume.
 */
export default function ExperienceClaim({
  claiming,
  years,
  onClaimingChange,
  onCvUploaded,
  onCvCleared,
}: {
  claiming: boolean;
  /** What's typed in the Years of Experience field, to show its bracket. */
  years: string;
  onClaimingChange: (claiming: boolean) => void;
  onCvUploaded: (fileId: string) => void;
  onCvCleared: () => void;
}) {
  const id = useId();
  const title = `I have more than ${BASE_MAX_YEARS_OF_EXPERIENCE} years of experience`;
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <label
          htmlFor={id}
          className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-white"
        >
          <input
            id={id}
            type="checkbox"
            checked={claiming}
            aria-describedby={`${id}-hint`}
            onChange={(e) => {
              // Ticking starts the CV afresh (an earlier Event Foxer portfolio
              // may be a Word file); unticking drops it with the claim.
              onCvCleared();
              onClaimingChange(e.target.checked);
            }}
            className="mt-0.5 accent-accent"
          />
          {title}
        </label>
        <p id={`${id}-hint`} className="mt-1 pl-7 text-xs text-white/50">
          You can then enter up to {CLAIM_MAX_YEARS_OF_EXPERIENCE} years, with a
          CV that proves them.
        </p>
      </div>

      {claiming && (
        <div className="space-y-2">
          {typedBracketLabel(years) && (
            <p className="text-sm text-white">
              {years.trim()} years counts as{" "}
              <strong>{typedBracketLabel(years)}</strong>. Experience over{" "}
              {BASE_MAX_YEARS_OF_EXPERIENCE} is grouped: 30+, 35+, 40+, 45+, 50.
            </p>
          )}
          <p className="text-xs text-white/60">
            Your CV must be a PDF. It must list every role behind the years
            you&apos;re claiming, with dates, and at least 2 references (name,
            relationship, phone or email) who can confirm them. Our team will
            contact them before your application is approved.
          </p>
          <FileUploader
            label="CV with references (PDF) *"
            purpose="portfolio"
            accept="application/pdf"
            validateFile={experienceCvError}
            onUploadComplete={onCvUploaded}
            onFileCleared={onCvCleared}
          />
        </div>
      )}
    </div>
  );
}
