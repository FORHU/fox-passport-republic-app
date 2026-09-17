"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight } from "lucide-react";
import api from "@/shared/lib/axios";
import RequireAuth from "@/shared/auth/RequireAuth";
import FileUploader from "@/shared/components/layout/FileUploader";
import { ApplicationFlowHeader } from "./ApplicationFlowHeader";

const ROLE_LABELS: Record<string, string> = {
  eventFoxer: "Event Foxer",
  venueFoxer: "Venue Foxer",
  gearFoxer: "Equipment Foxer",
  serviceFoxer: "Talent Foxer",
  performerFoxer: "Performer Foxer",
  investor: "Investor",
};

// Must match DOCUMENT_FIELD_TO_DB_COLUMN in the API's role-request.service.ts
// and DOCUMENT_FIELDS in the admin review panel.
const DOCUMENT_FIELDS: Record<string, { label: string; accept?: string }> = {
  validId1: { label: "Primary Valid ID" },
  nbiFile: { label: "NBI Clearance", accept: "application/pdf" },
  tinIdFile: { label: "TIN ID / Certificate" },
  birPermitFile: { label: "BIR 2303 / Permit" },
  selfieFile: { label: "Verification Selfie" },
  portfolioFile: { label: "Portfolio / Resume" },
};

interface RoleRequestSummary {
  id: string;
  roleType: string;
  status: string;
  flaggedDocuments?: string[];
  revisionNote?: string;
}

export default function ResubmitDocumentsClient({
  requestId,
}: {
  requestId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<RoleRequestSummary | null>(null);
  const [replacements, setReplacements] = useState<Record<string, string>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/role-requests/my")
      .then((res) => {
        const found = (res.data?.data ?? []).find(
          (r: RoleRequestSummary) => r.id === requestId,
        );
        setRequest(found ?? null);
      })
      .catch(() => setRequest(null))
      .finally(() => setLoading(false));
  }, [requestId]);

  const flagged = request?.flaggedDocuments ?? [];
  const allReplaced = flagged.every((key) => replacements[key]);

  const handleSubmit = async () => {
    if (!request || !allReplaced) return;
    setSubmitting(true);
    try {
      const { data } = await api.patch(
        `/role-requests/${request.id}/resubmit-documents`,
        { documents: replacements },
      );
      toast.success(data.message || "Documents resubmitted");
      router.push("/onboarding");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to resubmit documents",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireAuth>
      <ApplicationFlowHeader />
      <div className="min-h-screen bg-[#0f111a] flex flex-col items-center justify-center p-4 pt-24 pb-12 font-body">
        <div className="w-full max-w-2xl bg-[#1a1a24] rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-white/30 gap-3">
              <div className="w-5 h-5 border-2 border-white/20 border-t-[#ccff00] rounded-full animate-spin" />
              Loading application…
            </div>
          ) : !request || request.status !== "revision_requested" ? (
            <div className="text-center py-10 space-y-4">
              <h1 className="text-2xl font-display font-bold text-white">
                Nothing to fix here
              </h1>
              <p className="text-white/50">
                This application either doesn&apos;t need revision anymore or
                couldn&apos;t be found.
              </p>
              <button
                onClick={() => router.push("/onboarding")}
                className="mt-4 px-6 py-3 rounded-xl bg-[#ccff00] text-black font-bold hover:brightness-110 transition-all"
              >
                Back to Onboarding
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-orange-500/20 text-orange-400">
                  <ShieldCheck size={32} />
                </div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">
                  Fix your{" "}
                  <span className="text-orange-400">
                    {ROLE_LABELS[request.roleType] ?? request.roleType}
                  </span>{" "}
                  application
                </h1>
                <p className="text-white/60">
                  Only the documents below were flagged. Everything else you
                  already submitted stays as-is — no need to redo the whole
                  application.
                </p>
              </div>

              {request.revisionNote && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-8">
                  <p className="text-xs text-orange-400/60 uppercase tracking-wider mb-1">
                    Reviewer note
                  </p>
                  <p className="text-orange-300 text-sm">
                    &quot;{request.revisionNote}&quot;
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {flagged.map((key) => {
                  const field = DOCUMENT_FIELDS[key];
                  if (!field) return null;
                  return (
                    <FileUploader
                      key={key}
                      label={`${field.label} *`}
                      accept={field.accept}
                      onUploadComplete={(fileId) =>
                        setReplacements((prev) => ({
                          ...prev,
                          [key]: fileId,
                        }))
                      }
                      onFileCleared={() =>
                        setReplacements((prev) => {
                          const next = { ...prev };
                          delete next[key];
                          return next;
                        })
                      }
                    />
                  );
                })}
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-4 items-center">
                <button
                  onClick={() => router.push("/onboarding")}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-center font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!allReplaced || submitting}
                  className="w-full flex-1 flex items-center justify-center gap-2 text-black font-bold py-3 px-6 rounded-xl bg-[#ccff00] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting…" : "Resubmit Documents"}
                  {!submitting && <ArrowRight size={18} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
