export interface UserInfo {
  id: string;
  email: string;
  nickname: string | null;
  role: 'parent' | 'child' | 'admin';
  emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserInfo;
}

export interface ApiResponse<T = void> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface RegisterForm {
  email: string;
  password: string;
  inviteCode?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  nickname: string | null;
  avatarUrl: string | null;
  birthDate: string | null;
  totalScore: number;
  availableScore: number;
  createdAt: string;
}

export interface ScoreRecord {
  id: string;
  childId: string;
  operatorId: string;
  score: number;
  category: ScoreCategory;
  reason: string;
  rawVoiceText: string | null;
  recordDate: string;
  createdAt: string;
}

export type ScoreCategory = 'intelligence' | 'physical' | 'moral' | 'hygiene' | 'handcraft' | 'custom';

export interface ScoreSummary {
  intelligence: number;
  physical: number;
  moral: number;
  hygiene: number;
  handcraft: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  sortOrder: number;
  isActive: boolean;
}

export interface ChildItem {
  id: string;
  childId: string;
  itemId: string;
  nickname: string | null;
  isFavorite: boolean;
  acquiredAt: string;
}

export interface PurchaseRecord {
  id: string;
  childId: string;
  itemId: string;
  cost: number;
  purchasedAt: string;
}
