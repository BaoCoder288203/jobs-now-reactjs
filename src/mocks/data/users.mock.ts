import type { Role, User } from '@/types';

export interface MockUser extends User {
  id: string;
  role_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  roleDetail?: Role;
}

export const mockRoles: Role[] = [
  {
    id: 'role-1',
    name: 'job_seeker',
    description: 'Job Seeker Role',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role-2',
    name: 'recruiter',
    description: 'Recruiter Role',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role-3',
    name: 'admin',
    description: 'Admin Role',
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    userId: 1,
    email: 'admin@jobsnow.com',
    fullName: 'Admin User',
    phone: null,
    role: 'ROLE_ADMIN',
    avatar: null,
    profileId: null,
    companyId: null,
    companyName: null,
    role_id: 'role-3',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    roleDetail: mockRoles[2]
  },
  {
    id: 'user-2',
    userId: 2,
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    phone: '+1234567890',
    role: 'ROLE_JOBSEEKER',
    avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_mTE1BI2FMsvPY65tu6cE58IZKGZDAiUsB4mkqRbbijW5o=s900-c-k-c0x00ffffff-no-rj',
    profileId: null,
    companyId: null,
    companyName: null,
    role_id: 'role-1',
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    last_login_at: '2024-02-15T10:00:00Z',
    roleDetail: mockRoles[0]
  },
  {
    id: 'user-3',
    userId: 3,
    email: 'jane.smith@example.com',
    fullName: 'Jane Smith',
    phone: '+1234567891',
    role: 'ROLE_JOBSEEKER',
    avatar: 'https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/188256/Originals/anh-da-den-meme%20(1).jpg',
    profileId: null,
    companyId: null,
    companyName: null,
    role_id: 'role-1',
    status: 'active',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    last_login_at: '2024-02-14T09:00:00Z',
    roleDetail: mockRoles[0]
  },
  {
    id: 'user-4',
    userId: 4,
    email: 'recruiter@techcorp.com',
    fullName: 'Sarah Johnson',
    phone: '+1234567892',
    role: 'ROLE_COMPANY',
    avatar: 'https://www.in.pro.vn/wp-content/uploads/2025/01/meme-anh-da-den-cuoi-tuoi.webp',
    profileId: null,
    companyId: null,
    companyName: null,
    role_id: 'role-2',
    status: 'active',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    last_login_at: '2024-02-15T11:00:00Z',
    roleDetail: mockRoles[1]
  },
  {
    id: 'user-5',
    userId: 5,
    email: 'recruiter.new@example.com',
    fullName: 'New Recruiter',
    phone: '+1234567893',
    role: 'ROLE_COMPANY',
    avatar: null,
    profileId: null,
    companyId: null,
    companyName: null,
    role_id: 'role-2',
    status: 'active',
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z',
    roleDetail: mockRoles[1]
  }
];

export function findUserByCredentials(email: string, password: string): MockUser | null {
  const user = mockUsers.find(u => u.email === email);
  if (!user) return null;

  if (password === 'password123') {
    return user;
  }
  return null;
}

export function getRoleByRoleId(roleId: string): Role | null {
  return mockRoles.find(r => r.id === roleId) || null;
}
