import type { AuthResponse, BaseResponse } from '@/types';
import { apiClient } from './api';

export async function login(email: string, password: string): Promise<AuthResponse> {
  localStorage.removeItem('token');

  const response: BaseResponse<AuthResponse> = await apiClient.post('/auth/login', {
    email,
    password
  });

  if (response.code !== 200 || !response.data) {
    throw new Error(response.message || 'Email hoặc mật khẩu không đúng');
  }

  localStorage.setItem('token', response.data.token);
  return response.data;
}

export interface RegisterData {
  email: string;
  password: string;
  phone?: string;
  roleName: string;
  fullName?: string;
  address?: string;
  dob?: string;
  bio?: string;
  companyName?: string;
  website?: string;
  description?: string;
  companyAddress?: string;
  logo?: File;
}

export async function register(data: RegisterData): Promise<string> {

  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('roleName', data.roleName);

  if (data.phone) formData.append('phone', data.phone);
  if (data.fullName) formData.append('fullName', data.fullName);
  if (data.address) formData.append('address', data.address);
  if (data.dob) formData.append('dob', data.dob);
  if (data.bio) formData.append('bio', data.bio);
  if (data.companyName) formData.append('companyName', data.companyName);
  if (data.website) formData.append('website', data.website);
  if (data.description) formData.append('description', data.description);
  if (data.companyAddress) formData.append('companyAddress', data.companyAddress);
  if (data.logo) formData.append('logo', data.logo);

  const response: BaseResponse = await apiClient.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.message;
}

export async function checkEmail(email: string): Promise<boolean> {
  const response: BaseResponse<boolean> = await apiClient.post(
    `/auth/check-email?email=${encodeURIComponent(email)}`
  );
  return response.data;
}

export async function sendLoginOtp(email: string): Promise<void> {
  const response: BaseResponse = await apiClient.post('/auth/send-otp', { email });
  if (response.code !== 200) {
    throw new Error(response.message || 'Gửi OTP thất bại');
  }
}

export async function googleLogin(idToken: string, roleName: string): Promise<AuthResponse> {
  localStorage.removeItem('token');

  const response: BaseResponse<AuthResponse> = await apiClient.post('/auth/google-login', {
    idToken,
    roleName,
  });

  if (response.code !== 200 || !response.data) {
    throw new Error(response.message || 'Đăng nhập Google thất bại');
  }

  localStorage.setItem('token', response.data.token);
  return response.data;
}

export async function loginByOtp(email: string, otp: string): Promise<AuthResponse> {
  localStorage.removeItem('token');

  const response: BaseResponse<AuthResponse> = await apiClient.post('/auth/verify-login-otp', {
    email,
    otp
  });

  if (response.code !== 200 || !response.data) {
    throw new Error(response.message || 'Mã OTP không đúng hoặc đã hết hạn');
  }

  localStorage.setItem('token', response.data.token);
  return response.data;
}

export async function verifyOtp(email: string, otp: string): Promise<string> {
  const response: BaseResponse = await apiClient.post('/auth/verify-otp', {
    email,
    otp
  });
  return response.message;
}

export async function resendOtp(email: string): Promise<string> {
  const response: BaseResponse = await apiClient.post('/auth/resend-otp', {
    email
  });
  return response.message;
}

export async function logout(): Promise<void> {
  localStorage.removeItem('token');
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const response: BaseResponse<AuthResponse> = await apiClient.get('/auth/me');
  return response.data;
}