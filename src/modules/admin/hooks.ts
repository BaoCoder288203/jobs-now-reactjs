import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminService from '@/services/admin.service';
import type { AdminDashboardMetricsQuery } from '@/types/admin-dashboard';

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  metrics: (query: AdminDashboardMetricsQuery) => [...adminKeys.all, 'metrics', query] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  usersInfinite: (limit: number) => [...adminKeys.users(), 'infinite', limit] as const,
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

export function useAdminUsersInfinite(limit = 10) {
  return useInfiniteQuery({
    queryKey: adminKeys.usersInfinite(limit),
    queryFn: ({ pageParam }) => adminService.getAdminUsersPage(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: () => adminService.getAdminUsersPage(1, 100).then((r) => r.items),
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
