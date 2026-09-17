import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSponsorshipCheckout,
  cancelSponsorship,
} from "@/features/partnership/api/checkout";
import type { Id } from "@/shared/lib/api-types";

export const usePartnershipCheckoutMutation = () => {
  return useMutation({
    mutationFn: (proposalId: Id) => createSponsorshipCheckout(proposalId),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Invalid checkout URL returned.");
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Could not initialize checkout.",
      );
    },
  });
};

export const useCancelSponsorshipMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proposalId: Id) => cancelSponsorship(proposalId),
    onSuccess: () => {
      toast.success("Sponsorship cancelled — your refund is on its way.");
      queryClient.invalidateQueries({ queryKey: ["partnershipProposals"] });
      queryClient.invalidateQueries({ queryKey: ["partnershipProposal"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Could not cancel sponsorship.",
      );
    },
  });
};
