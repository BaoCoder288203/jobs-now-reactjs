import { apiClient } from './api';

export interface ConversationResponse {
  conversationId: number;
  createdAt: string;
  lastMessageAt: string;
  lastMessage: string;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar: string;
  unreadCount: number;
  isOtherUserOnline?: boolean;
  otherUserLastSeen?: string;
}

export interface MessageResponse {
  messageId: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  attachment?: {
    attachmentId: number;
    fileName: string;
    fileType: string;
    filePath: string;
  };
}

export async function createConversation(candidateId: number, employerId: number) {
  const res = await apiClient.post(`/chat/conversation?candidateId=${candidateId}&employerId=${employerId}`);
  return res.data;
}

export async function getUserConversations(userId: number): Promise<ConversationResponse[]> {
  const res = await apiClient.get(`/chat/conversations/${userId}`);
  return res.data;
}

export async function getMessages(conversationId: number): Promise<MessageResponse[]> {
  const res = await apiClient.get(`/chat/messages/${conversationId}`);
  return res.data;
}

export async function getUnreadCount(userId: number): Promise<number> {
  const res = await apiClient.get(`/chat/conversations/unread/${userId}`);
  return res.data;
}

export async function findConversationId(candidateId: number, employerId: number) {
  const res = await apiClient.get(`/chat/conversationId?candidateId=${candidateId}&employerId=${employerId}`);
  return res.data;
}

export async function deleteConversation(conversationId: number, userId: number) {
  const res = await apiClient.delete(`/chat/conversation/${conversationId}?userId=${userId}`);
  return res.data;
}

export async function uploadChatFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}
