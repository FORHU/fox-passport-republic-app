import api from "@/shared/lib/axios";
import { PartnershipProposal, CreatePartnershipProposalDto } from "@/features/partnership/types/partnership.types";

export const getPartnershipProposals = async (roleType?: string, targetId?: string): Promise<PartnershipProposal[]> => {
  const params: Record<string, string> = {};
  if (roleType) params.role = roleType;
  if (targetId) params.targetId = targetId;

  const response = await api.get("/partnerships", { params });
  return response.data;
};

export const getPartnershipProposalById = async (id: string): Promise<PartnershipProposal> => {
  const response = await api.get(`/partnerships/${id}`);
  return response.data;
};

export const createPartnershipProposal = async (data: CreatePartnershipProposalDto): Promise<PartnershipProposal> => {
  const response = await api.post("/partnerships", data);
  return response.data;
};

export const acceptPartnershipProposal = async (id: string) => {
  const response = await api.post(`/partnerships/${id}/accept`);
  return response.data;
};

export const rejectPartnershipProposal = async (id: string) => {
  const response = await api.post(`/partnerships/${id}/reject`);
  return response.data;
};

export const withdrawPartnershipProposal = async (id: string) => {
  const response = await api.post(`/partnerships/${id}/withdraw`);
  return response.data;
};
