import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MAIN_NAV_ROUTES } from './nav/NavRoutes';
import { NavRouteIcon } from './nav/NavRouteIcons';
import './MobileTabBar.css';

export default function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('home');

  return (
    <nav className="mobile-tabbar" role="navigation" aria-label={t('tabBarAria')}>
      <div className="mobile-tabbar-inner">
        {MAIN_NAV_ROUTES.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/' || location.pathname === ''
              : location.pathname === tab.path ||
                location.pathname.startsWith(`${tab.path}/`);
          return (
            <button
              key={tab.path}
              type="button"
              className={`mobile-tab${isActive ? ' active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={t(tab.labelKey)}
            >
              <span className="mobile-tab-icon" aria-hidden="true">
                <NavRouteIcon name={tab.icon} className="mobile-tab-glyph" />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
