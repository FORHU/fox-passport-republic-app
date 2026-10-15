"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ID_TYPES,
  IDENTITY_QUERY_KEY,
  fetchMyIdentity,
  idTypeLabel,
  submitIdentity,
  type IdType,
} from "@/shared/api/identity";
import { VerifiedBadge } from "@/shared/components/ui/VerifiedBadge";

const ACCEPT = "image/*,application/pdf";
const MAX_BYTES = 15 * 1024 * 1024; // the API's per-file limit

function FilePicker({
  id,
  label,
  hint,
  file,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-white/70">
        {label}
      </label>
      <p className="text-[11px] text-white/40 mt-0.5">{hint}</p>
      <label
        htmlFor={id}
        className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-3 cursor-pointer hover:border-accent/50 transition-colors"
      >
        <span className="material-symbols-outlined text-white/40 text-[20px]">
          {file ? "description" : "upload_file"}
        </span>
        <span className="text-sm text-white/70 truncate">
          {file ? file.name : "Choose a photo or PDF"}
        </span>
      </label>
      <input
        id={id}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null;
          if (next && next.size > MAX_BYTES) {
            toast.error("Files must be 15MB or smaller.");
            e.target.value = "";
            return;
          }
          onChange(next);
        }}
      />
    </div>
  );
}

/**
 * The optional ID check on /kyc. An admin reviews what's sent; approval puts a
 * "Verified" badge on the person's profile and in chat. Booking never needs it.
 */
export function IdentitySection() {
  const queryClient = useQueryClient();
  const identity = useQuery({
    queryKey: [...IDENTITY_QUERY_KEY, "mine"],
    queryFn: fetchMyIdentity,
  });

  const [idType, setIdType] = useState<IdType>("passport");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const submit = useMutation({
    mutationFn: () => submitIdentity({ idType, idFile: idFile!, selfieFile }),
    onSuccess: () => {
      toast.success("ID sent — we'll let you know once it's reviewed.");
      setIdFile(null);
      setSelfieFile(null);
      queryClient.invalidateQueries({ queryKey: IDENTITY_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(message ?? "Couldn't send your ID. Try again.");
    },
  });

  const verifiedAt = identity.data?.verifiedAt ?? null;
  const latest = identity.data?.latest ?? null;
  const pending = latest?.status === "pending";
  const rejected = latest?.status === "rejected";

  const status = verifiedAt
    ? { label: "Verified", color: "#38bdf8", icon: "verified" }
    : pending
      ? { label: "Under review", color: "#f59e0b", icon: "hourglass_top" }
      : { label: "Optional", color: "#94a3b8", icon: "badge" };

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
            Identity
            <VerifiedBadge verifiedAt={verifiedAt} />
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Optional. Send a government ID and, once we&apos;ve checked it, your
            profile and chats show a Verified badge so hosts and guests know
            you&apos;re you. You can book without it.
          </p>
        </div>
        <span
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border"
          style={{
            color: status.color,
            borderColor: `${status.color}55`,
            background: `${status.color}1a`,
          }}
        >
          <span className="material-symbols-outlined text-[14px]">
            {status.icon}
          </span>
          {status.label}
        </span>
      </div>

      {identity.isPending ? (
        <div className="mt-5 h-14 rounded-2xl bg-white/5 animate-pulse" />
      ) : identity.isError ? (
        <p className="mt-5 text-sm text-red-400">
          Couldn&apos;t load your ID status.{" "}
          <button
            type="button"
            onClick={() => identity.refetch()}
            className="underline cursor-pointer"
          >
            Retry
          </button>
        </p>
      ) : verifiedAt ? (
        <p className="mt-5 text-sm text-white/60">
          Verified on {new Date(verifiedAt).toLocaleDateString()}.
        </p>
      ) : pending ? (
        <p className="mt-5 text-sm text-white/60">
          We received your {idTypeLabel(latest.idType).toLowerCase()} on{" "}
          {new Date(latest.createdAt).toLocaleDateString()} and will notify you
          once it&apos;s reviewed.
        </p>
      ) : (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!idFile) {
              toast.error("Add a photo or scan of your ID.");
              return;
            }
            submit.mutate();
          }}
        >
          {rejected && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              Your last ID wasn&apos;t accepted
              {latest.rejectionReason ? `: ${latest.rejectionReason}` : "."} You
              can send a new one below.
            </div>
          )}

          <div>
            <label
              htmlFor="id-type"
              className="block text-xs font-bold text-white/70"
            >
              Type of ID
            </label>
            <select
              id="id-type"
              value={idType}
              onChange={(e) => setIdType(e.target.value as IdType)}
              className="mt-2 w-full sm:w-72 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/60"
            >
              {ID_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-surface">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <FilePicker
            id="id-file"
            label="Photo or scan of your ID"
            hint="The side with your name and photo, every corner visible and readable."
            file={idFile}
            onChange={setIdFile}
          />
          <FilePicker
            id="selfie-file"
            label="Selfie holding your ID (optional)"
            hint="Helps us match the ID to you, and speeds up the review."
            file={selfieFile}
            onChange={setSelfieFile}
          />

          <p className="text-[11px] text-white/40">
            These files are used only to check your ID.
          </p>

          <button
            type="submit"
            disabled={submit.isPending || !idFile}
            className="px-5 py-2.5 rounded-xl bg-accent text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {submit.isPending ? "Sending…" : "Send for review"}
          </button>
        </form>
      )}
    </section>
  );
}
