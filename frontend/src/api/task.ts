import api from './client';
import type { ApiResponse } from '../types';

export interface TaskTemplateResponse {
  id: string;
  grade: string;
  name: string;
  description: string | null;
  points: number;
  icon: string;
  trophyName: string | null;
  dimension: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface ChildTaskRequest {
  name: string;
  description?: string;
  points: number;
  icon?: string;
  trophyName?: string;
  dimension?: string;
  childId?: string;
}

export interface ChildTaskResponse {
  id: string;
  childId: string;
  familyId: string;
  createdBy: string;
  name: string;
  description: string | null;
  points: number;
  icon: string;
  trophyName: string | null;
  dimension: string | null;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const taskApi = {
  // 获取任务模板（可按年级筛选）
  getTemplates: (grade?: string) =>
    api.get<ApiResponse<TaskTemplateResponse[]>>('/task-templates', {
      params: grade ? { grade } : {},
    }),

  // 获取孩子的任务列表
  getChildTasks: (childId: string) =>
    api.get<ApiResponse<ChildTaskResponse[]>>(`/children/${childId}/tasks`),

  // 获取家庭的任务列表
  getFamilyTasks: (familyId: string) =>
    api.get<ApiResponse<ChildTaskResponse[]>>(`/families/${familyId}/tasks`),

  // 创建任务
  createTask: (familyId: string, data: ChildTaskRequest) =>
    api.post<ApiResponse<ChildTaskResponse>>(`/families/${familyId}/tasks`, data),

  // 更新任务
  updateTask: (taskId: string, data: ChildTaskRequest) =>
    api.put<ApiResponse<ChildTaskResponse>>(`/tasks/${taskId}`, data),

  // 删除任务
  deleteTask: (taskId: string) =>
    api.delete<ApiResponse<void>>(`/tasks/${taskId}`),

  // 完成任务
  completeTask: (taskId: string) =>
    api.post<ApiResponse<{ id: string; name: string; points: number; icon: string; earnedAt: string }>>(`/tasks/${taskId}/complete`),

  // 取消任务
  cancelTask: (taskId: string) =>
    api.post<ApiResponse<ChildTaskResponse>>(`/tasks/${taskId}/cancel`),
};
