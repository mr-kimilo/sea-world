import axios from "axios";

const API_BASE = "http://192.168.31.168:8080/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截器：自动带 token + 日志
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] ➡ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || "");
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (res) => {
    console.log(`[API] ✅ ${res.status} ${res.config.method?.toUpperCase()} ${res.config.baseURL}${res.config.url}`);
    // 后端统一包装 ApiResponse { data, message }
    if (res.data && typeof res.data === "object" && "data" in res.data) {
      return { ...res, data: res.data.data };
    }
    return res;
  },
  (err) => {
    console.warn(`[API] ❌ ${err.response?.status || "NETWORK"} ${err.config?.method?.toUpperCase()} ${err.config?.baseURL}${err.config?.url}`, err.message);
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.hash = "#/login";
    }
    return Promise.reject(err);
  }
);

// ——— Auth API ———
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  register: (email: string, password: string) =>
    api.post("/auth/register", { email, password }),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    api.post("/auth/reset-password", { email, code, newPassword }),
};

// ——— Family API ———
export type FamilyInfo = { id: string; name: string; createdAt: string };
export type ChildInfo = { id: string; name: string; avatar?: string; avatarUrl?: string; familyId: string; totalScore?: number; availableScore?: number };

// normalize backend avatarUrl -> avatar
const normChild = (c: any): ChildInfo => ({ ...c, avatar: c.avatar || c.avatarUrl });
const normChildren = (arr: any[]): ChildInfo[] => (arr ?? []).map(normChild);

export const familyApi = {
  mine: () => api.get("/families/mine"),
  create: (name: string) => api.post("/families", { name }),
  children: (familyId: string) =>
    api.get(`/families/${familyId}/children`).then(res => ({ ...res, data: normChildren(res.data) })),
  addChild: (familyId: string, name: string) =>
    api.post(`/families/${familyId}/children`, { name }).then(res => ({ ...res, data: res.data ? normChild(res.data) : res.data })),
  updateChild: (familyId: string, childId: string, data: { name?: string; avatar?: string; birthDate?: string }) => {
    // Map avatar -> avatarUrl to match backend ChildRequest.avatarUrl
    const payload: any = { ...data };
    if (data.avatar !== undefined) { payload.avatarUrl = data.avatar; delete payload.avatar; }
    return api.put(`/families/${familyId}/children/${childId}`, payload).then(res => ({ ...res, data: res.data ? normChild(res.data) : res.data }));
  },
  deleteChild: (familyId: string, childId: string) =>
    api.delete(`/families/${familyId}/children/${childId}`),
};

// ——— Custom Category API ———
export const categoryApi = {
  list: () => api.get("/custom-categories"),
  create: (name: string, icon: string) => api.post("/custom-categories", { name, icon }),
  remove: (id: string) => api.delete(`/custom-categories/${id}`),
};

// ——— Score API ———
export const scoreApi = {
  list: (familyId: string, childId: string, page = 0, size = 100) =>
    api.get(`/families/${familyId}/children/${childId}/scores`, { params: { page, size } }),
  add: (familyId: string, childId: string, category: string, amount: number, description: string) =>
    api.post(`/families/${familyId}/children/${childId}/scores`, { category, score: amount, reason: description }),
};

// ——— Shop API ———
export const shopApi = {
  items: () => api.get("/shop/items"),
  redeem: (childId: string, itemId: string) =>
    api.post(`/shop/children/${childId}/orders`, { itemId }),
};

// ——— Order API ———
export const orderApi = {
  list: (childId: string) => api.get(`/shop/children/${childId}/orders`),
  pending: (childId: string) => api.get(`/shop/children/${childId}/orders/pending`),
  completed: (childId: string) => api.get(`/shop/children/${childId}/orders/completed`),
  confirm: (childId: string, orderId: string) =>
    api.post(`/shop/children/${childId}/orders/${orderId}/confirm`),
  cancel: (childId: string, orderId: string) =>
    api.post(`/shop/children/${childId}/orders/${orderId}/cancel`),
};

// ——— Product Admin API ———
export const productApi = {
  list: () => api.get("/admin/products"),
  detail: (id: string) => api.get(`/admin/products/${id}`),
  create: (data: { name: string; description?: string; imageUrl?: string; price: number; rarity?: string; sortOrder?: number; allowedChildIds?: string[] }) =>
    api.post("/admin/products", { ...data, rarity: data.rarity || "common", sortOrder: data.sortOrder || 0 }),
  update: (id: string, data: { name?: string; description?: string; imageUrl?: string; price?: number; rarity?: string; sortOrder?: number; isActive?: boolean; allowedChildIds?: string[] }) =>
    api.put(`/admin/products/${id}`, data),
  remove: (id: string) => api.delete(`/admin/products/${id}`),
};

export default api;
