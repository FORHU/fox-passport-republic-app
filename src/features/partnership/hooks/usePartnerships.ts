import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPartnershipProposals,
  getPartnershipProposalById,
  createPartnershipProposal,
  acceptPartnershipProposal,
  rejectPartnershipProposal,
  withdrawPartnershipProposal,
} from "@/features/partnership/api/partnerships";
import { toast } from "sonner";
import {
  CREATE_PROPOSAL_FALLBACK,
  proposalErrorMessage,
} from "@/features/partnership/utils/proposalErrorMessage";

export const usePartnershipProposals = (
  roleType?: string,
  targetId?: string,
) => {
  return useQuery({
    queryKey: ["partnershipProposals", roleType, targetId],
    queryFn: () => getPartnershipProposals(roleType, targetId),
  });
};

export const usePartnershipProposal = (id: string) => {
  return useQuery({
    queryKey: ["partnershipProposal", id],
    queryFn: () => getPartnershipProposalById(id),
    enabled: !!id,
  });
};

export const useCreatePartnershipProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPartnershipProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnershipProposals"] });
      toast.success("Proposal sent", {
        description: "The owner will see it under Partnerships.",
      });
    },
    onError: (error: unknown) => {
      toast.error(proposalErrorMessage(error, CREATE_PROPOSAL_FALLBACK));
    },
  });
};

export const useAcceptPartnershipProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptPartnershipProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnershipProposals"] });
      toast.success("Partnership proposal accepted!");
    },
    onError: (error: unknown) => {
      toast.error(
        proposalErrorMessage(error, "Couldn't accept the proposal. Try again."),
      );
    },
  });
};

export const useRejectPartnershipProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectPartnershipProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnershipProposals"] });
      toast.success("Partnership proposal rejected.");
    },
    onError: (error: unknown) => {
      toast.error(
        proposalErrorMessage(error, "Couldn't reject the proposal. Try again."),
      );
    },
  });
};

export const useWithdrawPartnershipProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: withdrawPartnershipProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnershipProposals"] });
      toast.success("Partnership proposal withdrawn.");
    },
    onError: (error: unknown) => {
      toast.error(
        proposalErrorMessage(
          error,
          "Couldn't withdraw the proposal. Try again.",
        ),
      );
    },
  });
};
