"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import {
  CreatePartnershipProposalDto,
  PARTNERSHIP_TYPE_LABEL,
  PartnershipType,
} from "../types/partnership.types";
import { useCreatePartnershipProposal } from "../hooks/usePartnerships";
import {
  CREATE_PROPOSAL_FALLBACK,
  proposalErrorMessage,
} from "../utils/proposalErrorMessage";
import { StyledSelect } from "@/shared/components/ui/StyledSelect";

/** The largest amount the API accepts (its column is Decimal(12,2)). */
const MAX_PROPOSED_AMOUNT = 9_999_999_999.99;

interface ProposePartnershipModalProps {
  targetEventId?: string;
  targetVenueId?: string;
  targetName: string;
  /** A line under the target, e.g. when a package's proposal goes to its venue. */
  targetNote?: string;
  onClose: () => void;
}

export default function ProposePartnershipModal({
  targetEventId,
  targetVenueId,
  targetName,
  targetNote,
  onClose,
}: ProposePartnershipModalProps) {
  const { mutateAsync: createProposal, isPending } =
    useCreatePartnershipProposal();
  // Shown under the buttons when sending fails, so the reason stays next to
  // the form (the toast fades); the answers stay in the fields to fix and resend.
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreatePartnershipProposalDto>({
    defaultValues: {
      targetEventId,
      targetVenueId,
      partnershipType: "investment",
      title: "",
      description: "",
    },
  });

  const selectedType = useWatch({ control, name: "partnershipType" });

  const showAmountField =
    selectedType === "investment" ||
    selectedType === "sponsorship" ||
    selectedType === "business_partnership";
  const requireAmountField = selectedType === "investment";

  const onSubmit = async (data: CreatePartnershipProposalDto) => {
    setSubmitError(null);
    // Benefits are plain text, as the API stores them; an empty box sends nothing.
    const benefits = data.proposedBenefits?.trim();
    const payload: CreatePartnershipProposalDto = {
      ...data,
      proposedAmount: data.proposedAmount
        ? Number(data.proposedAmount)
        : undefined,
      proposedBenefits: benefits || undefined,
    };

    try {
      await createProposal(payload);
      onClose();
    } catch (error) {
      // The hook shows the toast; this keeps the reason beside the form.
      setSubmitError(proposalErrorMessage(error, CREATE_PROPOSAL_FALLBACK));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Propose Partnership</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-sm text-white/50">Targeting</p>
          <p className="text-white font-medium">{targetName}</p>
          {targetNote && (
            <p className="mt-1 text-xs text-white/50">{targetNote}</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Partnership Type
            </label>
            <StyledSelect
              value={selectedType}
              onChange={(v) =>
                setValue("partnershipType", v as PartnershipType)
              }
              options={(
                Object.keys(PARTNERSHIP_TYPE_LABEL) as PartnershipType[]
              ).map((value) => ({
                value,
                label: PARTNERSHIP_TYPE_LABEL[value],
              }))}
              className="bg-surface-raised"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Title
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              type="text"
              placeholder="e.g. Stage Sponsorship"
              className="w-full bg-surface-raised border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {showAmountField && (
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Amount (PHP) {requireAmountField ? "*" : "(Optional)"}
              </label>
              <input
                {...register("proposedAmount", {
                  required: requireAmountField
                    ? "Amount is required for investments"
                    : false,
                  min: { value: 1, message: "Amount must be positive" },
                  // The API stores it as Decimal(12,2).
                  max: {
                    value: MAX_PROPOSED_AMOUNT,
                    message: "The amount can't be more than 9,999,999,999.99.",
                  },
                })}
                type="number"
                placeholder="0.00"
                className="w-full bg-surface-raised border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
              />
              {errors.proposedAmount && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.proposedAmount.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Description
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              placeholder="Describe your proposal..."
              rows={4}
              className="w-full bg-surface-raised border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Proposed Benefits (Optional)
            </label>
            <textarea
              {...register("proposedBenefits")}
              placeholder="What benefits do you expect or offer?"
              rows={3}
              className="w-full bg-surface-raised border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {submitError && (
            <p
              role="alert"
              className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {submitError}
            </p>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 font-bold hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent-hover transition disabled:opacity-50"
            >
              {isPending ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
