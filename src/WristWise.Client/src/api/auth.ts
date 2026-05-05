import { apiFetch } from './client';
import type { AuthUser } from '../types';

interface AuthResponse {
  userId: number;
  username: string;
  isAdmin: boolean;
  token: string;
}

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const data = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return { user: { userId: data.userId, username: data.username, isAdmin: data.isAdmin }, token: data.token };
}

export async function register(username: string, email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const data = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
  return { user: { userId: data.userId, username: data.username, isAdmin: data.isAdmin }, token: data.token };
}
