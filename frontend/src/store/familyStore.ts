import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChildResponse, FamilyResponse } from '../api/family';

interface FamilyState {
  families: FamilyResponse[];
  currentFamily: FamilyResponse | null;
  children: ChildResponse[];
  selectedChild: ChildResponse | null;

  setFamilies: (families: FamilyResponse[]) => void;
  setCurrentFamily: (family: FamilyResponse | null) => void;
  setChildren: (children: ChildResponse[]) => void;
  setSelectedChild: (child: ChildResponse | null) => void;
  updateChildScore: (childId: string, totalScore: number, availableScore: number) => void;
  clear: () => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set) => ({
      families: [],
      currentFamily: null,
      children: [],
      selectedChild: null,

      setFamilies: (families) => set({ families }),

      setCurrentFamily: (family) => set({ currentFamily: family }),

      setChildren: (children) => {
        set({ children });
        // 如果有子女且没有选中的，自动选中第一个
        set((state) => {
          if (children.length > 0 && !state.selectedChild) {
            return { selectedChild: children[0] };
          }
          // 如果当前选中的子女不在新列表中，清除选中状态
          if (state.selectedChild && !children.find((c) => c.id === state.selectedChild?.id)) {
            return { selectedChild: null };
          }
          return {};
        });
      },

      setSelectedChild: (child) => set({ selectedChild: child }),

      updateChildScore: (childId, totalScore, availableScore) => {
        console.log('📦 [FamilyStore] updateChildScore 被调用', { childId, totalScore, availableScore });
        set((state) => {
          console.log('📦 [FamilyStore] 当前 state', {
            childrenCount: state.children.length,
            selectedChildId: state.selectedChild?.id,
            children: state.children.map(c => ({ id: c.id, name: c.name, available: c.availableScore }))
          });

          // 更新 children 列表中的积分
          const updatedChildren = state.children.map((child) =>
            child.id === childId
              ? { ...child, totalScore, availableScore }
              : child
          );

          // 如果是当前选中的子女，同时更新selectedChild
          const updatedSelectedChild =
            state.selectedChild?.id === childId
              ? { ...state.selectedChild, totalScore, availableScore }
              : state.selectedChild;

          console.log('📦 [FamilyStore] 更新后的值', {
            updatedChildren: updatedChildren.map(c => ({ id: c.id, name: c.name, available: c.availableScore })),
            updatedSelectedChild: updatedSelectedChild ? {
              id: updatedSelectedChild.id,
              name: updatedSelectedChild.name,
              available: updatedSelectedChild.availableScore
            } : null
          });

          return {
            children: updatedChildren,
            selectedChild: updatedSelectedChild,
          };
        });
      },

      clear: () =>
        set({
          families: [],
          currentFamily: null,
          children: [],
          selectedChild: null,
        }),
    }),
    {
      name: 'sea-world-family',
      partialize: (state) => ({
        currentFamily: state.currentFamily,
        selectedChild: state.selectedChild,
      }),
    }
  )
);
