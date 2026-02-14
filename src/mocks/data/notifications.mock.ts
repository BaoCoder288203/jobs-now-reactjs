import type { Notification } from '@/types';
import { mockUsers } from './users.mock';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-2',
    title: 'Application Reviewed',
    content: 'Your application for Senior Frontend Developer has been reviewed',
    type: 'application',
    is_read: false,
    created_at: '2024-02-05T10:00:00Z',
    user: mockUsers[1]
  },
  {
    id: 'notif-2',
    user_id: 'user-2',
    title: 'Application Accepted',
    content: 'Congratulations! You have been accepted for interview',
    type: 'application',
    is_read: false,
    created_at: '2024-02-06T14:30:00Z',
    user: mockUsers[1]
  },
  {
    id: 'notif-3',
    user_id: 'user-3',
    title: 'Application Under Review',
    content: 'Your application for Senior Frontend Developer is under review',
    type: 'application',
    is_read: true,
    created_at: '2024-02-12T08:00:00Z',
    user: mockUsers[2]
  },
  {
    id: 'notif-4',
    user_id: 'user-2',
    title: 'New Job Match',
    content: 'New job matching your skills: Full Stack Engineer at TechCorp Inc.',
    type: 'system',
    is_read: false,
    created_at: '2024-02-15T09:00:00Z',
    user: mockUsers[1]
  }
];

export function getNotificationsByUserId(userId: string): Notification[] {
  return mockNotifications.filter(n => n.user_id === userId);
}

export function getUnreadNotificationsByUserId(userId: string): Notification[] {
  return mockNotifications.filter(n => n.user_id === userId && !n.is_read);
}

export function markNotificationAsRead(notificationId: string): boolean {
  const notification = mockNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.is_read = true;
    return true;
  }
  return false;
}

export function markAllNotificationsAsRead(userId: string): void {
  mockNotifications.forEach(n => {
    if (n.user_id === userId && !n.is_read) {
      n.is_read = true;
    }
  });
}
