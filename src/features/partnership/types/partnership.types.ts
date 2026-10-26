// The API's `PartnershipType` enum, value for value. It once said "resource"
// and "business", which the database rejected.
export type PartnershipType =
  | "investment"
  | "sponsorship"
  | "resource_contribution"
  | "business_partnership";

export const PARTNERSHIP_TYPE_LABEL: Record<PartnershipType, string> = {
  investment: "Investment",
  sponsorship: "Sponsorship",
  resource_contribution: "Resource Contribution",
  business_partnership: "Business Partnership",
};

/** A type's label, or the raw value for one this build doesn't know yet. */
export const partnershipTypeLabel = (type: string) =>
  PARTNERSHIP_TYPE_LABEL[type as PartnershipType] ?? type;
export type PartnershipProposalStatus =
  "pending" | "accepted" | "rejected" | "withdrawn";

export interface PartnershipProposal {
  id: string;
  partnerId: string;
  targetEventId?: string | null;
  targetVenueId?: string | null;
  partnershipType: PartnershipType;
  title: string;
  description: string;
  proposedAmount?: number | null;
  // Free text, like the `String?` columns they're stored in.
  proposedBenefits?: string | null;
  proposedContribution?: string | null;
  status: PartnershipProposalStatus;
  createdAt: string;
  updatedAt: string;

  // Computed server-side per viewer, always present (never client-derived).
  canAccept: boolean;
  canReject: boolean;
  canWithdraw: boolean;
  payment?: {
    required: boolean;
    status:
      | "pending"
      | "processing"
      | "paid"
      | "failed"
      | "cancelled"
      | "refunded"
      | "partially_refunded";
    invoiceId?: string;
  } | null;
}

export interface CreatePartnershipProposalDto {
  targetEventId?: string;
  targetVenueId?: string;
  partnershipType: PartnershipType;
  title: string;
  description: string;
  proposedAmount?: number;
  proposedBenefits?: string;
  proposedContribution?: string;
}
