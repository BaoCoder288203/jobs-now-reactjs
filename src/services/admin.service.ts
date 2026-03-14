import { apiClient } from './api';

export interface AdminDashboardStats {
  totalApplications: number;
  openJobs: number;
  activeUsers: number;
  pendingApprovals: number;
}

/** GET /admin/stats – dashboard counts for admin */
export async function getAdminStats(): Promise<AdminDashboardStats> {
  const res = await apiClient.get('/admin/stats');
  const raw = (res as { data?: AdminDashboardStats })?.data ?? res;
  const data = raw as AdminDashboardStats;
  return {
    totalApplications: Number(data?.totalApplications ?? 0),
    openJobs: Number(data?.openJobs ?? 0),
    activeUsers: Number(data?.activeUsers ?? 0),
    pendingApprovals: Number(data?.pendingApprovals ?? 0),
  };
}
