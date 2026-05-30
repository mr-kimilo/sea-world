import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Portal.css';

const NAV_ITEMS = [
  {
    path: '/portal',
    end: true,
    icon: '🏠',
    label: { zh: '首页', en: 'Home' },
  },
  {
    path: '/portal/under-sea',
    icon: '🐠',
    label: { zh: '积分管理', en: 'Points' },
    external: true,
    href: '/home',
  },
  {
    path: '/portal/child-value',
    icon: '💰',
    label: { zh: '金钱价值观纠正', en: 'Money Value' },
  },
];

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lang = 'zh';

  const t = (zh: string, _en: string) => lang === 'zh' ? zh : _en;

  return (
    <div className="portal-root">
      {/* Mobile hamburger */}
      <button
        className="portal-hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="portal-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`portal-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="portal-brand">
          <span className="portal-logo">⚡</span>
          <div className="portal-brand-text">
            <span className="portal-app-name">超体</span>
            <span className="portal-tagline">超级家庭</span>
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
                <span>{t(item.label.zh, item.label.en)}</span>
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
                onClick={() => setSidebarOpen(false)}
              >
                <span className="portal-nav-icon">{item.icon}</span>
                <span>{t(item.label.zh, item.label.en)}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="portal-sidebar-footer">
          <span className="portal-version">v1.0 · 超体</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="portal-main">
        <Outlet />
      </main>
    </div>
  );
}
