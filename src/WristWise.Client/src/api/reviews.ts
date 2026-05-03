import { apiFetch } from './client';
import type { Review } from '../types';

export function getReviews(watchId: number): Promise<Review[]> {
  return apiFetch(`/watches/${watchId}/reviews`);
}

export function createReview(watchId: number, rating: number, comment: string): Promise<Review> {
  return apiFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify({ watchId, rating, comment }),
  });
}

export function deleteReview(id: number): Promise<null> {
  return apiFetch(`/reviews/${id}`, { method: 'DELETE' });
}
