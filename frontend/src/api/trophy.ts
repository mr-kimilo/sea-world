import api from './client';
import type { ApiResponse } from '../types';

export interface TrophyResponse {
  id: string;
  childId: string;
  taskId: string | null;
  name: string;
  points: number;
  icon: string;
  earnedAt: string;
}

export const trophyApi = {
  // 获取孩子的奖杯列表
  getTrophies: (childId: string) =>
    api.get<ApiResponse<TrophyResponse[]>>(`/children/${childId}/trophies`),

  // 获取孩子的 Top3 奖杯
  getTop3: (childId: string) =>
    api.get<ApiResponse<TrophyResponse[]>>(`/children/${childId}/trophies/top3`),
};
