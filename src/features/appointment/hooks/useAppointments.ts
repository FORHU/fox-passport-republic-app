"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  acceptAppointment,
  appoint,
  approveRequest,
  declineRequest,
  fetchOpenToOrganizers,
  fetchJoinStatus,
  fetchTeamSettings,
  requestToJoin,
  searchOrganizers,
  updateTeamSettings,
  withdrawRequest,
  declineAppointment,
  fetchMyAccess,
  fetchMyAppointments,
  fetchTeam,
  leaveAppointment,
  removeFromTeam,
  type AppointmentKind,
  type AppointmentTarget,
} from "../api/appointments";

export const appointmentKeys = {
  all: ["appointments"] as const,
  team: (target: AppointmentTarget) =>
    ["appointments", "team", target.type, target.id] as const,
  mine: ["appointments", "mine"] as const,
  access: (target: AppointmentTarget) =>
    ["appointments", "access", target.type, target.id] as const,
  settings: (target: AppointmentTarget) =>
    ["appointments", "settings", target.type, target.id] as const,
  join: (target: AppointmentTarget) =>
    ["appointments", "join", target.type, target.id] as const,
  search: (q: string) => ["appointments", "organizer-search", q] as const,
  open: ["appointments", "open"] as const,
};

function errorMessage(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

/** A Mayor's or Event Owner's team for one Venue or Event. */
export function useTeam(target: AppointmentTarget | null) {
  const queryClient = useQueryClient();
  const key = target ? appointmentKeys.team(target) : appointmentKeys.all;

  const team = useQuery({
    queryKey: key,
    queryFn: () => fetchTeam(target!),
    enabled: !!target,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: (input: {
      kind: AppointmentKind;
      email?: string;
      userId?: string;
      /** Shown in the success message. */
      label?: string;
    }) =>
      appoint(target!, {
        kind: input.kind,
        email: input.email,
        userId: input.userId,
      }),
    onSuccess: (_, input) => {
      toast.success(
        input.kind === "organizer"
          ? `Invitation sent to ${input.label ?? input.email}`
          : `${input.label ?? input.email} can now check guests in`,
      );
      invalidate();
    },
    onError: (err) =>
      toast.error(errorMessage(err, "Could not add them to the team")),
  });

  const remove = useMutation({
    mutationFn: (appointmentId: string) =>
      removeFromTeam(target!, appointmentId),
    onSuccess: () => {
      toast.success("Removed from the team");
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, "Could not remove them")),
  });

  const settingsKey = target ? appointmentKeys.settings(target) : appointmentKeys.all;
  const settings = useQuery({
    queryKey: settingsKey,
    queryFn: () => fetchTeamSettings(target!),
    enabled: !!target,
  });

  const toggleRequests = useMutation({
    mutationFn: (accepts: boolean) =>
      updateTeamSettings(target!, { acceptsOrganizerRequests: accepts }),
    onSuccess: (next) => {
      queryClient.setQueryData(settingsKey, next);
      toast.success(
        next.acceptsOrganizerRequests
          ? "Organizers can now ask to join"
          : "No longer taking requests from Organizers",
      );
    },
    onError: (err) => toast.error(errorMessage(err, "Could not change that")),
  });

  const answerRequest = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      accept ? approveRequest(target!, id) : declineRequest(target!, id),
    onSuccess: (_, { accept }) => {
      toast.success(accept ? "Added to the team" : "Request declined");
      invalidate();
    },
    onError: (err) =>
      toast.error(errorMessage(err, "Could not answer the request")),
  });

  return { team, add, remove, settings, toggleRequests, answerRequest };
}

/** One of the appointed person's own answers: accept, decline or leave. */
function useRespond(
  action: (id: string) => Promise<void>,
  success: string,
  failure: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      toast.success(success);
      queryClient.invalidateQueries({ queryKey: appointmentKeys.mine });
    },
    onError: (err) => toast.error(errorMessage(err, failure)),
  });
}

/** The signed-in person's own invitations and teams. */
export function useMyAppointments(enabled = true) {
  const mine = useQuery({
    queryKey: appointmentKeys.mine,
    queryFn: fetchMyAppointments,
    enabled,
  });

  const accept = useRespond(
    acceptAppointment,
    "You're on the team",
    "Could not accept the invitation",
  );
  const decline = useRespond(
    declineAppointment,
    "Invitation declined",
    "Could not decline the invitation",
  );
  const leave = useRespond(
    leaveAppointment,
    "You've left the team",
    "Could not leave the team",
  );

  const withdraw = useRespond(
    withdrawRequest,
    "Request withdrawn",
    "Could not withdraw the request",
  );

  return { mine, accept, decline, leave, withdraw };
}

/**
 * Whether the signed-in person is the Owner of this Venue or Event, one of
 * its Organizers or Check-in Helpers, or none — so a page can show the right
 * controls. The API still decides every action on its own.
 */
export function useMyAccess(target: AppointmentTarget) {
  return useQuery({
    queryKey: appointmentKeys.access(target),
    queryFn: () => fetchMyAccess(target),
  });
}

/**
 * An approved Organizer on a Venue's or Event's own page: whether they can
 * ask to join its team, and the request itself.
 */
export function useJoinRequest(target: AppointmentTarget, enabled = true) {
  const queryClient = useQueryClient();
  const key = appointmentKeys.join(target);
  const status = useQuery({
    queryKey: key,
    queryFn: () => fetchJoinStatus(target),
    enabled,
  });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: key });
    queryClient.invalidateQueries({ queryKey: appointmentKeys.mine });
  };
  const request = useMutation({
    mutationFn: () => requestToJoin(target),
    onSuccess: () => {
      toast.success("Request sent — the owner will answer it");
      refresh();
    },
    onError: (err) => toast.error(errorMessage(err, "Could not send the request")),
  });
  const withdraw = useMutation({
    mutationFn: (appointmentId: string) => withdrawRequest(appointmentId),
    onSuccess: () => {
      toast.success("Request withdrawn");
      refresh();
    },
    onError: (err) =>
      toast.error(errorMessage(err, "Could not withdraw the request")),
  });
  return { status, request, withdraw };
}

/** Approved Organizers matching a name or city, for an Owner to invite. */
export function useOrganizerSearch(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: appointmentKeys.search(term),
    queryFn: () => searchOrganizers(term),
    // Nothing until they type, and not for an email, which invites directly.
    enabled: term.length >= 2 && !term.includes("@"),
    staleTime: 30_000,
  });
}

/**
 * For an Organizer: what they can offer to help run, and the offer itself.
 * Sending one takes it off the list and puts it in their requests.
 */
export function useOpenToOrganizers(enabled: boolean) {
  const queryClient = useQueryClient();
  const open = useQuery({
    queryKey: appointmentKeys.open,
    queryFn: fetchOpenToOrganizers,
    enabled,
  });
  const offer = useMutation({
    mutationFn: (target: AppointmentTarget) => requestToJoin(target),
    onSuccess: () => {
      toast.success("Request sent — the owner will answer it");
      queryClient.invalidateQueries({ queryKey: appointmentKeys.open });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.mine });
    },
    onError: (err) =>
      toast.error(errorMessage(err, "Could not send the request")),
  });
  return { open, offer };
}
