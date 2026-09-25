import api from "@/shared/lib/axios";

/**
 * Appointments — someone a Mayor or Event Owner has named to help run one of
 * their own Venues or Events. See CONTEXT.md (Organizer, Appointment,
 * Check-in Helper) and the API's docs/adr/0005-organizer-role-and-appointments.md.
 */

export type AppointmentKind = "organizer" | "check_in_helper";

/**
 * What the API shows for an Appointment: its stored status, plus two states
 * it works out on read — an invitation past its expiry, and an Event
 * Appointment whose Event is over.
 */
export type AppointmentState =
  | "invited"
  | "requested"
  | "expired"
  | "active"
  | "finished"
  | "declined"
  | "ended";

/** Which Venue or Event a team belongs to. */
export type AppointmentTarget =
  | { type: "event"; id: string }
  | { type: "venue"; id: string };

interface Person {
  id: string;
  name: string | null;
  email: string;
}

interface AppointmentBase {
  id: string;
  kind: AppointmentKind;
  state: AppointmentState;
  eventId: string | null;
  venueId: string | null;
  userId: string;
  permissions: string[];
  expiresAt: string | null;
  respondedAt: string | null;
  endedAt: string | null;
  endReason: "removed" | "left" | "role_revoked" | "owner_role_revoked" | null;
  createdAt: string;
  appointedBy: Person;
}

/** A row on the Mayor's or Event Owner's team list. */
export interface TeamMember extends AppointmentBase {
  user: Person;
}

/** A row in the appointed person's own list. */
export interface MyAppointment extends AppointmentBase {
  event: {
    id: string;
    name: string;
    startAt: string;
    endAt: string;
    eventStatus: string;
  } | null;
  venue: { id: string; name: string; city: string | null } | null;
}

function teamPath(target: AppointmentTarget) {
  return target.type === "event"
    ? `/events/${target.id}/appointments`
    : `/venues/${target.id}/appointments`;
}

export async function fetchTeam(target: AppointmentTarget): Promise<TeamMember[]> {
  const resp = await api.get(teamPath(target));
  return resp.data?.data ?? [];
}

/** Invite an Organizer (by email, or someone picked from the search), or add a
 * Check-in Helper by email. */
export async function appoint(
  target: AppointmentTarget,
  input: { kind: AppointmentKind; email?: string; userId?: string },
): Promise<TeamMember> {
  const resp = await api.post(teamPath(target), input);
  return resp.data.data;
}

/** Remove someone, or withdraw an invitation. */
export async function removeFromTeam(
  target: AppointmentTarget,
  appointmentId: string,
): Promise<void> {
  await api.delete(`${teamPath(target)}/${appointmentId}`);
}

export async function fetchMyAppointments(): Promise<MyAppointment[]> {
  const resp = await api.get("/appointments/mine");
  return resp.data?.data ?? [];
}

export async function acceptAppointment(id: string): Promise<void> {
  await api.post(`/appointments/${id}/accept`);
}

export async function declineAppointment(id: string): Promise<void> {
  await api.post(`/appointments/${id}/decline`);
}

export async function leaveAppointment(id: string): Promise<void> {
  await api.post(`/appointments/${id}/leave`);
}

/** What the signed-in person is on one Venue or Event, and what they may do. */
export interface MyAccess {
  role: "owner" | "organizer" | "check_in_helper" | null;
  permissions: string[];
}

export async function fetchMyAccess(target: AppointmentTarget): Promise<MyAccess> {
  const resp = await api.get("/appointments/access", {
    params: target.type === "event" ? { eventId: target.id } : { venueId: target.id },
  });
  return resp.data?.data ?? { role: null, permissions: [] };
}

// ── Organizer requests ────────────────────────────────────────────────────

function targetParams(target: AppointmentTarget) {
  return target.type === "event"
    ? { eventId: target.id }
    : { venueId: target.id };
}

export interface JoinStatus {
  acceptsRequests: boolean;
  canRequest: boolean;
  /** Why not, when `canRequest` is false. */
  reason:
    | "owner"
    | "not_organizer"
    | "on_team"
    | "invited"
    | "requested"
    | "closed"
    | null;
  appointmentId: string | null;
}

export async function fetchJoinStatus(
  target: AppointmentTarget,
): Promise<JoinStatus> {
  const resp = await api.get("/appointments/join-status", {
    params: targetParams(target),
  });
  return resp.data.data;
}

/** An approved Organizer asks to join a Venue or Event that accepts requests. */
export async function requestToJoin(target: AppointmentTarget): Promise<void> {
  await api.post("/appointments/request", targetParams(target));
}

export async function withdrawRequest(appointmentId: string): Promise<void> {
  await api.post(`/appointments/${appointmentId}/withdraw`);
}

export async function approveRequest(
  target: AppointmentTarget,
  appointmentId: string,
): Promise<void> {
  await api.post(`${teamPath(target)}/${appointmentId}/approve-request`);
}

export async function declineRequest(
  target: AppointmentTarget,
  appointmentId: string,
): Promise<void> {
  await api.post(`${teamPath(target)}/${appointmentId}/decline-request`);
}

export interface TeamSettings {
  acceptsOrganizerRequests: boolean;
}

export async function fetchTeamSettings(
  target: AppointmentTarget,
): Promise<TeamSettings> {
  const resp = await api.get(`${teamPath(target)}/settings`);
  return resp.data.data;
}

export async function updateTeamSettings(
  target: AppointmentTarget,
  settings: TeamSettings,
): Promise<TeamSettings> {
  const resp = await api.patch(`${teamPath(target)}/settings`, settings);
  return resp.data.data;
}

/** An approved Organizer, as the search shows them — never with an email. */
export interface OrganizerCard {
  id: string;
  name: string;
  imgId: string | null;
  city: string | null;
  specializations: string[];
  level: number;
  totalXP: number;
}

export async function searchOrganizers(
  q: string,
): Promise<OrganizerCard[]> {
  const resp = await api.get("/appointments/organizers", { params: { q } });
  return resp.data?.data ?? [];
}

/** Venues and upcoming Events whose owners accept requests from Organizers. */
export interface OpenToOrganizers {
  venues: { id: string; name: string; city: string | null }[];
  events: {
    id: string;
    name: string;
    startAt: string;
    endAt: string;
    targetCity: string | null;
  }[];
}

export async function fetchOpenToOrganizers(): Promise<OpenToOrganizers> {
  const resp = await api.get("/appointments/open");
  return resp.data?.data ?? { venues: [], events: [] };
}
