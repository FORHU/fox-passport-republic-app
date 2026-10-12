import api from "@/shared/lib/axios";
import {
  PartnershipProposal,
  CreatePartnershipProposalDto,
} from "@/features/partnership/types/partnership.types";

// The API mounts these under /partnerships/proposals, answers with
// `{ success, data }`, and changes a proposal's state with PATCH. This client
// used to call /partnerships, POST the state changes and return the whole
// envelope — so the lists 404'd and, where a call did land, `data` was an
// object where a list was expected.

export const getPartnershipProposals = async (
  roleType?: string,
  targetId?: string,
): Promise<PartnershipProposal[]> => {
  // The API filters by partnerId / targetEventId / targetVenueId. With no
  // arguments it returns the viewer's own proposals.
  const params: Record<string, string> = {};
  if (targetId) {
    if (roleType === "venue") params.targetVenueId = targetId;
    else if (roleType === "event") params.targetEventId = targetId;
    else if (roleType === "partner") params.partnerId = targetId;
  }
  const response = await api.get("/partnerships/proposals", { params });
  return response.data?.data ?? [];
};

export const getPartnershipProposalById = async (
  id: string,
): Promise<PartnershipProposal> => {
  const response = await api.get(`/partnerships/proposals/${id}`);
  return response.data?.data;
};

export const createPartnershipProposal = async (
  data: CreatePartnershipProposalDto,
): Promise<PartnershipProposal> => {
  const response = await api.post("/partnerships/proposals", data);
  return response.data?.data;
};

export const acceptPartnershipProposal = async (id: string) => {
  const response = await api.patch(`/partnerships/proposals/${id}/accept`);
  return response.data?.data;
};

export const rejectPartnershipProposal = async (id: string) => {
  const response = await api.patch(`/partnerships/proposals/${id}/reject`);
  return response.data?.data;
};

export const withdrawPartnershipProposal = async (id: string) => {
  const response = await api.patch(`/partnerships/proposals/${id}/withdraw`);
  return response.data?.data;
};
