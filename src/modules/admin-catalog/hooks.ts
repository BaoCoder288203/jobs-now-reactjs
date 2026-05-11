import { useInfiniteQuery } from '@tanstack/react-query';
import * as industryService from '@/services/industry.service';
import * as categoryService from '@/services/category.service';
import * as majorService from '@/services/major.service';

export const adminCatalogKeys = {
  all: ['admin-catalog'] as const,
  industriesInfinite: (limit: number) => [...adminCatalogKeys.all, 'industries', limit] as const,
  jobCategoriesInfinite: (limit: number) => [...adminCatalogKeys.all, 'job-categories', limit] as const,
  majorsInfinite: (limit: number) => [...adminCatalogKeys.all, 'majors', limit] as const,
};

export function useIndustriesAdminInfinite(limit = 10) {
  return useInfiniteQuery({
    queryKey: adminCatalogKeys.industriesInfinite(limit),
    queryFn: ({ pageParam }) => industryService.getIndustriesAdminPage(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useJobCategoriesAdminInfinite(limit = 10) {
  return useInfiniteQuery({
    queryKey: adminCatalogKeys.jobCategoriesInfinite(limit),
    queryFn: ({ pageParam }) => categoryService.getJobCategoriesAdminPage(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useMajorsAdminInfinite(limit = 10) {
  return useInfiniteQuery({
    queryKey: adminCatalogKeys.majorsInfinite(limit),
    queryFn: ({ pageParam }) => majorService.getMajorsAdminPage(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}
