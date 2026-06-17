import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useOfflineSync } from './hooks/useOfflineSync';
import { useDeviceType } from './hooks/useDeviceType';
import MobileTabBar from './components/MobileTabBar';
import MobileSidebar from './components/MobileSidebar';
import WebSidebar from './components/WebSidebar';
import { useUiStore } from './store/uiStore';
import LanguageSwitcher from './components/LanguageSwitcher';
import OceanBackground from './components/OceanBackground';
import './styles/web-app-layout.css';
import './styles/ocean-authed-shell.css';
import Login from './pages/Login/Login';
import OAuthCallback from './pages/Login/OAuthCallback';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import Shop from './pages/Shop/Shop';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import ShopAdmin from './pages/ShopAdmin/ShopAdmin';
import ScoreMaintenance from './pages/ScoreMaintenance/ScoreMaintenance';
// MVP2: Task, Trophy, Family
import TaskList from './pages/Task/TaskList';
import TrophyList from './pages/Trophy/TrophyList';
import FamilySettings from './pages/Family/FamilySettings';
import PwaInstallBanner from './components/PwaInstallBanner';
import './styles/mobile-globals.css';
// Portal
import PortalLayout from './pages/Portal/PortalLayout';
import PortalHome from './pages/Portal/PortalHome';
import ChildValuePage from './pages/Portal/ChildValuePage';
// Download
import DownloadApp from './pages/DownloadApp/DownloadApp';

/**
 * ProtectedLayout wraps authenticated pages and renders the mobile tab bar
 * when the viewport is below the mobile breakpoint (< 1024px).
 */
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useDeviceType();
  const location = useLocation();
  const webMainRef = React.useRef<HTMLDivElement | null>(null);
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  React.useLayoutEffect(() => {
    // Web: reset scroll position on route changes
    if (!isMobile) {
      // Use sync layout effect to prevent visible jump/jitter
      const el = webMainRef.current;
      if (el) {
        el.scrollTop = 0;
        el.scrollLeft = 0;
      }
    }
    // Mobile: allow each page to manage its own scroll (fixed header + padding)
  }, [location.pathname, isMobile]);

  if (isMobile) {
    return (
      <div className="app-authed-root">
        <OceanBackground fixed />
        <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
        <div className="app-authed-stack">
          {/* Fixed top-right language switcher */}
          <div className="global-lang-switcher">
            <LanguageSwitcher />
          </div>
          {children}
          <MobileTabBar />
        </div>
      </div>
    );
  }
  return (
    <div className="app-authed-root">
      <OceanBackground fixed />
      {/* Fixed top-right language switcher */}
      <div className="global-lang-switcher">
        <LanguageSwitcher />
      </div>
      <div className="app-layout-web app-layout-web--framed">
        <div className="app-layout-web-inner">
          <WebSidebar />
          <div ref={webMainRef} className="app-layout-web-main">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Enable offline sync
  useOfflineSync();
  // Initialise device detection (sets data-device on <html> for CSS selectors)
  useDeviceType();

  return (
    <BrowserRouter>
      <PwaInstallBanner />
      <Routes>
        {/* Portal — 超体 · 超级家庭 */}
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<PortalHome />} />
          <Route path="under-sea" element={<Navigate to="/home" replace />} />
          <Route path="child-value" element={<ChildValuePage />} />
          <Route path="download" element={<DownloadApp />} />
        </Route>

        {/* Auth pages (public) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Protected routes — /home 而不是 / 避免冲突 */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Home />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Shop />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Orders />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop-admin"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <ShopAdmin />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/score-maintenance"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <ScoreMaintenance />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        {/* MVP2: Tasks */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <TaskList />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trophies"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <TrophyList />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <FamilySettings />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        {/* Root → portal */}
        <Route path="/" element={<Navigate to="/portal" replace />} />
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
