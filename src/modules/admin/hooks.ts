import { useQuery } from '@tanstack/react-query';
import * as adminService from '@/services/admin.service';

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminService.getAdminStats(),
  });
}
