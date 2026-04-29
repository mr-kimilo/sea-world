import type { NavRouteIconName } from './NavRouteIcons';

export const MAIN_NAV_ROUTES = [
  { path: '/', labelKey: 'nav.home' as const, icon: 'house' as const },
  { path: '/shop', labelKey: 'nav.shop' as const, icon: 'bag' as const },
] satisfies ReadonlyArray<{
  path: string;
  labelKey: string;
  icon: NavRouteIconName;
}>;

export const SIDEBAR_ROUTES = [
  { path: '/profile', labelKey: 'nav.profile' as const, icon: 'person' as const },
  { path: '/shop-admin', labelKey: 'nav.shopAdmin' as const, icon: 'storefront' as const },
  { path: '/orders', labelKey: 'nav.orders' as const, icon: 'receipt' as const },
  { path: '/score-maintenance', labelKey: 'nav.scoreMaintenance' as const, icon: 'sparkles' as const },
] satisfies ReadonlyArray<{
  path: string;
  labelKey: string;
  icon: NavRouteIconName;
}>;

export type AppUserRole = 'parent' | 'child' | 'admin';

export function getSidebarRoutes(role: AppUserRole | undefined | null) {
  const canManage = role === 'parent' || role === 'admin';

  return SIDEBAR_ROUTES.filter((r) => {
    if (r.path === '/profile') return true;
    if (r.path === '/orders') return true;
    // maintenance pages: parent/admin only
    if (r.path === '/shop-admin') return canManage;
    if (r.path === '/score-maintenance') return canManage;
    return true;
  });
}

