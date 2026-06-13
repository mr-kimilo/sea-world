import api from './client';
import type { ApiResponse } from '../types';

export interface CreateFamilyRequest {
  name: string;
  description?: string;
}

export interface FamilyResponse {
  id: string;
  name: string;
  createdBy: string;
  shareCode: string | null;
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

export interface FamilyMemberResponse {
  id: string;
  familyId: string;
  userId: string;
  userEmail: string;
  role: string;
  status: string;
  joinedAt: string;
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

  // ─── Multi-Parent: Search / Join / Approve ───

  /** 通过分享码搜索家庭 */
  searchByShareCode: (code: string) =>
    api.get<ApiResponse<FamilyResponse>>('/families/search', { params: { code } }),

  /** 申请加入家庭 */
  requestJoin: (shareCode: string) =>
    api.post<ApiResponse<void>>('/families/join', { shareCode }),

  /** 同意加入申请 */
  approveJoin: (familyId: string, userId: string) =>
    api.post<ApiResponse<void>>(`/families/${familyId}/members/${userId}/approve`),

  /** 拒绝加入申请 */
  rejectJoin: (familyId: string, userId: string) =>
    api.post<ApiResponse<void>>(`/families/${familyId}/members/${userId}/reject`),

  /** 获取家庭成员列表 */
  getMembers: (familyId: string) =>
    api.get<ApiResponse<FamilyMemberResponse[]>>(`/families/${familyId}/members`),

  /** 获取待审批的加入请求 */
  getPendingRequests: (familyId: string) =>
    api.get<ApiResponse<FamilyMemberResponse[]>>(`/families/${familyId}/pending-requests`),
};
