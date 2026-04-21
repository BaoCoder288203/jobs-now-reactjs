import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminService from '@/services/admin.service';
import type { AdminDashboardMetricsQuery } from '@/types/admin-dashboard';

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  metrics: (query: AdminDashboardMetricsQuery) => [...adminKeys.all, 'metrics', query] as const,
  users: () => [...adminKeys.all, 'users'] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminService.getAdminStats(),
  });
}

export function useAdminDashboardMetrics(query: AdminDashboardMetricsQuery, enabled = true) {
  return useQuery({
    queryKey: adminKeys.metrics(query),
    queryFn: () => adminService.getAdminDashboardMetrics(query),
    enabled,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: () => adminService.getAdminUsers(),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: number;
      body: { roleName?: string; status?: string };
    }) => adminService.updateAdminUser(userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}
