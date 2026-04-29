import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useDeviceType } from '../../hooks/useDeviceType';
import { useAuthStore } from '../../store/authStore';

import ProductManager from '../../components/ProductManager';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import MobileSidebar from '../../components/MobileSidebar';
import { Button } from '../../components/ui/button';

import './ShopAdmin.css';
import './ShopAdmin.mobile.css';

export default function ShopAdmin() {
  const { t } = useTranslation(['shop', 'common', 'home']);
  const { isMobile } = useDeviceType();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shop-admin-page">
      {isMobile && (
        <>
          <header className="shop-admin-header">
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
              <Button onClick={handleLogout} className="logout-btn" type="button" variant="ghost">
                {t('common:logout')}
              </Button>
            </div>
          </header>
          <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      )}
      <ProductManager />
    </div>
  );
}

