import { apiClient } from './api';

export interface AdminDashboardStats {
  totalApplications: number;
  openJobs: number;
  activeUsers: number;
  pendingApprovals: number;
}

export interface AdminUserDTO {
  userId: number;
  email: string;
  fullName: string;
  phone?: string | null;
  roleName: string;
  status: 'ACTIVE' | 'DISABLED';
  isVerified?: boolean | null;
  createdAt?: string | null;
}

type AdminUserApi = {
  userId?: number;
  email?: string;
  fullName?: string;
  phone?: string | null;
  roleName?: string;
  role?: string;
  status?: 'ACTIVE' | 'DISABLED' | string;
  isVerified?: boolean | null;
  createdAt?: string | null;
};

function mapAdminUser(raw: AdminUserApi): AdminUserDTO {
  const normalizedRole = raw.roleName ?? raw.role ?? 'ROLE_JOBSEEKER';
  const normalizedStatus = raw.status
    ? (String(raw.status).toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'DISABLED')
    : (raw.isVerified ? 'ACTIVE' : 'DISABLED');

  return {
    userId: Number(raw.userId ?? 0),
    email: String(raw.email ?? ''),
    fullName: String(raw.fullName ?? ''),
    phone: raw.phone ?? null,
    roleName: normalizedRole,
    status: normalizedStatus,
    isVerified: raw.isVerified ?? (normalizedStatus === 'ACTIVE'),
    createdAt: raw.createdAt ?? null,
  };
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

export async function getAdminUsers(): Promise<AdminUserDTO[]> {
  const res = await apiClient.get('/admin/users');
  const payload = (res as { data?: AdminUserApi[] }).data;
  return Array.isArray(payload) ? payload.map(mapAdminUser) : [];
}

export async function updateAdminUser(
  userId: number,
  body: { roleName?: string; status?: string }
): Promise<AdminUserDTO> {
  const res = await apiClient.put(`/admin/users/${userId}`, body);
  const raw = ((res as { data?: AdminUserApi })?.data ?? res) as AdminUserApi;
  return mapAdminUser(raw);
}
