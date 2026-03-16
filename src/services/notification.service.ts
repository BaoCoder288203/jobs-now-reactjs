import { apiClient } from './api';
import type { Notification } from '@/types/notification';

export async function getNotifications(userId: number | string): Promise<Notification[]> {
  const res = await apiClient.get(`/notification/user/${userId}`);
  return res.data?.data || res.data;
}

export async function getUnreadCount(userId: number | string): Promise<number> {
  const res = await apiClient.get(`/notification/user/${userId}/unread-count`);
  return res.data?.data || res.data;
}

export async function markAsRead(notificationId: number | string) {
  const res = await apiClient.put(`/notification/${notificationId}/read`);
  return res.data;
}

export async function markAllAsRead(userId: number | string) {
  const res = await apiClient.put(`/notification/user/${userId}/read-all`);
  return res.data;
}
