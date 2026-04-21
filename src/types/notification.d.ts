export interface Notification {
  notificationId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  applicationId?: number;
  // For Chat notifications
  type?: 'SYSTEM' | 'CHAT' | 'COMPANY_POST' | 'JOB_POST';
  senderName?: string;
  conversationId?: number;
}
