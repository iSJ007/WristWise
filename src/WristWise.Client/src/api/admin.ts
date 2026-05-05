import { apiFetch } from './client';
import type { UserSummary } from '../types';

export function getUsers(): Promise<UserSummary[]> {
  return apiFetch('/admin/users');
}

export function resetPassword(userId: number, newPassword: string): Promise<string> {
  return apiFetch(`/admin/users/${userId}/reset-password`, {
    method: 'PUT',
    body: JSON.stringify({ newPassword }),
  });
}
