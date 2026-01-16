import type { User, Session } from '@/types';
import { USE_MOCK } from './api';
import * as mockAuth from '@/mocks/handlers/auth.mock';
import { apiClient } from './api';

export async function login(email: string, password: string): Promise<{
  user: User;
  token: string;
  refreshToken: string;
  session: Session;
}> {
  if (USE_MOCK) {
    return mockAuth.mockLogin(email, password);
  }
  
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
}

export async function register(data: {
  email: string;
  password: string;
  fullName: string;
  role: string;
  phone?: string;
}): Promise<{
  user: User;
  token: string;
}> {
  if (USE_MOCK) {
    return mockAuth.mockRegister(data);
  }
  
  const response = await apiClient.post('/auth/register', data);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  if (USE_MOCK) {
    return mockAuth.mockGetCurrentUser();
  }
  
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export async function logout(): Promise<void> {
  if (USE_MOCK) {
    return mockAuth.mockLogout();
  }
  
  await apiClient.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  if (USE_MOCK) {
    return mockAuth.mockGetUserSessions(userId);
  }
  
  const response = await apiClient.get(`/auth/sessions/${userId}`);
  return response.data;
}

export async function logoutOtherSessions(userId: string, currentSessionId: string): Promise<void> {
  if (USE_MOCK) {
    return mockAuth.mockLogoutOtherSessions(userId, currentSessionId);
  }
  
  await apiClient.delete(`/auth/sessions/${userId}`, {
    params: { exclude: currentSessionId }
  });
}

