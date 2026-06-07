import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDeviceType } from '../../hooks/useDeviceType';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import './Portal.css';

const NAV_ITEMS = [
  {
    path: '/portal',
    end: true,
    icon: '🏠',
    label: { zh: '首页', en: 'Home' },
    i18nKey: 'portal.home',
  },
  {
    path: '/portal/under-sea',
    icon: '🐠',
    label: { zh: '积分管理', en: 'Points' },
    i18nKey: 'portal.points',
    external: true,
    href: '/home',
  },
  {
    path: '/portal/child-value',
    icon: '💰',
    label: { zh: '金钱价值观纠正', en: 'Money Value' },
    i18nKey: 'portal.moneyValue',
  },
  {
    path: '/portal/download',
    icon: '📲',
    label: { zh: '下载 App', en: 'Download App' },
    i18nKey: 'portal.downloadApp',
  },
];

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useDeviceType();
  const { t } = useTranslation(['child', 'common']);

  // On desktop the sidebar is always visible — keep it open
  const showSidebar = !isMobile || sidebarOpen;

  return (
    <div className="portal-root">
      {/* Fixed top-right language switcher */}
      <div className="global-lang-switcher">
        <LanguageSwitcher />
      </div>

      {/* Mobile hamburger — only visible on mobile */}
      {isMobile && (
        <button
          className="portal-hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div className="portal-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`portal-sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="portal-brand">
          <span className="portal-logo">⚡</span>
          <div className="portal-brand-text">
            <span className="portal-app-name">{t('common:appName')}</span>
            <span className="portal-tagline">{t('portal.tagline')}</span>
          </div>
        </div>

        <nav className="portal-nav">
          {NAV_ITEMS.map((item) =>
            item.external ? (
              <a
                key={item.path}
                href={item.href}
                className="portal-nav-link"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="portal-nav-icon">{item.icon}</span>
                <span>{t(item.i18nKey)}</span>
                <span className="portal-external-badge">↗</span>
              </a>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `portal-nav-link${isActive ? ' active' : ''}`
                }
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <span className="portal-nav-icon">{item.icon}</span>
                <span>{t(item.i18nKey)}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="portal-sidebar-footer">
          <span className="portal-version">v1.0 · {t('common:appName')}</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="portal-main">
        <Outlet />
      </main>
    </div>
  );
}
