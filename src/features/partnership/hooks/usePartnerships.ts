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

export const usePartnershipProposals = (roleType?: string, targetId?: string) => {
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
      toast.success("Partnership proposal submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to submit proposal.");
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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to accept proposal.");
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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject proposal.");
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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to withdraw proposal.");
    },
  });
};
