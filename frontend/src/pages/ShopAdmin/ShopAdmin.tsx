import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useDeviceType } from '../../hooks/useDeviceType';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

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

  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

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
          <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
        </>
      )}
      <ProductManager />
    </div>
  );
}

