export interface WatchSummary {
  id: number;
  brand: string;
  name: string;
  reference: string;
  dialColor: string;
  caseMaterial: string;
  diameter: string;
  averageRating: number;
  reviewCount: number;
}

export interface WatchDetail {
  id: number;
  brand: string;
  name: string;
  reference: string;
  movementCaliber: string;
  movementFunctions: string;
  isLimited: boolean;
  limitedUnits: number | null;
  caseMaterial: string;
  glass: string;
  back: string;
  shape: string;
  diameter: string;
  height: string;
  waterResistance: string;
  dialColor: string;
  indexes: string;
  hands: string;
  description: string;
  averageRating: number;
  reviewCount: number;
  isWishlisted: boolean;
}

export interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface WishlistItem {
  watchId: number;
  brand: string;
  name: string;
  reference: string;
  addedAt: string;
}

export interface AuthUser {
  userId: number;
  username: string;
  isAdmin: boolean;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface BrowseResult {
  watches: WatchSummary[];
  total: number;
  page: number;
  pageSize: number;
}
