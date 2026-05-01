import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MAIN_NAV_ROUTES } from './nav/NavRoutes';
import { NavRouteIcon } from './nav/NavRouteIcons';
import { useUiStore } from '../store/uiStore';
import './MobileTabBar.css';

export default function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['home', 'common']);
  const toggleMobileSidebar = useUiStore((s) => s.toggleMobileSidebar);
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);

  return (
    <nav className="mobile-tabbar" role="navigation" aria-label={t('tabBarAria')}>
      <div className="mobile-tabbar-inner">
        {/* left tab */}
        {(() => {
          const tab = MAIN_NAV_ROUTES[0];
          const isActive =
            tab.path === '/'
              ? location.pathname === '/' || location.pathname === ''
              : location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`);
          return (
            <button
              key={tab.path}
              type="button"
              className={`mobile-tab${isActive ? ' active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={t(`home:${tab.labelKey}`)}
            >
              <span className="mobile-tab-icon" aria-hidden="true">
                <NavRouteIcon name={tab.icon} className="mobile-tab-glyph" />
              </span>
            </button>
          );
        })()}

        {/* center menu */}
        <button
          type="button"
          className={`mobile-tab mobile-tab--menu${mobileSidebarOpen ? ' active' : ''}`}
          onClick={toggleMobileSidebar}
          aria-label={t('common:menu')}
          aria-pressed={mobileSidebarOpen}
        >
          <span className="mobile-tab-icon" aria-hidden="true">
            <svg className="mobile-tab-menu-glyph" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6.5 7.6c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h11c.5 0 .9.4.9.9s-.4.9-.9.9h-11Zm0 5.3c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h11c.5 0 .9.4.9.9s-.4.9-.9.9h-11Zm0 5.3c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h11c.5 0 .9.4.9.9s-.4.9-.9.9h-11Z"
              />
            </svg>
          </span>
        </button>

        {/* right tab */}
        {(() => {
          const tab = MAIN_NAV_ROUTES[1];
          const isActive =
            tab.path === '/'
              ? location.pathname === '/' || location.pathname === ''
              : location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`);
          return (
            <button
              key={tab.path}
              type="button"
              className={`mobile-tab${isActive ? ' active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={t(`home:${tab.labelKey}`)}
            >
              <span className="mobile-tab-icon" aria-hidden="true">
                <NavRouteIcon name={tab.icon} className="mobile-tab-glyph" />
              </span>
            </button>
          );
        })()}
      </div>
    </nav>
  );
}
