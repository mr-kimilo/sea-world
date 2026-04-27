import api from './client';
import type { ApiResponse, AuthResponse, LoginForm, RegisterForm } from '../types';

export const authApi = {
  register: (data: RegisterForm) =>
    api.post<ApiResponse<void>>('/auth/register', data),

  login: (data: LoginForm) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken }),

  verifyEmail: (token: string) =>
    api.post<ApiResponse<void>>(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (email: string) =>
    api.post<ApiResponse<void>>(`/auth/resend-verification?email=${encodeURIComponent(email)}`),
};
