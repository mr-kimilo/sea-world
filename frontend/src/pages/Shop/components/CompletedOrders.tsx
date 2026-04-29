import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCompletedOrders, Order } from '../../../api/shop';
import { Child } from '../../../types';
import { useConfirm } from '../../../hooks/useConfirm';
import { Button } from '../../../components/ui/button';

interface CompletedOrdersProps {
  selectedChild: Child | null;
}

export default function CompletedOrders({ selectedChild }: CompletedOrdersProps) {
  const { t } = useTranslation('shop');
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);

  const loadOrders = async () => {
    if (!selectedChild) return;
    setLoading(true);
    try {
      const data = await getCompletedOrders(selectedChild.id);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load completed orders:', error);
      await confirm({
        title: t('admin.messages.error'),
        message: t('messages.loadError'),
        type: 'danger',
        confirmText: t('common:confirm'),
      });
    } finally {
      setLoading(false);
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
        <span className="empty-icon">✅</span>
        <p className="empty-text">{t('noCompletedOrders')}</p>
      </div>
    );
  }

  const displayedOrders = orders.slice(0, displayCount);
  const hasMore = displayCount < orders.length;

  return (
    <>
      <div className="orders-list">
      {displayedOrders.map(order => (
        <div key={order.id} className="order-card completed">
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
                {order.completedAt && new Date(order.completedAt).toLocaleString('zh-CN')}
              </p>
              <span className="order-status status-completed">
                ✅ {t('order.completed')}
              </span>
            </div>
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
