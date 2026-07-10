import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/lib/axios';

export interface WaitlistStatus {
  isOnWaitlist: boolean;
  position: number | null;
  entryId: string | null;
  totalWaiting: number;
}

export function useWaitlistStatus(templateId: string) {
  return useQuery<WaitlistStatus>({
    queryKey: ['waitlist', templateId],
    queryFn: () =>
      api
        .get('/waitlist?templateId=' + templateId)
        .then((r) => r.data?.data as WaitlistStatus),
    enabled: !!templateId,
  });
}

export function useJoinWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      api.post('/waitlist', { templateId }).then((r) => r.data?.data),
    onSuccess: (_data, templateId) => {
      qc.invalidateQueries({ queryKey: ['waitlist', templateId] });
    },
  });
}

export function useLeaveWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) =>
      api.delete('/waitlist/' + entryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['waitlist'] });
    },
  });
}

export interface WaitlistEntry {
  id: string;
  templateId: string;
  position: number;
  totalWaiting: number;
  template: {
    name: string;
    category: string;
    image?: string;
    location: string;
    maxAttendees: number;
    currentAttendees: number;
  };
}

export interface WaitlistNotification {
  hasSpotOpened: boolean;
  templateId: string;
  templateName: string;
  entryId: string;
}

export function useUserWaitlist() {
  return useQuery<WaitlistEntry[]>({
    queryKey: ['waitlist', 'user'],
    queryFn: () =>
      api.get('/waitlist/user').then((r) => r.data?.data as WaitlistEntry[]),
    refetchInterval: 30_000,
  });
}

export function useClaimSpot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { templateId: string; entryId: string }) =>
      api.post('/waitlist/claim', payload).then((r) => r.data?.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['waitlist'] });
    },
  });
}

export function useWaitlistNotification() {
  return useQuery<WaitlistNotification>({
    queryKey: ['waitlist', 'notification'],
    queryFn: () =>
      api.get('/waitlist/notification').then((r) => r.data?.data as WaitlistNotification),
    refetchInterval: 15_000,
  });
}