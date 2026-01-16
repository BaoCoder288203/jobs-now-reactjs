import type { Conversation, Message } from '@/types';
import { mockUsers } from './users.mock';

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_id: 'user-2',
    content: 'Hello, I saw your job posting and I\'m interested in the position.',
    is_read: true,
    created_at: '2024-02-10T10:00:00Z',
    sender: mockUsers[1]
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    sender_id: 'user-4',
    content: 'Hi! Thank you for your interest. We received your application and are reviewing it.',
    is_read: true,
    created_at: '2024-02-10T14:30:00Z',
    sender: mockUsers[3]
  },
  {
    id: 'msg-3',
    conversation_id: 'conv-1',
    sender_id: 'user-2',
    content: 'Great! When can I expect to hear back?',
    is_read: false,
    created_at: '2024-02-11T09:00:00Z',
    sender: mockUsers[1]
  },
  {
    id: 'msg-4',
    conversation_id: 'conv-2',
    sender_id: 'user-3',
    content: 'Hi, I have a question about the job requirements.',
    is_read: false,
    created_at: '2024-02-12T11:00:00Z',
    sender: mockUsers[2]
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-11T09:00:00Z',
    messages: mockMessages.filter(m => m.conversation_id === 'conv-1')
  },
  {
    id: 'conv-2',
    created_at: '2024-02-12T11:00:00Z',
    updated_at: '2024-02-12T11:00:00Z',
    messages: mockMessages.filter(m => m.conversation_id === 'conv-2')
  }
];

export { mockMessages };

export function getConversationsByUserId(userId: string): Conversation[] {
  // In real app, we would need a separate table to map users to conversations
  // For now, return conversations where user has messages
  const userMessageIds = mockMessages
    .filter(m => m.sender_id === userId)
    .map(m => m.conversation_id);
  
  return mockConversations.filter(c => userMessageIds.includes(c.id));
}

export function getConversationById(conversationId: string): Conversation | null {
  return mockConversations.find(c => c.id === conversationId) || null;
}

export function getMessagesByConversationId(conversationId: string): Message[] {
  return mockMessages.filter(m => m.conversation_id === conversationId);
}

export function addMessage(conversationId: string, senderId: string, content: string): Message {
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    is_read: false,
    created_at: new Date().toISOString(),
    sender: mockUsers.find(u => u.id === senderId) || undefined
  };

  mockMessages.push(newMessage);

  const conversation = mockConversations.find(c => c.id === conversationId);
  if (conversation) {
    conversation.updated_at = newMessage.created_at;
    if (!conversation.messages) {
      conversation.messages = [];
    }
    conversation.messages.push(newMessage);
  }

  return newMessage;
}

export function markMessagesAsRead(conversationId: string, userId: string): void {
  mockMessages.forEach(msg => {
    if (msg.conversation_id === conversationId && msg.sender_id !== userId && !msg.is_read) {
      msg.is_read = true;
    }
  });
}
