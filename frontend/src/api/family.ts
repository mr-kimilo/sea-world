import api from './client';
import type { ApiResponse } from '../types';

export interface CreateFamilyRequest {
  name: string;
  description?: string;
}

export interface FamilyResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface ChildRequest {
  name: string;
  nickname?: string;
  birthDate?: string;
  avatarUrl?: string;
}

export interface ChildResponse {
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

export const familyApi = {
  // 创建家庭
  createFamily: (data: CreateFamilyRequest) =>
    api.post<ApiResponse<FamilyResponse>>('/families', data),

  // 获取我的家庭列表
  getMyFamilies: () =>
    api.get<ApiResponse<FamilyResponse[]>>('/families/mine'),

  // 添加孩子
  addChild: (familyId: string, data: ChildRequest) =>
    api.post<ApiResponse<ChildResponse>>(`/families/${familyId}/children`, data),

  // 获取孩子列表
  getChildren: (familyId: string) =>
    api.get<ApiResponse<ChildResponse[]>>(`/families/${familyId}/children`),

  // 更新孩子信息
  updateChild: (familyId: string, childId: string, data: ChildRequest) =>
    api.put<ApiResponse<ChildResponse>>(`/families/${familyId}/children/${childId}`, data),

  // 删除孩子
  deleteChild: (familyId: string, childId: string) =>
    api.delete<ApiResponse<void>>(`/families/${familyId}/children/${childId}`),

  // 更新家庭信息
  updateFamily: (familyId: string, data: { name: string }) =>
    api.put<ApiResponse<FamilyResponse>>(`/families/${familyId}`, data),
};
