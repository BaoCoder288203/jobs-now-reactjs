import type { SubscriptionPlan, Order } from '@/types';
import { mockUsers } from './users.mock';

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-1',
    name: 'Basic Plan',
    price: 0,
    duration_days: 30,
    job_post_limit: 5,
    featured_job_limit: 0,
    description: 'Basic plan for small businesses',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'plan-2',
    name: 'Professional Plan',
    price: 29.99,
    duration_days: 30,
    job_post_limit: 50,
    featured_job_limit: 5,
    description: 'Professional plan for growing businesses',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'plan-3',
    name: 'Enterprise Plan',
    price: 99.99,
    duration_days: 30,
    job_post_limit: undefined, // Unlimited
    featured_job_limit: 20,
    description: 'Enterprise plan for large organizations',
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    user_id: 'user-4',
    subscription_plan_id: 'plan-2',
    amount: 29.99,
    payment_method: 'credit_card',
    payment_status: 'completed',
    expired_at: '2024-03-10T00:00:00Z',
    created_at: '2024-01-10T00:00:00Z',
    user: mockUsers[3],
    plan: mockSubscriptionPlans[1]
  },
  {
    id: 'order-2',
    user_id: 'user-4',
    subscription_plan_id: 'plan-3',
    amount: 99.99,
    payment_method: 'bank_transfer',
    payment_status: 'pending',
    created_at: '2024-02-01T10:00:00Z',
    user: mockUsers[3],
    plan: mockSubscriptionPlans[2]
  }
];

export function getSubscriptionPlans(): SubscriptionPlan[] {
  return mockSubscriptionPlans;
}

export function getSubscriptionPlanById(planId: string): SubscriptionPlan | null {
  return mockSubscriptionPlans.find(p => p.id === planId) || null;
}

export function getOrdersByUserId(userId: string): Order[] {
  return mockOrders.filter(o => o.user_id === userId);
}

export function getOrderById(orderId: string): Order | null {
  return mockOrders.find(o => o.id === orderId) || null;
}

export function createOrder(userId: string, planId: string): Order {
  const plan = getSubscriptionPlanById(planId);
  if (!plan) {
    throw new Error('Subscription plan not found');
  }

  const newOrder: Order = {
    id: `order-${Date.now()}`,
    user_id: userId,
    subscription_plan_id: planId,
    amount: plan.price,
    payment_method: 'credit_card',
    payment_status: 'pending',
    expired_at: new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    user: mockUsers.find(u => u.id === userId) || undefined,
    plan
  };

  mockOrders.push(newOrder);
  return newOrder;
}

export function updateOrderStatus(orderId: string, paymentStatus: string): Order | null {
  const order = mockOrders.find(o => o.id === orderId);
  if (order) {
    order.payment_status = paymentStatus;
    return order;
  }
  return null;
}
