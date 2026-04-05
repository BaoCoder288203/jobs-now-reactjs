import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Company, PaginationParams } from '@/types';
import type { CreateCompanyReviewRequest } from '@/types/company-review';
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

export const companyReviewKeys = {
  all: ['company-reviews'] as const,
  list: (companyId: string, page: number, limit: number) =>
    [...companyReviewKeys.all, companyId, page, limit] as const,
};

export const companyFollowKeys = {
  all: ['company-follow'] as const,
  detail: (companyId: string) => [...companyFollowKeys.all, companyId] as const,
  followers: (companyId: string, page: number) => [...companyFollowKeys.all, 'followers', companyId, page] as const,
};

export const recruiterReviewKeys = {
  all: ['recruiter-company-reviews'] as const,
  list: (page: number, limit: number) => [...recruiterReviewKeys.all, page, limit] as const,
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

export function useDeleteLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => companyService.deleteLogo(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.myCompany() });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => companyService.deleteBanner(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.myCompany() });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

export function useDeleteCompanyImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: number) => companyService.deleteCompanyImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.myCompany() });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

export function useCompanyReviews(companyId: string, page = 1, limit = 5) {
  return useQuery({
    queryKey: companyReviewKeys.list(companyId, page, limit),
    queryFn: () => companyService.getCompanyReviews(companyId, page, limit),
    enabled: !!companyId,
  });
}

export function useCreateCompanyReview(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCompanyReviewRequest) =>
      companyService.createCompanyReview(companyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyReviewKeys.all });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) });
    },
  });
}

export function useCompanyFollowStatus(companyId: string, enabled = true) {
  return useQuery({
    queryKey: companyFollowKeys.detail(companyId),
    queryFn: () => companyService.getCompanyFollowStatus(companyId),
    enabled: !!companyId && enabled,
  });
}

export function useFollowCompany(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => companyService.followCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyFollowKeys.detail(companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) });
      queryClient.invalidateQueries({ queryKey: companyFollowKeys.all });
    },
  });
}

export function useUnfollowCompany(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => companyService.unfollowCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyFollowKeys.detail(companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) });
      queryClient.invalidateQueries({ queryKey: companyFollowKeys.all });
    },
  });
}

export function useCompanyFollowers(companyId: string | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: companyFollowKeys.followers(companyId ?? '', page),
    queryFn: () => companyService.getCompanyFollowers(companyId!, page, size),
    enabled: !!companyId,
  });
}

export function useRecruiterPendingReviews(page = 1, limit = 10) {
  return useQuery({
    queryKey: recruiterReviewKeys.list(page, limit),
    queryFn: () => companyService.getRecruiterPendingReviews(page, limit),
  });
}

export function useApproveRecruiterReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number) => companyService.approveRecruiterReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruiterReviewKeys.all });
    },
  });
}

export function useRejectRecruiterReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number) => companyService.rejectRecruiterReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruiterReviewKeys.all });
    },
  });
}

