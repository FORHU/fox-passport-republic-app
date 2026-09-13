import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createSponsorshipCheckout } from "@/features/partnership/api/checkout";
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
