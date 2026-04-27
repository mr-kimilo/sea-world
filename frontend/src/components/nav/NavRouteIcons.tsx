export type NavRouteIconName = 'house' | 'bag' | 'person';

export const MAIN_NAV_ROUTES = [
  { path: '/', labelKey: 'nav.home' as const, icon: 'house' as const },
  { path: '/shop', labelKey: 'nav.shop' as const, icon: 'bag' as const },
  { path: '/profile', labelKey: 'nav.profile' as const, icon: 'person' as const },
] as const;

export function NavRouteIcon({
  name,
  className,
}: {
  name: NavRouteIconName;
  className?: string;
}) {
  const cn = className ?? 'nav-route-icon';
  if (name === 'house') {
    return (
      <svg className={cn} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M11.4 3.2a1.2 1.2 0 0 1 1.2 0l7.2 4.8c.35.23.56.63.56 1.05V19.2c0 .66-.54 1.2-1.2 1.2h-4.8v-6h-4.8v6H4.8c-.66 0-1.2-.54-1.2-1.2V9.05c0-.42.21-.82.56-1.05l7.2-4.8Z"
        />
      </svg>
    );
  }
  if (name === 'bag') {
    return (
      <svg className={cn} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M8 7V6a4 4 0 0 1 8 0v1h1.2c.66 0 1.2.54 1.2 1.2v10.8c0 .66-.54 1.2-1.2 1.2H6.8c-.66 0-1.2-.54-1.2-1.2V8.2c0-.66.54-1.2 1.2-1.2H8Zm1.6 0h4.8V6a2.4 2.4 0 0 0-4.8 0v1Z"
        />
      </svg>
    );
  }
  return (
    <svg className={cn} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a3.6 3.6 0 1 0 0-7.2A3.6 3.6 0 0 0 12 12Zm-7.2 8.4c0-3.96 3.22-7.2 7.2-7.2s7.2 3.24 7.2 7.2v.6c0 .66-.54 1.2-1.2 1.2H6c-.66 0-1.2-.54-1.2-1.2v-.6Z"
      />
    </svg>
  );
}
