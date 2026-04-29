import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { useDeviceType } from '../../hooks/useDeviceType';
import ChildSelector from '../../components/ChildSelector';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import MobileSidebar from '../../components/MobileSidebar';
import PokerChildSelector from '../../components/PokerChildSelector';
import ItemList from './components/ItemList';
import PendingOrders from './components/PendingOrders';
import CompletedOrders from './components/CompletedOrders';
import { Button } from '../../components/ui/button';
import './Shop.css';
import './Shop.mobile.css';

type TabType = 'items' | 'pending' | 'completed';

export default function Shop() {
  const { t } = useTranslation(['shop', 'common', 'home']);
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { selectedChild } = useFamilyStore();
  const { isMobile } = useDeviceType();
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDataChanged = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shop-page">
      <header className="shop-header">
        {isMobile ? (
          <>
            <div className="header-left">
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
              <h1>🐠 {t('common:appName')}</h1>
              <p className="header-slogan">{t('home:slogan')}</p>
            </div>
            <div className="header-right">
              <LanguageSwitcher />
              <Button type="button" className="logout-btn" onClick={handleLogout} variant="ghost">
                {t('common:logout')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="shop-header-left">
              <div className="shop-header-title">
                <h1 className="shop-title">{t('shop:title')}</h1>
                {selectedChild && (
                  <p className="shop-subtitle">
                    {t('shop:buyFor', { name: selectedChild.nickname || selectedChild.name })}
                  </p>
                )}
              </div>

              <div className="shop-header-tabs" role="navigation" aria-label={t('shop:title')}>
                <button
                  className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
                  onClick={() => setActiveTab('items')}
                  type="button"
                  aria-label={t('items')}
                  title={t('items')}
                >
                  <span className="tab-icon">🎁</span>
                </button>
                <button
                  className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pending')}
                  type="button"
                  aria-label={t('pendingOrders')}
                  title={t('pendingOrders')}
                >
                  <span className="tab-icon">⏳</span>
                </button>
                <button
                  className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                  type="button"
                  aria-label={t('completedOrders')}
                  title={t('completedOrders')}
                >
                  <span className="tab-icon">✅</span>
                </button>
              </div>
            </div>

            <div className="shop-header-right">
              <LanguageSwitcher />
              <Button className="shop-logout-btn" onClick={handleLogout} type="button" variant="ghost">
                {t('common:logout')}
              </Button>
            </div>
          </>
        )}
      </header>
      {isMobile && <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      {/* On web: show ChildSelector below tabs */}
      {!isMobile && (
        <div className="below-tabs-child-selector">
          <ChildSelector layout="carousel" />
        </div>
      )}

      {isMobile && (
        <div className="mobile-child-selector-section" aria-label={t('family:childrenList')}>
          <PokerChildSelector />
        </div>
      )}

      <div className="shop-content">
        {/* Mobile: tabs moved out of header (ui.md task #11) */}
        {isMobile && (
          <nav className="shop-mobile-tabs" aria-label={t('shop:title')}>
            <button
              className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
              type="button"
              aria-label={t('items')}
              title={t('items')}
            >
              <span className="tab-icon">🎁</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
              type="button"
              aria-label={t('pendingOrders')}
              title={t('pendingOrders')}
            >
              <span className="tab-icon">⏳</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
              type="button"
              aria-label={t('completedOrders')}
              title={t('completedOrders')}
            >
              <span className="tab-icon">✅</span>
            </button>
          </nav>
        )}
        {activeTab === 'items' ? (
          <ItemList 
            key={`items-${refreshKey}`}
            selectedChild={selectedChild} 
            onOrderCreated={handleDataChanged}
          />
        ) : activeTab === 'pending' ? (
          <PendingOrders 
            key={`pending-${refreshKey}`}
            selectedChild={selectedChild}
            onOrderChanged={handleDataChanged}
          />
        ) : (
          <CompletedOrders 
            key={`completed-${refreshKey}`}
            selectedChild={selectedChild}
          />
        )}
      </div>
    </div>
  );
}
