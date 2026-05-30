import api from './client';
import type { ApiResponse } from '../types';

export interface ValueItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  icon: string;
  category: string;
}

export interface ValueCalculateResult {
  tooExpensive: boolean;
  name: string;
  price: number;
  unit: string;
  icon: string;
  amount: number;
  count: number;
  remainder: number;
  voiceText: string;
  useStack: boolean;
}

export async function fetchCategories(): Promise<string[]> {
  const res = await api.get<ApiResponse<{ categories: string[] }>>('/value/categories');
  return res.data.data?.categories ?? [];
}

export async function fetchItems(category?: string, age = 5): Promise<ValueItem[]> {
  const params: Record<string, string> = { age: String(age) };
  if (category) params.category = category;
  const res = await api.get<ApiResponse<ValueItem[]>>('/value/items', { params });
  return res.data.data ?? [];
}

export async function calculateValue(amount: number, itemId: string): Promise<ValueCalculateResult> {
  const res = await api.get<ApiResponse<ValueCalculateResult>>('/value/calculate', {
    params: { amount, itemId },
  });
  if (!res.data.data) throw new Error('Calculate failed');
  return res.data.data;
}
