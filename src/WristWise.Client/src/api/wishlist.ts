import { apiFetch } from './client';
import type { WishlistItem } from '../types';

export function getWishlist(): Promise<WishlistItem[]> {
  return apiFetch('/wishlist');
}

export function addToWishlist(watchId: number): Promise<null> {
  return apiFetch(`/wishlist/${watchId}`, { method: 'POST' });
}

export function removeFromWishlist(watchId: number): Promise<null> {
  return apiFetch(`/wishlist/${watchId}`, { method: 'DELETE' });
}
