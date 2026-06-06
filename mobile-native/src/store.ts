import { create } from "zustand";

type User = {
  id: number;
  email: string;
  name: string;
};

type AuthStore = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: localStorage.getItem("token"),
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
  isLoggedIn: () => !!get().token,
}));
