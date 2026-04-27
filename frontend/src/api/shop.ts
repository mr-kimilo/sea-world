import api from './client';

// ============ Types ============

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  rarity: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductDetail extends ShopItem {
  isActive: boolean;
  allowedChildIds: string[];  // 空数组 = 所有孩子可买
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  rarity: string;
  sortOrder: number;
  allowedChildIds?: string[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  rarity?: string;
  sortOrder?: number;
  isActive?: boolean;
  allowedChildIds?: string[];
}

export interface Order {
  id: string;
  childId: string;
  itemId: string;
  itemName: string;
  itemImageUrl: string | null;
  cost: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  purchasedAt: string;
  completedAt: string | null;
}

// 操作订单后返回的结果（包含更新后的孩子积分）
export interface OrderOperationResult extends Order {
  updatedChildScore?: {
    available: number;
    total: number;
  };
}

export interface CreateOrderRequest {
  itemId: string;
}

// ============ User APIs ============

/**
 * 获取所有激活的商品列表
 */
export async function getShopItems(): Promise<ShopItem[]> {
  const response = await api.get<ApiResponse<ShopItem[]>>('/shop/items');
  return response.data.data;
}

/**
 * 获取某孩子可购买的商品列表（过滤限制）
 */
export async function getAvailableItems(childId: string): Promise<ShopItem[]> {
  const response = await api.get<ApiResponse<ShopItem[]>>(`/shop/children/${childId}/available-items`);
  return response.data.data;
}

/**
 * 创建订单（下单暂扣积分）
 */
export async function createOrder(childId: string, request: CreateOrderRequest): Promise<OrderOperationResult> {
  const response = await api.post<ApiResponse<OrderOperationResult>>(`/shop/children/${childId}/orders`, request);
  return response.data.data;
}

/**
 * 确认订单（真实扣除积分，添加到收藏）
 */
export async function confirmOrder(childId: string, orderId: string): Promise<OrderOperationResult> {
  const response = await api.post<ApiResponse<OrderOperationResult>>(`/shop/children/${childId}/orders/${orderId}/confirm`);
  return response.data.data;
}

/**
 * 取消订单（返还积分）
 */
export async function cancelOrder(childId: string, orderId: string): Promise<OrderOperationResult> {
  const response = await api.post<ApiResponse<OrderOperationResult>>(`/shop/children/${childId}/orders/${orderId}/cancel`);
  return response.data.data;
}

/**
 * 获取某孩子的所有订单
 */
export async function getOrders(childId: string): Promise<Order[]> {
  const response = await api.get<ApiResponse<Order[]>>(`/shop/children/${childId}/orders`);
  return response.data.data;
}

/**
 * 获取某孩子的待确认订单
 */
export async function getPendingOrders(childId: string): Promise<Order[]> {
  const response = await api.get<ApiResponse<Order[]>>(`/shop/children/${childId}/orders/pending`);
  return response.data.data;
}

/**
 * 获取某孩子的已完成订单
 */
export async function getCompletedOrders(childId: string): Promise<Order[]> {
  const response = await api.get<ApiResponse<Order[]>>(`/shop/children/${childId}/orders/completed`);
  return response.data.data;
}

// ============ Admin APIs ============

/**
 * 创建商品（管理员）
 */
export async function createProduct(request: CreateProductRequest): Promise<ProductDetail> {
  const response = await api.post<ApiResponse<ProductDetail>>('/admin/products', request);
  return response.data.data;
}

/**
 * 更新商品（管理员）
 */
export async function updateProduct(productId: string, request: UpdateProductRequest): Promise<ProductDetail> {
  const response = await api.put<ApiResponse<ProductDetail>>(`/admin/products/${productId}`, request);
  return response.data.data;
}

/**
 * 删除商品（管理员）
 */
export async function deleteProduct(productId: string): Promise<void> {
  await api.delete(`/admin/products/${productId}`);
}

/**
 * 获取商品详情（管理员）
 */
export async function getProductDetail(productId: string): Promise<ProductDetail> {
  const response = await api.get<ApiResponse<ProductDetail>>(`/admin/products/${productId}`);
  return response.data.data;
}

/**
 * 获取所有商品（包括已禁用的，管理员）
 */
export async function getAllProducts(): Promise<ShopItem[]> {
  const response = await api.get<ApiResponse<ShopItem[]>>('/admin/products');
  return response.data.data;
}
