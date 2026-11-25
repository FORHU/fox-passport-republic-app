import type {
  ConflictReason,
  EventEditProposal,
} from "@/shared/types/eventEdit";

/** Why a Supplier needs replacing, in a few words (mobile's wording). */
export function reasonLabel(
  reason: ConflictReason,
  cause: "busy" | null = null,
): string {
  if (reason === "declined") {
    return cause === "busy" ? "Busy with another booking" : "Declined this event";
  }
  if (reason === "date_blocked") return "Blocked a day of this event";
  return "No longer available";
}

/** A date, with the time, the way the dashboard shows event times. */
export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const num = (v: unknown): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/** A proposal from the API, with its decimal strings as numbers. */
export function toProposal(raw: Record<string, unknown>): EventEditProposal {
  return {
    id: String(raw.id),
    eventId: String(raw.eventId ?? ""),
    bookingId: String(raw.bookingId ?? ""),
    type: raw.type === "reschedule" ? "reschedule" : "swap",
    status: (raw.status as EventEditProposal["status"]) ?? "pending",
    kind: (raw.kind as EventEditProposal["kind"]) ?? null,
    itemName: String(raw.itemName ?? ""),
    replacesName: String(raw.replacesName ?? ""),
    currentPrice: num(raw.currentPrice),
    proposedPrice: num(raw.proposedPrice),
    priceDelta: num(raw.priceDelta),
    note: (raw.note as string | null) ?? null,
    expiresAt: String(raw.expiresAt ?? ""),
    awaitingPayment: Boolean(raw.awaitingPayment),
    proposedStartAt: (raw.proposedStartAt as string | null) ?? null,
    proposedEndAt: (raw.proposedEndAt as string | null) ?? null,
    previousStartAt: (raw.previousStartAt as string | null) ?? null,
    previousEndAt: (raw.previousEndAt as string | null) ?? null,
  };
}

/** Whether a proposal still waits for the citizen. */
export const isOpenProposal = (p: EventEditProposal, now = Date.now()) =>
  p.status === "pending" && new Date(p.expiresAt).getTime() > now;
