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

// ——— Points API ———
export const pointsApi = {
  list: () => api.get("/points"),
  add: (childId: number, amount: number, reason: string) =>
    api.post("/points", { childId, amount, reason }),
};

// ——— Tasks API ———
export const tasksApi = {
  list: () => api.get("/tasks"),
  complete: (taskId: number) => api.post(`/tasks/${taskId}/complete`),
};

// ——— Rewards API ———
export const rewardsApi = {
  list: () => api.get("/rewards"),
  redeem: (rewardId: number) => api.post(`/rewards/${rewardId}/redeem`),
};

export default api;
