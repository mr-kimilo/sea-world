import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDeviceType } from '../hooks/useDeviceType';
import './PwaInstallBanner.css';

const DISMISS_KEY = 'sea-world-pwa-banner-dismissed-at';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const MANUAL_DELAY_MS = 2800;

function isStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isDismissedRecent(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number.parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_MS;
  } catch {
    return false;
  }
}

function persistDismiss(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

function detectMobileOs(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  const nav = navigator as Navigator & { maxTouchPoints?: number };
  if (navigator.platform === 'MacIntel' && (nav.maxTouchPoints ?? 0) > 1) {
    return 'ios';
  }
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

export default function PwaInstallBanner() {
  const { t } = useTranslation('common');
  const { isMobile } = useDeviceType();
  const location = useLocation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [dismissed, setDismissed] = useState(() => isDismissedRecent());

  const noTabBar =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/verify-email';

  useEffect(() => {
    if (!isMobile || dismissed || isStandaloneMode()) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowManual(false);
    };
    const onInstalled = () => {
      setDeferred(null);
      setShowManual(false);
    };

    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [isMobile, dismissed]);

  useEffect(() => {
    if (!isMobile || dismissed || isStandaloneMode() || deferred) return;
    const tmr = window.setTimeout(() => setShowManual(true), MANUAL_DELAY_MS);
    return () => window.clearTimeout(tmr);
  }, [isMobile, dismissed, deferred]);

  const handleInstall = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      /* user dismissed native sheet or prompt failed */
    }
    setDeferred(null);
  }, [deferred]);

  const handleDismiss = useCallback(() => {
    persistDismiss();
    setDismissed(true);
  }, []);

  if (!isMobile || dismissed || isStandaloneMode()) {
    return null;
  }

  if (!deferred && !showManual) {
    return null;
  }

  const useChromiumInstall = deferred !== null;
  const os = detectMobileOs();

  let bodyKey: 'pwa.bannerBodyChromium' | 'pwa.bannerBodyIos' | 'pwa.bannerBodyAndroidOther';
  if (useChromiumInstall) {
    bodyKey = 'pwa.bannerBodyChromium';
  } else if (os === 'ios') {
    bodyKey = 'pwa.bannerBodyIos';
  } else {
    bodyKey = 'pwa.bannerBodyAndroidOther';
  }

  return (
    <div
      className={`pwa-install-banner${noTabBar ? '' : ' pwa-install-banner--above-tab'}`}
      role="region"
      aria-label={t('pwa.bannerAria')}
    >
      <div className="pwa-install-banner-inner">
        <h2 className="pwa-install-title">{t('pwa.bannerTitle')}</h2>
        <p className="pwa-install-body">{t(bodyKey)}</p>
        <div className="pwa-install-actions">
          {useChromiumInstall ? (
            <>
              <button type="button" className="pwa-install-btn pwa-install-btn--primary" onClick={handleInstall}>
                {t('pwa.install')}
              </button>
              <button type="button" className="pwa-install-btn pwa-install-btn--ghost" onClick={handleDismiss}>
                {t('pwa.later')}
              </button>
            </>
          ) : (
            <button type="button" className="pwa-install-btn pwa-install-btn--primary" onClick={handleDismiss}>
              {t('pwa.gotIt')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
