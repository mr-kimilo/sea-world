import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScoreCategory } from '../types';

export interface PendingScore {
  id: string; // 本地临时ID
  childId: string;
  familyId: string;
  score: number;
  category: ScoreCategory;
  customCategoryId?: string;
  reason: string;
  rawVoiceText?: string;
  createdAt: string; // ISO时间戳
}

interface OfflineState {
  isOnline: boolean;
  pendingScores: PendingScore[];

  setOnlineStatus: (status: boolean) => void;
  addPendingScore: (score: Omit<PendingScore, 'id' | 'createdAt'>) => void;
  removePendingScore: (id: string) => void;
  clearPendingScores: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOnline: navigator.onLine,
      pendingScores: [],

      setOnlineStatus: (status) => set({ isOnline: status }),

      addPendingScore: (score) =>
        set((state) => ({
          pendingScores: [
            ...state.pendingScores,
            {
              ...score,
              id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removePendingScore: (id) =>
        set((state) => ({
          pendingScores: state.pendingScores.filter((s) => s.id !== id),
        })),

      clearPendingScores: () => set({ pendingScores: [] }),
    }),
    {
      name: 'sea-world-offline',
    }
  )
);
