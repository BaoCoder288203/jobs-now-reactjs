export interface Role {
  id: string;
  name: string; // admin, employer, job_seeker
  description?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;

  role?: Role;
}

export interface Session {
  sessionId: string;
  userId: string;
  token: string;
  refreshToken?: string;
  device?: string;
  ipAddress?: string;
  userAgent?: string;
  lastActivityAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  avatar: string | null;
  profileId: number | null;
  companyId: number | null;
  companyName: string | null;
}