import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import LanguageSwitcher from './LanguageSwitcher';
import { getSidebarRoutes, type AppUserRole } from './nav/NavRoutes';
import { NavRouteIcon } from './nav/NavRouteIcons';
import './WebSidebar.css';

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return `web-sidebar-link${isActive ? ' is-active' : ''}`;
}

export default function WebSidebar() {
  const { t } = useTranslation(['home', 'common']);
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const routes = getSidebarRoutes(user?.role as AppUserRole | undefined);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="web-sidebar" aria-label={t('home:sidebarShellAria')}>
      <div className="web-sidebar-brand">
        <NavLink to="/" end className="web-sidebar-brand-link">
          <span className="web-sidebar-logo" aria-hidden="true">
            🐠
          </span>
          <div className="web-sidebar-brand-text">
            <span className="web-sidebar-app-name">{t('common:appName')}</span>
            <span className="web-sidebar-tagline">{t('home:slogan')}</span>
          </div>
        </NavLink>
      </div>

      <nav className="web-sidebar-nav" aria-label={t('home:sidebarNavAria')}>
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={false}
            className={navLinkClassName}
          >
            <span className="web-sidebar-link-icon" aria-hidden="true">
              <NavRouteIcon name={route.icon} className="web-sidebar-glyph" />
            </span>
            <span className="web-sidebar-link-label">{t(`home:${route.labelKey}`)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="web-sidebar-actions" aria-label={t('home:sidebarActionsAria')}>
        <LanguageSwitcher />
        <button type="button" className="web-sidebar-logout" onClick={handleLogout}>
          {t('common:logout')}
        </button>
      </div>

      <div className="web-sidebar-spacer" aria-hidden="true" />
    </aside>
  );
}
