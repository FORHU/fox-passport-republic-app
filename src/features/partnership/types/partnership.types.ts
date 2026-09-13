export type PartnershipType = 'investment' | 'sponsorship' | 'resource' | 'business';
export type PartnershipProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface PartnershipProposal {
  id: string;
  partnerId: string;
  targetEventId?: string | null;
  targetVenueId?: string | null;
  partnershipType: PartnershipType;
  title: string;
  description: string;
  proposedAmount?: number | null;
  proposedBenefits?: Record<string, any> | null;
  proposedContribution?: Record<string, any> | null;
  status: PartnershipProposalStatus;
  createdAt: string;
  updatedAt: string;
  
  // UI Convenience Flags provided by backend
  canAccept?: boolean;
  canReject?: boolean;
  canWithdraw?: boolean;
}

export interface CreatePartnershipProposalDto {
  targetEventId?: string;
  targetVenueId?: string;
  partnershipType: PartnershipType;
  title: string;
  description: string;
  proposedAmount?: number;
  proposedBenefits?: Record<string, any>;
  proposedContribution?: Record<string, any>;
}
