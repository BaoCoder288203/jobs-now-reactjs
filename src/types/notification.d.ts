import type { User } from './user.d';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: string; // system, application, message
  is_read: boolean;
  created_at: string;
  
  user?: User;
}
