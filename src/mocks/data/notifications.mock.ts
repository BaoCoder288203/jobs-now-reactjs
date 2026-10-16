import type { Notification } from '@/types';

export const mockNotifications: Notification[] = [
  {
    notificationId: 1,
    content: 'Your application for Senior Frontend Developer has been reviewed',
    type: 'SYSTEM',
    isRead: false,
    createdAt: '2024-02-05T10:00:00Z',
    applicationId: 101,
  },
  {
    notificationId: 2,
    content: 'Congratulations! You have been accepted for interview',
    type: 'SYSTEM',
    isRead: false,
    createdAt: '2024-02-06T14:30:00Z',
    applicationId: 102,
  },
  {
    notificationId: 3,
    content: 'Your application for Senior Frontend Developer is under review',
    type: 'SYSTEM',
    isRead: true,
    createdAt: '2024-02-12T08:00:00Z',
    applicationId: 103,
  },
  {
    notificationId: 4,
    content: 'New job matching your skills: Full Stack Engineer at TechCorp Inc.',
    type: 'SYSTEM',
    isRead: false,
    createdAt: '2024-02-15T09:00:00Z',
  }
];

export function getNotificationsByUserId(userId: string): Notification[] {
  // Legacy mock keeps a global list; caller-side filtering can be added if userId is modeled.
  void userId;
  return mockNotifications;
}

export function getUnreadNotificationsByUserId(userId: string): Notification[] {
  void userId;
  return mockNotifications.filter((n) => !n.isRead);
}

export function markNotificationAsRead(notificationId: string): boolean {
  const numericId = Number(notificationId);
  const notification = mockNotifications.find((n) => n.notificationId === numericId);
  if (notification) {
    notification.isRead = true;
    return true;
  }
  return false;
}

export function markAllNotificationsAsRead(userId: string): void {
  void userId;
  mockNotifications.forEach((n) => {
    if (!n.isRead) {
      n.isRead = true;
    }
  });
}
