import type { User } from './user.d';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  job_post_limit?: number;
  featured_job_limit?: number;
  description?: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  subscription_plan_id: string;
  amount: number;
  payment_method?: string;
  payment_status: string;
  expired_at?: string;
  created_at: string;
  
  user?: User;
  plan?: SubscriptionPlan;
}
