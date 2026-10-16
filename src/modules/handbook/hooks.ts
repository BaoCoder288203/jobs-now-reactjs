import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as handbookService from '@/services/handbook.service';
import * as companyPostService from '@/services/company-post.service';

export const handbookKeys = {
  all: ['handbook'] as const,
  featured: (limit: number) => [...handbookKeys.all, 'featured', limit] as const,
  explore: (limit: number) => [...handbookKeys.all, 'explore', limit] as const,
  list: (page: number, size: number, categoryKey?: string) =>
    [...handbookKeys.all, 'list', page, size, categoryKey ?? ''] as const,
  detail: (slug: string) => [...handbookKeys.all, 'detail', slug] as const,
};

export const companyPostKeys = {
  all: ['company-posts'] as const,
  mine: (page: number, limit: number) => [...companyPostKeys.all, 'mine', page, limit] as const,
  detail: (id: number) => [...companyPostKeys.all, 'detail', id] as const,
  adminPending: (page: number, limit: number) =>
    [...companyPostKeys.all, 'admin-pending', page, limit] as const,
};

export function useHandbookFeatured(limit = 12) {
  return useQuery({
    queryKey: handbookKeys.featured(limit),
    queryFn: () => handbookService.getHandbookFeatured(limit),
  });
}

export function useHandbookExplore(limit = 9) {
  return useQuery({
    queryKey: handbookKeys.explore(limit),
    queryFn: () => handbookService.getHandbookExplore(limit),
  });
}

export function useHandbookList(page: number, size: number, categoryKey?: string) {
  return useQuery({
    queryKey: handbookKeys.list(page, size, categoryKey),
    queryFn: () => handbookService.getHandbookList(page, size, categoryKey),
  });
}

export function useHandbookDetail(slug: string) {
  return useQuery({
    queryKey: handbookKeys.detail(slug),
    queryFn: () => handbookService.getHandbookBySlug(slug),
    enabled: !!slug,
  });
}

export function useMyCompanyPosts(page = 1, limit = 10) {
  return useQuery({
    queryKey: companyPostKeys.mine(page, limit),
    queryFn: () => companyPostService.getMyCompanyPosts(page, limit),
  });
}

export function useMyCompanyPost(postId: number | undefined) {
  return useQuery({
    queryKey: companyPostKeys.detail(postId ?? 0),
    queryFn: () => companyPostService.getMyCompanyPost(postId!),
    enabled: postId != null && postId > 0,
  });
}

export function useCreateCompanyPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: companyPostService.createCompanyPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyPostKeys.all });
      qc.invalidateQueries({ queryKey: handbookKeys.all });
    },
  });
}

export function useUpdateCompanyPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, payload }: { postId: number; payload: companyPostService.UpdateCompanyPostPayload }) =>
      companyPostService.updateCompanyPost(postId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyPostKeys.all });
      qc.invalidateQueries({ queryKey: handbookKeys.all });
    },
  });
}

export function useSubmitCompanyPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: companyPostService.submitCompanyPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyPostKeys.all });
      qc.invalidateQueries({ queryKey: handbookKeys.all });
    },
  });
}

export function useTrashMyCompanyPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: companyPostService.trashMyCompanyPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyPostKeys.all });
      qc.invalidateQueries({ queryKey: handbookKeys.all });
    },
  });
}

export function useAdminPendingPosts(page = 1, limit = 10) {
  return useQuery({
    queryKey: companyPostKeys.adminPending(page, limit),
    queryFn: () => companyPostService.getAdminPendingPosts(page, limit),
  });
}

export function useApproveCompanyPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: companyPostService.approveCompanyPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyPostKeys.all });
      qc.invalidateQueries({ queryKey: handbookKeys.all });
    },
  });
}

export function useRejectCompanyPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, rejectionNote }: { postId: number; rejectionNote: string }) =>
      companyPostService.rejectCompanyPost(postId, rejectionNote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyPostKeys.all });
    },
  });
}

export function useTrashCompanyPostAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: companyPostService.trashCompanyPostAdmin,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyPostKeys.all });
      qc.invalidateQueries({ queryKey: handbookKeys.all });
    },
  });
}
