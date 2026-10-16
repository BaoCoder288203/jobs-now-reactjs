import type { User } from './user.d';

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  
  conversation?: Conversation;
  sender?: User;
}
