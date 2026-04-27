import api from './client';
import type { ApiResponse, ScoreCategory, ScoreSummary } from '../types';

export interface ScoreRequest {
  score: number;
  category: ScoreCategory;
  customCategoryId?: string;
  reason: string;
  rawVoiceText?: string;
}

export interface ScoreResponse {
  id: string;
  childId: string;
  operatorId: string;
  score: number;
  category: string;
  customCategoryId?: string | null;
  customCategoryName?: string | null;
  customCategoryIcon?: string | null;
  reason: string;
  rawVoiceText: string | null;
  recordDate: string;
  createdAt: string;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const scoreApi = {
  // 添加积分记录
  addScore: (familyId: string, childId: string, data: ScoreRequest) =>
    api.post<ApiResponse<ScoreResponse>>(
      `/families/${familyId}/children/${childId}/scores`,
      data
    ),

  // 获取积分历史（分页）
  getHistory: (
    familyId: string,
    childId: string,
    params: {
      page ?: number;
      size ?: number;
      category ?: string;
      period ?: string;
    }
  ) =>
    api.get<ApiResponse<PageResult<ScoreResponse>>>(
      `/families/${familyId}/children/${childId}/scores`,
      { params }
    ),

  // 获取积分汇总（雷达图数据）
  getCategorySummary: (familyId: string, childId: string, period?: string) =>
    api.get<ApiResponse<ScoreSummary>>(
      `/families/${familyId}/children/${childId}/scores/summary`,
      { params: { period } }
    ),

  // 删除积分记录
  deleteScore: (familyId: string, childId: string, scoreId: string) =>
    api.delete<ApiResponse<void>>(
      `/families/${familyId}/children/${childId}/scores/${scoreId}`
    ),
};
