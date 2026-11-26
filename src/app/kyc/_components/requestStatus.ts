/** Where one of the person's role applications stands. */
export type RoleRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested"
  // The applicant took it back before a decision (api#367).
  | "withdrawn";

const REQUEST_STATUS: Record<
  RoleRequestStatus,
  { label: string; color: string }
> = {
  pending: { label: "Under review", color: "var(--warning)" },
  approved: { label: "Approved", color: "var(--accent-text)" },
  rejected: { label: "Not approved", color: "var(--error)" },
  revision_requested: { label: "Needs a fix", color: "var(--warning)" },
  withdrawn: { label: "Withdrawn", color: "var(--muted-foreground)" },
};

/** Its label and colour. A status not known here yet shows as is, never crashes the page. */
export const requestStatus = (status: string) =>
  REQUEST_STATUS[status as RoleRequestStatus] ?? {
    label: status,
    color: "var(--muted-foreground)",
  };
