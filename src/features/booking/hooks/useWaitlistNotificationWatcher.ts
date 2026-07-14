'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { toast } from 'sonner';
import api from '@/shared/lib/axios';

export default function useWaitlistNotificationWatcher() {
  const { isAuthenticated } = useAuthStore();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [hasNotified, setHasNotified] = useState(false);

  const { data } = useQuery({
    queryKey: ['waitlist', 'notification-watcher'],
    queryFn: () =>
      api.get('/waitlist/notification').then((r) => r.data?.data as {
        hasSpotOpened: boolean;
        templateId: string | null;
        templateName: string | null;
        entryId: string | null;
      }),
    enabled: isAuthenticated && !hasNotified,
    refetchInterval: 15_000,
  });

  useEffect(() => {
    if (data?.hasSpotOpened && !hasNotified) {
      setHasNotified(true);
      const notification = {
        id: `wl_notif_${Date.now()}`,
        userId: 'user_123',
        type: 'WAITLIST_SPOT_OPENED',
        title: 'Spot Available!',
        message: `A spot has opened up for ${data.templateName}. Complete your booking to secure your spot.`,
        isRead: false,
        metadata: { link: `/booking/config?templateId=${data.templateId}&claimed=1` },
        createdAt: new Date().toISOString(),
      };
      addNotification(notification);
      api.post('/notifications', notification).catch(() => {});
      toast.success('A spot just opened up!', {
        description: `You got a spot for ${data.templateName}. Check your notifications.`,
      });
    }
  }, [data, hasNotified, addNotification]);
}
