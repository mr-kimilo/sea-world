import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { useDeviceType } from '../../hooks/useDeviceType';
import ChildSelector from '../../components/ChildSelector';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import ProductManager from '../../components/ProductManager';
import ItemList from './components/ItemList';
import PendingOrders from './components/PendingOrders';
import CompletedOrders from './components/CompletedOrders';
import './Shop.css';
import './Shop.mobile.css';

type TabType = 'items' | 'pending' | 'completed' | 'admin';

export default function Shop() {
  const { t } = useTranslation(['shop', 'common', 'home']);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { selectedChild } = useFamilyStore();
  const { isMobile } = useDeviceType();
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [refreshKey, setRefreshKey] = useState(0);

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
              <h1>🐠 {t('common:appName')}</h1>
              <p className="header-slogan">{t('home:slogan')}</p>
            </div>
            <div className="header-right">
              <LanguageSwitcher />
              <button type="button" className="logout-btn" onClick={handleLogout}>
                {t('common:logout')}
              </button>
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
                >
                  <span className="tab-icon">🎁</span>
                  <span className="tab-label">{t('items')}</span>
                </button>
                <button
                  className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pending')}
                  type="button"
                >
                  <span className="tab-icon">⏳</span>
                  <span className="tab-label">{t('pendingOrders')}</span>
                </button>
                <button
                  className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                  type="button"
                >
                  <span className="tab-icon">✅</span>
                  <span className="tab-label">{t('completedOrders')}</span>
                </button>
                {(user?.role === 'admin' || user?.role === 'parent') && (
                  <button
                    className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
                    onClick={() => setActiveTab('admin')}
                    type="button"
                  >
                    <span className="tab-icon">⚙️</span>
                    <span className="tab-label">{t('admin.title')}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="shop-header-right">
              <LanguageSwitcher />
              <button className="shop-logout-btn" onClick={handleLogout} type="button">
                {t('common:logout')}
              </button>
            </div>
          </>
        )}
      </header>

      {/* On web: show ChildSelector below tabs */}
      {!isMobile && (
        <div className="below-tabs-child-selector">
          <ChildSelector layout="carousel" />
        </div>
      )}

      {isMobile && (
        <div className="mobile-child-selector-section">
          <ChildSelector layout="carousel" />
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
            >
              <span className="tab-icon">🎁</span>
              <span className="tab-label">{t('items')}</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
              type="button"
            >
              <span className="tab-icon">⏳</span>
              <span className="tab-label">{t('pendingOrders')}</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
              type="button"
            >
              <span className="tab-icon">✅</span>
              <span className="tab-label">{t('completedOrders')}</span>
            </button>
            {(user?.role === 'admin' || user?.role === 'parent') && (
              <button
                className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
                type="button"
              >
                <span className="tab-icon">⚙️</span>
                <span className="tab-label">{t('admin.title')}</span>
              </button>
            )}
          </nav>
        )}
        {activeTab === 'admin' ? (
          <ProductManager />
        ) : activeTab === 'items' ? (
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
