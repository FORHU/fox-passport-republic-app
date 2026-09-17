"use client";

import React from "react";
import { X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { CreatePartnershipProposalDto } from "../types/partnership.types";
import { useCreatePartnershipProposal } from "../hooks/usePartnerships";
import { StyledSelect } from "@/shared/components/ui/StyledSelect";

interface ProposePartnershipModalProps {
  targetEventId?: string;
  targetVenueId?: string;
  targetName: string;
  onClose: () => void;
}

export default function ProposePartnershipModal({
  targetEventId,
  targetVenueId,
  targetName,
  onClose,
}: ProposePartnershipModalProps) {
  const { mutateAsync: createProposal, isPending } =
    useCreatePartnershipProposal();

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
    selectedType === "business";
  const requireAmountField = selectedType === "investment";

  const onSubmit = async (data: CreatePartnershipProposalDto) => {
    try {
      if (data.proposedAmount) {
        data.proposedAmount = Number(data.proposedAmount);
      } else {
        delete data.proposedAmount;
      }

      // Convert text areas to objects for benefits/contributions if needed,
      // but for V1 we can just store them as raw text in the DB, or wrap in an object
      data.proposedBenefits = { text: data.proposedBenefits || "" };

      await createProposal(data);
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
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
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Partnership Type
            </label>
            <StyledSelect
              value={selectedType}
              onChange={(v) =>
                setValue(
                  "partnershipType",
                  v as CreatePartnershipProposalDto["partnershipType"],
                )
              }
              options={[
                { value: "investment", label: "Investment" },
                { value: "sponsorship", label: "Sponsorship" },
                { value: "resource", label: "Resource Contribution" },
                { value: "business", label: "Business Partnership" },
              ]}
              className="bg-[#1a1d24]"
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
              className="w-full bg-[#1a1d24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]"
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
                })}
                type="number"
                placeholder="0.00"
                className="w-full bg-[#1a1d24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]"
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
              className="w-full bg-[#1a1d24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] resize-none"
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
              {...register("proposedBenefits" as any)}
              placeholder="What benefits do you expect or offer?"
              rows={3}
              className="w-full bg-[#1a1d24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] resize-none"
            />
          </div>

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
              className="flex-1 py-3 rounded-xl bg-[#ccff00] text-black font-bold hover:bg-[#b8e600] transition disabled:opacity-50"
            >
              {isPending ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
