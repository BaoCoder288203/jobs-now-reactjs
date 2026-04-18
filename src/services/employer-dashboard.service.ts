import { apiClient } from './api';
import type { DashboardMetricsQuery, EmployerDashboardMetrics } from '@/types/employer-dashboard';

function unwrap<T>(response: unknown): T {
  const r = response as { data?: T };
  return (r?.data ?? r) as T;
}

export async function getEmployerDashboardMetrics(query: DashboardMetricsQuery): Promise<EmployerDashboardMetrics> {
  const params: Record<string, string | boolean> = {
    preset: query.preset,
    tz: query.tz ?? 'Asia/Ho_Chi_Minh',
    comparePrevious: query.comparePrevious ?? true,
  };

  if (query.preset === 'custom') {
    if (!query.from || !query.to) {
      throw new Error('from and to are required for custom preset');
    }
    params.from = query.from;
    params.to = query.to;
  }

  const res = await apiClient.get('/company/me/dashboard-metrics', { params });
  return unwrap<EmployerDashboardMetrics>(res);
}
