import type { User, Session } from '@/types';
import { mockUsers, mockRoles, findUserByCredentials } from '../data/users.mock';
import { createSession, getSessionByToken, deleteSession, getSessionsByUserId } from '../data/sessions.mock';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockLogin(email: string, password: string): Promise<{
  user: User;
  token: string;
  refreshToken: string;
  session: Session;
}> {
  await delay(600);
  
  const user = findUserByCredentials(email, password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;
  
  const session = createSession(user.id, token, navigator.userAgent);
  
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
  
  return {
    user,
    token,
    refreshToken,
    session
  };
}

export async function mockRegister(data: {
  email: string;
  password: string;
  fullName: string;
  role: string;
  phone?: string;
}): Promise<{
  user: User;
  token: string;
}> {
  await delay(800);
  
  if (mockUsers.some(u => u.email === data.email)) {
    throw new Error('Email already exists');
  }
  
  if (data.phone && mockUsers.some(u => u.phone === data.phone)) {
    throw new Error('Số điện thoại đã được sử dụng');
  }
  
  const roleIdMap: Record<string, string> = {
    'JOB_SEEKER': 'role-1',
    'RECRUITER': 'role-2',
    'ADMIN': 'role-3'
  };
  
  // Get role from mockRoles
  const roleId = roleIdMap[data.role] || 'role-1';
  const role = mockRoles.find(r => r.id === roleId);
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: data.email,
    full_name: data.fullName,
    phone: data.phone,
    role_id: roleId,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: role
  };
  
  mockUsers.push(newUser);
  
  const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
  localStorage.setItem('token', token);
  
  return {
    user: newUser,
    token
  };
}

export async function mockGetCurrentUser(): Promise<User> {
  await delay(300);
  
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const session = getSessionByToken(token);
  
  if (!session) {
    throw new Error('Invalid session');
  }
  
  const user = mockUsers.find(u => u.id === session.userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

export async function mockLogout(): Promise<void> {
  await delay(200);
  
  const token = localStorage.getItem('token');
  
  if (token) {
    const session = getSessionByToken(token);
    if (session) {
      deleteSession(session.sessionId);
    }
  }
  
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
}

export async function mockGetUserSessions(userId: string): Promise<Session[]> {
  await delay(400);
  return getSessionsByUserId(userId);
}

export async function mockLogoutOtherSessions(userId: string, currentSessionId: string): Promise<void> {
  await delay(300);
  const sessions = getSessionsByUserId(userId);
  
  sessions.forEach(session => {
    if (session.sessionId !== currentSessionId) {
      deleteSession(session.sessionId);
    }
  });
}

