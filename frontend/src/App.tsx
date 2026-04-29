import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useOfflineSync } from './hooks/useOfflineSync';
import { useDeviceType } from './hooks/useDeviceType';
import MobileTabBar from './components/MobileTabBar';
import WebSidebar from './components/WebSidebar';
import OceanBackground from './components/OceanBackground';
import './styles/web-app-layout.css';
import './styles/ocean-authed-shell.css';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import Shop from './pages/Shop/Shop';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import ShopAdmin from './pages/ShopAdmin/ShopAdmin';
import ScoreMaintenance from './pages/ScoreMaintenance/ScoreMaintenance';
import './styles/mobile-globals.css';

/**
 * ProtectedLayout wraps authenticated pages and renders the mobile tab bar
 * when the viewport is below the mobile breakpoint (< 1024px).
 */
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useDeviceType();
  const location = useLocation();
  const webMainRef = React.useRef<HTMLDivElement | null>(null);

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
        <div className="app-authed-stack">
          {children}
          <MobileTabBar />
        </div>
      </div>
    );
  }
  return (
    <div className="app-authed-root">
      <OceanBackground fixed />
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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/"
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
