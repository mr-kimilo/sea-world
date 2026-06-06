import axios from "axios";

const API_BASE = "http://127.0.0.1:8080/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截器：自动带 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (res) => {
    // 后端统一包装 ApiResponse { data, message }
    if (res.data && typeof res.data === "object" && "data" in res.data) {
      return { ...res, data: res.data.data };
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
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

// ——— Score API ———
export const scoreApi = {
  list: (familyId: string, childId: string) =>
    api.get(`/families/${familyId}/children/${childId}/scores`),
  add: (familyId: string, childId: string, category: string, amount: number, description: string) =>
    api.post(`/families/${familyId}/children/${childId}/scores`, { category, amount, description }),
};

// ——— Shop API ———
export const shopApi = {
  items: () => api.get("/shop/items"),
  redeem: (childId: string, itemId: number) =>
    api.post(`/shop/children/${childId}/orders`, { items: [{ productId: itemId, quantity: 1 }] }),
};

export default api;
