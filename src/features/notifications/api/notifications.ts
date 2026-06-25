import api from "@/shared/lib/axios";
import { Notification } from "../types";

export const getNotifications = async (): Promise<Notification[]> => {
  const res = await api.get("/notifications");
  return res.data.data || [];
};

export const markNotificationsAsRead = async (id: string): Promise<Notification> => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data.data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch("/notifications/read-all");
};