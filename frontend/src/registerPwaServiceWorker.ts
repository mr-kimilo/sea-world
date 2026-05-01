/**
 * Registers the root-scope service worker so the app can meet PWA install criteria
 * (HTTPS + manifest + active SW). Safe no-op if unsupported or registration fails.
 */
export function registerPwaServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Dev (HTTP on LAN) or blocked SW — install hints still work where supported
    });
  });
}
