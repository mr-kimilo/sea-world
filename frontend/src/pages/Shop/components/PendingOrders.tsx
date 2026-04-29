import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { getPendingOrders, confirmOrder, cancelOrder, Order } from '../../../api/shop';
import { Child } from '../../../types';
import { useConfirm } from '../../../hooks/useConfirm';
import { useFamilyStore } from '../../../store/familyStore';
import { Button } from '../../../components/ui/button';

interface PendingOrdersProps {
  selectedChild: Child | null;
  onOrderChanged?: () => void;
}

export default function PendingOrders({ selectedChild, onOrderChanged }: PendingOrdersProps) {
  const { t } = useTranslation('shop');
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { updateChildScore } = useFamilyStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);

  const loadOrders = async () => {
    if (!selectedChild) return;
    setLoading(true);
    try {
      const data = await getPendingOrders(selectedChild.id);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load pending orders:', error);
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

  const handleConfirm = async (order: Order) => {
    if (!selectedChild) return;
    
    const confirmed = await confirm({
      title: t('confirmDialog.title'),
      message: t('confirmDialog.message', { itemName: order.itemName }) + '\n' +
               t('confirmDialog.hint', { price: order.cost }),
      type: 'warning',
      confirmText: t('confirmDialog.confirm'),
      cancelText: t('confirmDialog.cancel')
    });
    
    if (!confirmed) return;

    try {
      const result = await confirmOrder(selectedChild.id, order.id);
      
      // 更新孩子积分显示（使用后端返回的最新积分）
      if (result.updatedChildScore) {
        updateChildScore(selectedChild.id, result.updatedChildScore.total, result.updatedChildScore.available);
      }
      
      await confirm({
        title: t('admin.messages.success'),
        message: t('messages.confirmSuccess'),
        type: 'success',
        confirmText: t('common:confirm')
      });
      loadOrders();
      onOrderChanged?.();
    } catch (error: unknown) {
      console.error('Failed to confirm order:', error);
      const maybeData = axios.isAxiosError(error) ? error.response?.data : null;
      const message =
        typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
          ? String((maybeData as { message?: unknown }).message ?? '')
          : '';
      await confirm({
        title: t('admin.messages.error'),
        message: t('messages.confirmError') + ': ' + (message || t('common:error')),
        type: 'danger',
        confirmText: t('common:confirm')
      });
    }
  };

  const handleCancel = async (order: Order) => {
    if (!selectedChild) return;
    
    const confirmed = await confirm({
      title: t('cancelDialog.title'),
      message: t('cancelDialog.message') + '\n' +
               t('cancelDialog.hint', { price: order.cost }),
      type: 'warning',
      confirmText: t('cancelDialog.confirm'),
      cancelText: t('cancelDialog.cancel')
    });
    
    if (!confirmed) return;

    try {
      const result = await cancelOrder(selectedChild.id, order.id);
      
      // 更新孩子积分显示（返还积分）
      if (result.updatedChildScore) {
        updateChildScore(selectedChild.id, result.updatedChildScore.total, result.updatedChildScore.available);
      }
      
      await confirm({
        title: t('admin.messages.success'),
        message: t('messages.cancelSuccess'),
        type: 'success',
        confirmText: t('common:confirm')
      });
      loadOrders();
      onOrderChanged?.();
    } catch (error: unknown) {
      console.error('Failed to cancel order:', error);
      const maybeData = axios.isAxiosError(error) ? error.response?.data : null;
      const message =
        typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
          ? String((maybeData as { message?: unknown }).message ?? '')
          : '';
      await confirm({
        title: t('admin.messages.error'),
        message: t('messages.cancelError') + ': ' + (message || t('common:error')),
        type: 'danger',
        confirmText: t('common:confirm')
      });
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedChild]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">⏳</span>
        <p className="empty-text">{t('noPendingOrders')}</p>
      </div>
    );
  }

  const displayedOrders = orders.slice(0, displayCount);
  const hasMore = displayCount < orders.length;

  return (
    <>
      <div className="orders-list">
      {displayedOrders.map(order => (
        <div key={order.id} className="order-card pending">
          <div className="order-info">
            {order.itemImageUrl ? (
              <img src={order.itemImageUrl} alt={order.itemName} className="order-image" />
            ) : (
              <div className="order-image-placeholder">🎁</div>
            )}
            <div className="order-details">
              <h3 className="order-title">{order.itemName}</h3>
              <p className="order-meta">
                <span className="meta-icon">⭐</span>
                {t('order.cost')}: <strong>{order.cost}</strong>
              </p>
              <p className="order-meta">
                <span className="meta-icon">📅</span>
                {new Date(order.purchasedAt).toLocaleString('zh-CN')}
              </p>
              <span className="order-status status-pending">
                ⏳ {t('order.pending')}
              </span>
            </div>
          </div>
          <div className="order-actions">
            <Button
              className="btn-action btn-confirm"
              onClick={() => handleConfirm(order)}
              type="button"
              size="sm"
            >
              ✅ {t('order.confirm')}
            </Button>
            <Button
              className="btn-action btn-cancel"
              onClick={() => handleCancel(order)}
              type="button"
              variant="outline"
              size="sm"
            >
              ❌ {t('order.cancel')}
            </Button>
          </div>
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
            {t('loadMore')} ({orders.length - displayCount} {t('remaining')})
          </Button>
        </div>
      )}
      {ConfirmDialogComponent}
    </>
  );
}
