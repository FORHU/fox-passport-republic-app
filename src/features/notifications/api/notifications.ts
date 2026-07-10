import api from "@/shared/lib/axios";
import { Notification } from "../types";

export interface GetNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
}

export const getNotifications = async (): Promise<GetNotificationsResult> => {
  const res = await api.get("/notifications");
  return {
    notifications: res.data.notifications || [],
    unreadCount: typeof res.data.unreadCount === "number" ? res.data.unreadCount : 0,
  };
};

export const markNotificationsAsRead = async (id: string): Promise<Notification> => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data.data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch("/notifications/read-all");
};