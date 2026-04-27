import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 1024;

/**
 * Detects whether the current device/browser viewport is mobile (< 1024px).
 * Sets `data-device="mobile"` or `data-device="web"` on `document.documentElement`
 * so that separate mobile/web CSS files can use attribute selectors for style switching.
 *
 * Usage:
 *   const { isMobile } = useDeviceType();
 *   // Then in CSS: [data-device="mobile"] .my-class { ... }
 */
export function useDeviceType() {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const updateDevice = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      document.documentElement.setAttribute('data-device', mobile ? 'mobile' : 'web');
    };

    // Apply immediately on mount
    updateDevice();

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mediaQuery.addEventListener('change', updateDevice);
    return () => mediaQuery.removeEventListener('change', updateDevice);
  }, []);

  return { isMobile };
}
