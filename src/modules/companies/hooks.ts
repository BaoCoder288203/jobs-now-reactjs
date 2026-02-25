import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Company, PaginationParams } from '@/types';
import * as companyService from '@/services/company.service';
import { useAppSelector } from '@/app/hooks';

export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...companyKeys.lists(), params] as const,
  featuredBanners: () => [...companyKeys.all, 'featuredBanners'] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
  myCompany: () => [...companyKeys.all, 'my'] as const
};

export function useCompanies(params?: PaginationParams) {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => companyService.getCompanies(params)
  });
}

export function useFeaturedBanners(limit = 8) {
  return useQuery({
    queryKey: companyKeys.featuredBanners(),
    queryFn: async () => {
      const res = await companyService.getCompanies({ limit: 50, page: 1 });
      return res.items.filter((c): c is Company & { banner_url: string } =>
        !!c.banner_url && c.banner_url.trim() !== ''
      ).slice(0, limit);
    }
  });
}

export function useCompanyDetail(companyId: string) {
  return useQuery({
    queryKey: companyKeys.detail(companyId),
    queryFn: () => companyService.getCompanyDetail(companyId),
    enabled: !!companyId
  });
}

export function useMyCompany() {
  const { user } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: companyKeys.myCompany(),
    queryFn: () => companyService.getMyCompany(),
    enabled: !!user && (user.role === 'ROLE_COMPANY' || user.role === 'ROLE_ADMIN')
  });
}

export function useCreateMyCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => companyService.createMyCompany(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.myCompany() });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

export function useUpdateMyCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => companyService.updateMyCompany(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.myCompany() });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

