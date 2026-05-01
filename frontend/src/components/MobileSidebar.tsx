import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getSidebarRoutes, type AppUserRole } from './nav/NavRoutes';
import { NavRouteIcon } from './nav/NavRouteIcons';
import { Button } from './ui/button';
import { useAuthStore } from '../store/authStore';

import './MobileSidebar.css';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { t } = useTranslation(['home', 'common']);
  const role = useAuthStore((s) => s.user?.role) as AppUserRole | undefined;
  const routes = getSidebarRoutes(role);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <div className={`mobile-sidebar-root${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="mobile-sidebar-backdrop" onClick={onClose} />
      <aside className="mobile-sidebar-panel" aria-label={t('home:sidebarShellAria')} role="dialog" aria-modal="true">
        <div className="mobile-sidebar-header">
          <div className="mobile-sidebar-brand">
            <span className="mobile-sidebar-logo" aria-hidden="true">
              🐠
            </span>
            <div className="mobile-sidebar-brand-text">
              <div className="mobile-sidebar-app-name">{t('common:appName')}</div>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" className="mobile-sidebar-close" onClick={onClose}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">{t('common:close')}</span>
          </Button>
        </div>

        <nav className="mobile-sidebar-nav" aria-label={t('home:sidebarNavAria')}>
          {routes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              end={route.path === '/'}
              className={({ isActive }) => `mobile-sidebar-link${isActive ? ' is-active' : ''}`}
              onClick={onClose}
            >
              <span className="mobile-sidebar-link-icon" aria-hidden="true">
                <NavRouteIcon name={route.icon} className="mobile-sidebar-glyph" />
              </span>
              <span className="mobile-sidebar-link-label">{t(`home:${route.labelKey}`)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}

