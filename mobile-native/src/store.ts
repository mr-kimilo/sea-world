import { create } from "zustand";
import type { FamilyInfo, ChildInfo } from "./api";

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

// Family/Child context store
type FamilyStore = {
  families: FamilyInfo[];
  selectedFamilyId: string | null;
  children: Record<string, ChildInfo[]>; // familyId → children
  selectedChildId: string | null;
  setFamilies: (families: FamilyInfo[]) => void;
  selectFamily: (id: string) => void;
  setChildren: (familyId: string, children: ChildInfo[]) => void;
  selectChild: (id: string) => void;
};

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  families: [],
  selectedFamilyId: localStorage.getItem("selectedFamilyId"),
  children: {},
  selectedChildId: localStorage.getItem("selectedChildId"),
  setFamilies: (families) => {
    const current = get().selectedFamilyId;
    if (families.length > 0 && !current) {
      const fid = families[0].id;
      localStorage.setItem("selectedFamilyId", fid);
      set({ families, selectedFamilyId: fid });
    } else {
      set({ families });
    }
  },
  selectFamily: (id) => {
    localStorage.setItem("selectedFamilyId", id);
    set({ selectedFamilyId: id });
  },
  setChildren: (familyId, children) => {
    const current = get().selectedChildId;
    if (children.length > 0 && !current) {
      localStorage.setItem("selectedChildId", children[0].id);
    }
    set((s) => ({ children: { ...s.children, [familyId]: children } }));
  },
  selectChild: (id) => {
    localStorage.setItem("selectedChildId", id);
    set({ selectedChildId: id });
  },
}));
