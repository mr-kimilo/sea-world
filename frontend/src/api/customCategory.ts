import client from './client';
import type { ApiResponse } from '../types';

export interface CustomCategoryResponse {
  id: string;
  familyId: string;
  name: string;
  icon: string;
  createdAt: string;
  scoreCount: number;
}

export interface CreateCustomCategoryRequest {
  name: string;
  icon: string;
}

export interface UpdateCustomCategoryRequest {
  name?: string;
  icon?: string;
}

/**
 * 自定义积分维度 API
 */
export const customCategoryApi = {
  /**
   * 获取当前用户家庭的所有自定义维度
   */
  getCategories: () =>
    client.get<ApiResponse<CustomCategoryResponse[]>>(
      `/custom-categories`
    ),

  /**
   * 创建自定义维度
   */
  createCategory: (data: CreateCustomCategoryRequest) =>
    client.post<ApiResponse<CustomCategoryResponse>>(
      `/custom-categories`,
      data
    ),

  /**
   * 更新自定义维度
   */
  updateCategory: (
    categoryId: string,
    data: UpdateCustomCategoryRequest
  ) =>
    client.put<ApiResponse<CustomCategoryResponse>>(
      `/custom-categories/${categoryId}`,
      data
    ),

  /**
   * 删除自定义维度
   */
  deleteCategory: (categoryId: string) =>
    client.delete<ApiResponse<void>>(
      `/custom-categories/${categoryId}`
    ),
};
