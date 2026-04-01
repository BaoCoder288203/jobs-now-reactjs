import { apiClient } from './api';

export interface SubscriptionPlan {
  planId: number;
  name: string;
  price: number;
  type: string;
  priorityLevel?: number;
  durationDays: number;
  boostScore: number;
  jobPostLimit: number;
  aiCvScanningLimit: number;
  useAiCvBuilder: boolean;
  scope: 'SUBSCRIPTION' | 'BOOST' | 'CANDIDATE_SUBSCRIPTION';
  targetAudience?: 'EMPLOYER' | 'CANDIDATE';
  aiMatchLimit?: number;
  isProfileHighlighted?: boolean;
  description: string;
}

export interface PaymentHistory {
  orderId: number;
  orderNumber: string;
  planName: string;
  planPriorityLevel?: number;
  jobTitle: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paidAt: string;
}

export interface CompanySubscriptionStatus {
  accountStatus: 'PENDING_PAYMENT' | 'PAID_ACTIVE' | 'TRIAL_ACTIVE' | 'EXPIRED' | 'TRIAL_EXPIRED';
  currentPlanId: number | null;
  currentPlanName: string | null;
  currentPlanType: string | null;
  active: boolean;
  startedAt: string | null;
  expiresAt: string | null;
  remainingJobPosts: number;
  remainingAiScans: number;
  aiCvBuilderEnabled: boolean;
  remainingAiCvBuilderTrials: number;
  canRepurchase: boolean;
  hasPendingOrder: boolean;
}

export interface CandidateSubscriptionStatus {
  accountStatus: 'PENDING_PAYMENT' | 'PAID_ACTIVE' | 'EXPIRED' | 'NO_PLAN';
  currentPlanId: number | null;
  currentPlanName: string | null;
  active: boolean;
  startedAt: string | null;
  expiresAt: string | null;
  remainingAiMatches: number;
  remainingAiCvBuilderTrials: number;
  isProfileHighlighted: boolean;
  canRepurchase: boolean;
  hasPendingOrder: boolean;
}

function deriveAccountStatus(data: Partial<CompanySubscriptionStatus>): CompanySubscriptionStatus['accountStatus'] {
  if (data.accountStatus) {
    return data.accountStatus;
  }
  if (data.hasPendingOrder) {
    return 'PENDING_PAYMENT';
  }
  if (data.active && data.currentPlanId != null) {
    return 'PAID_ACTIVE';
  }
  if (data.active) {
    return 'TRIAL_ACTIVE';
  }
  if (data.currentPlanId != null) {
    return 'EXPIRED';
  }
  return 'TRIAL_EXPIRED';
}
export const getPlans = async (scope?: 'SUBSCRIPTION' | 'BOOST' | 'CANDIDATE_SUBSCRIPTION'): Promise<SubscriptionPlan[]> => {
  const params = scope ? { scope } : {};
  const res = await apiClient.get('/plans', { params });
  return res.data;
};

export const createPaymentUrl = async (planId: number, jobId?: number): Promise<string> => {
  const body: Record<string, number> = { planId };
  if (jobId != null) {
    body.jobId = jobId;
  }
  const res = await apiClient.post('/payment/create', body);
  return res.data.paymentUrl;
};

export const getPaymentHistory = async (): Promise<PaymentHistory[]> => {
  const res = await apiClient.get('/payment/history');
  return res.data;
};

export const getSubscriptionStatus = async (): Promise<CompanySubscriptionStatus> => {
  const res = await apiClient.get('/payment/subscription-status');
  const data = res.data as Partial<CompanySubscriptionStatus>;
  return {
    accountStatus: deriveAccountStatus(data),
    currentPlanId: data.currentPlanId ?? null,
    currentPlanName: data.currentPlanName ?? null,
    currentPlanType: data.currentPlanType ?? null,
    active: data.active ?? false,
    startedAt: data.startedAt ?? null,
    expiresAt: data.expiresAt ?? null,
    remainingJobPosts: data.remainingJobPosts ?? 0,
    remainingAiScans: data.remainingAiScans ?? 0,
    aiCvBuilderEnabled: data.aiCvBuilderEnabled ?? false,
    remainingAiCvBuilderTrials: data.remainingAiCvBuilderTrials ?? 0,
    canRepurchase: data.canRepurchase ?? true,
    hasPendingOrder: data.hasPendingOrder ?? false,
  };
};

export const getCandidateSubscriptionStatus = async (): Promise<CandidateSubscriptionStatus> => {
  const res = await apiClient.get('/payment/candidate/subscription-status');
  const data = res.data as Partial<CandidateSubscriptionStatus>;
  return {
    accountStatus: data.accountStatus ?? 'NO_PLAN',
    currentPlanId: data.currentPlanId ?? null,
    currentPlanName: data.currentPlanName ?? null,
    active: data.active ?? false,
    startedAt: data.startedAt ?? null,
    expiresAt: data.expiresAt ?? null,
    remainingAiMatches: data.remainingAiMatches ?? 0,
    remainingAiCvBuilderTrials: data.remainingAiCvBuilderTrials ?? 0,
    isProfileHighlighted: data.isProfileHighlighted ?? false,
    canRepurchase: data.canRepurchase ?? true,
    hasPendingOrder: data.hasPendingOrder ?? false,
  };
};
