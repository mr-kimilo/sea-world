import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useFamilyStore } from '../../store/familyStore';
import { useAuthStore } from '../../store/authStore';
import { useDeviceType } from '../../hooks/useDeviceType';
import ChildSelector from '../../components/ChildSelector';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import MobileSidebar from '../../components/MobileSidebar';
import { Button } from '../../components/ui/button';
import PendingOrders from '../Shop/components/PendingOrders';
import CompletedOrders from '../Shop/components/CompletedOrders';

import './Orders.css';
import './Orders.mobile.css';

type OrdersStatusFilter = 'all' | 'pending' | 'completed';

export default function Orders() {
  const { t } = useTranslation(['shop', 'common', 'home']);
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { isMobile } = useDeviceType();
  const { selectedChild } = useFamilyStore();
  const [status, setStatus] = useState<OrdersStatusFilter>('pending');
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div className="header-left">
          {isMobile && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="mob-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label={t('common:menu')}
            >
              <span aria-hidden="true">≡</span>
            </Button>
          )}
          <h1>🐠 {t('common:appName')}</h1>
          <p className="header-slogan">{t('home:slogan')}</p>
        </div>
        <div className="header-right">
          <LanguageSwitcher />
          <Button onClick={handleLogout} className="logout-btn" type="button" variant="ghost">
            {t('common:logout')}
          </Button>
        </div>
      </header>
      {isMobile && <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      <div className="orders-child-selector">
        <ChildSelector layout="carousel" />
      </div>

      <div className="orders-filters" aria-label={t('shop:title')}>
        <label className="orders-filter-label" htmlFor="orders-status">
          {t('shop:order.status')}
        </label>
        <select
          id="orders-status"
          className="orders-filter-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrdersStatusFilter)}
        >
          <option value="pending">⏳ {t('pendingOrders')}</option>
          <option value="completed">✅ {t('completedOrders')}</option>
          <option value="all">🧾 {t('shop:order.all')}</option>
        </select>
      </div>

      <div className="orders-content">
        {(status === 'pending' || status === 'all') && (
          <PendingOrders
            key={`pending-${refreshKey}`}
            selectedChild={selectedChild}
            onOrderChanged={() => setRefreshKey((k) => k + 1)}
          />
        )}
        {(status === 'completed' || status === 'all') && (
          <CompletedOrders key={`completed-${refreshKey}`} selectedChild={selectedChild} />
        )}
      </div>
    </div>
  );
}

