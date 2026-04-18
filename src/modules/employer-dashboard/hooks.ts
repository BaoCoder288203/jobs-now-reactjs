import { useQuery } from '@tanstack/react-query';
import type { DashboardMetricsQuery } from '@/types/employer-dashboard';
import { getEmployerDashboardMetrics } from '@/services/employer-dashboard.service';

export const employerDashboardKeys = {
  all: ['employer-dashboard'] as const,
  metrics: (query: DashboardMetricsQuery) => [...employerDashboardKeys.all, query] as const,
};

export function useEmployerDashboardMetrics(query: DashboardMetricsQuery, enabled = true) {
  return useQuery({
    queryKey: employerDashboardKeys.metrics(query),
    queryFn: () => getEmployerDashboardMetrics(query),
    enabled,
  });
}
