import { apiFetch } from './client';
import type { WatchSummary, WatchDetail, BrowseResult } from '../types';

export function getWatches(page: number, pageSize = 20): Promise<BrowseResult> {
  return apiFetch(`/watches?page=${page}&pageSize=${pageSize}`);
}

export function searchWatches(q: string, signal?: AbortSignal): Promise<WatchSummary[]> {
  return apiFetch(`/watches/search?q=${encodeURIComponent(q)}`, { signal });
}

export function getWatchById(id: number): Promise<WatchDetail> {
  return apiFetch(`/watches/${id}`);
}
