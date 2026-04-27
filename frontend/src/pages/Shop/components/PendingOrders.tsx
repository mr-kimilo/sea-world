import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPendingOrders, confirmOrder, cancelOrder, Order } from '../../../api/shop';
import { Child } from '../../../types';
import { useConfirm } from '../../../hooks/useConfirm';
import { useFamilyStore } from '../../../store/familyStore';

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
    } catch (error: any) {
      console.error('Failed to confirm order:', error);
      await confirm({
        title: t('admin.messages.error'),
        message: t('messages.confirmError') + ': ' + (error.response?.data?.message || error.message),
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
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      await confirm({
        title: t('admin.messages.error'),
        message: t('messages.cancelError') + ': ' + (error.response?.data?.message || error.message),
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
            <button 
              className="btn-action btn-confirm"
              onClick={() => handleConfirm(order)}
            >
              ✅ {t('order.confirm')}
            </button>
            <button 
              className="btn-action btn-cancel"
              onClick={() => handleCancel(order)}
            >
              ❌ {t('order.cancel')}
            </button>
          </div>
        </div>
      ))}
      </div>
      {hasMore && (
        <div className="load-more-container">
          <button className="btn-load-more" onClick={() => setDisplayCount(prev => prev + 10)}>
            {t('loadMore')} ({orders.length - displayCount} {t('remaining')})
          </button>
        </div>
      )}
      {ConfirmDialogComponent}
    </>
  );
}
