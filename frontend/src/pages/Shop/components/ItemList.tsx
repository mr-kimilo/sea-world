import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { getAvailableItems, createOrder, ShopItem } from '../../../api/shop';
import { Child } from '../../../types';
import { useConfirm } from '../../../hooks/useConfirm';
import { useFamilyStore } from '../../../store/familyStore';
import { Button } from '../../../components/ui/button';

interface ItemListProps {
  selectedChild: Child | null;
  onOrderCreated?: () => void;
}

export default function ItemList({ selectedChild, onOrderCreated }: ItemListProps) {
  const { t } = useTranslation('shop');
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { updateChildScore } = useFamilyStore();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);

  const loadItems = async () => {
    if (!selectedChild) return;
    setLoading(true);
    try {
      const data = await getAvailableItems(selectedChild.id);
      setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
      await confirm({
        title: t('admin.messages.error'),
        message: t('messages.loadError'),
        type: 'danger',
        confirmText: t('common:confirm')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (item: ShopItem) => {
    console.log('🛒 [ItemList] handleBuy 开始', {
      selectedChild: selectedChild ? {
        id: selectedChild.id,
        name: selectedChild.name,
        availableScore: selectedChild.availableScore,
        totalScore: selectedChild.totalScore
      } : null,
      item: {
        id: item.id,
        name: item.name,
        price: item.price
      }
    });

    if (!selectedChild) {
      await confirm({
        title: t('buyDialog.title'),
        message: t('messages.selectChildFirst') || '请先选择孩子',
        type: 'warning',
        confirmText: t('common:confirm')
      });
      return;
    }
    
    const confirmed = await confirm({
      title: t('buyDialog.title'),
      message: t('buyDialog.message', { itemName: item.name }) + '\n' +
               t('buyDialog.hint', { price: item.price }),
      type: 'info',
      confirmText: t('buyDialog.confirm'),
      cancelText: t('buyDialog.cancel')
    });
    
    if (!confirmed) {
      console.log('🛒 [ItemList] 用户取消购买');
      return;
    }

    try {
      console.log('🛒 [ItemList] 准备调用 createOrder API', {
        childId: selectedChild.id,
        itemId: item.id
      });
      const result = await createOrder(selectedChild.id, { itemId: item.id });
      console.log('🛒 [ItemList] createOrder API 成功返回', result);
      
      // 更新孩子积分显示
      if (result.updatedChildScore) {
        console.log('🛒 [ItemList] 更新孩子积分', {
          childId: selectedChild.id,
          oldAvailableScore: selectedChild.availableScore,
          newAvailableScore: result.updatedChildScore.available
        });
        updateChildScore(selectedChild.id, result.updatedChildScore.total, result.updatedChildScore.available);
      } else {
        console.warn('⚠️ [ItemList] 后端未返回更新后的积分');
      }
      
      await confirm({
        title: t('admin.messages.success'),
        message: t('messages.buySuccess'),
        type: 'success',
        confirmText: t('common:confirm')
      });
      loadItems();
      onOrderCreated?.();
    } catch (error: unknown) {
      console.error('❌ [ItemList] 购买失败:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ [ItemList] 错误详情:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
      const maybeData = axios.isAxiosError(error) ? error.response?.data : null;
      const message =
        typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
          ? String((maybeData as { message?: unknown }).message ?? '')
          : '';
      await confirm({
        title: t('admin.messages.error'),
        message: t('messages.buyError') + ': ' + (message || t('common:error')),
        type: 'danger',
        confirmText: t('common:confirm')
      });
    }
  };

  useEffect(() => {
    loadItems();
  }, [selectedChild]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📦</span>
        <p className="empty-text">{t('noItems')}</p>
      </div>
    );
  }

  const displayedItems = items.slice(0, displayCount);
  const hasMore = displayCount < items.length;

  return (
    <>
      <div className="items-grid">
      {displayedItems.map(item => (
        <div key={item.id} className="shop-item-card">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="item-image" />
          ) : (
            <div className="item-image-placeholder">
              <span>🎁</span>
            </div>
          )}
          <div className="item-info">
            <h3 className="item-name">{item.name}</h3>
            {item.description && (
              <p className="item-description">{item.description}</p>
            )}
            <div className="item-price-row">
              <span className="item-price">
                <span className="price-icon">⭐</span>
                <span className="price-value">{item.price}</span>
              </span>
            </div>
          </div>
          <Button
            className="btn-buy"
            onClick={() => handleBuy(item)}
            disabled={!selectedChild}
            type="button"
            size="sm"
          >
            {selectedChild ? t('item.buy') : t('messages.selectChildFirst')}
          </Button>
        </div>
      ))}
      </div>
      {hasMore && (
        <div className="load-more-container">
          <Button
            className="btn-load-more"
            onClick={() => setDisplayCount((prev) => prev + 10)}
            type="button"
            variant="outline"
            size="sm"
          >
            {t('loadMore')} ({items.length - displayCount} {t('remaining')})
          </Button>
        </div>
      )}
      {ConfirmDialogComponent}
    </>
  );
}
