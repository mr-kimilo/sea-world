import { useEffect } from 'react';
import { useOfflineStore } from '../store/offlineStore';
import { useFamilyStore } from '../store/familyStore';
import { scoreApi } from '../api/score';

/**
 * 离线同步 Hook
 * 监听网络状态，自动同步本地缓存的积分记录
 */
export function useOfflineSync() {
  const { pendingScores, removePendingScore, setOnlineStatus, isOnline } = useOfflineStore();
  const { updateChildScore } = useFamilyStore();

  useEffect(() => {
    // 监听网络状态变化
    const handleOnline = () => {
      console.log('[OfflineSync] Network online');
      setOnlineStatus(true);
      syncPendingScores();
    };

    const handleOffline = () => {
      console.log('[OfflineSync] Network offline');
      setOnlineStatus(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始化时检查网络状态
    setOnlineStatus(navigator.onLine);

    // 如果有待同步数据且当前在线，立即同步
    if (navigator.onLine && pendingScores.length > 0) {
      syncPendingScores();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingScores = async () => {
    if (pendingScores.length === 0) return;

    console.log(`[OfflineSync] Syncing ${pendingScores.length} pending scores...`);

    for (const pending of pendingScores) {
      try {
        const res = await scoreApi.addScore(pending.familyId, pending.childId, {
          score: pending.score,
          category: pending.category,
          reason: pending.reason,
          rawVoiceText: pending.rawVoiceText,
        });

        if (res.data.success && res.data.data) {
          console.log(`[OfflineSync] Synced score: ${pending.id}`);
          
          // 同步成功，从待同步列表中移除
          removePendingScore(pending.id);
        } else {
          console.error(`[OfflineSync] Failed to sync score ${pending.id}:`, res.data.message);
        }
      } catch (err: any) {
        console.error(`[OfflineSync] Error syncing score ${pending.id}:`, err);
        
        // 如果是网络错误，停止同步等待下次在线
        if (!navigator.onLine) {
          console.log('[OfflineSync] Network offline, stopping sync');
          break;
        }
      }
    }

    if (pendingScores.length === 0) {
      console.log('[OfflineSync] All scores synced successfully');
    }
  };

  return {
    isOnline,
    pendingCount: pendingScores.length,
    syncPendingScores,
  };
}
