import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../store";
import { t } from "../i18n";

interface Props { open: boolean; onClose: () => void; }

export default function MobileSidebar({ open, onClose }: Props) {
  const { token, user, logout } = useAuthStore();
  const loggedIn = !!token;
  const location = useLocation();
  const [pointsOpen, setPointsOpen] = useState(true);

  // Close sidebar on route change
  useEffect(() => {
    if (open) onClose();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    window.location.hash = "#/";
  };

  const mainNavItems = [
    { to: "/", icon: "🏠", label: t("sidebar.home") },
    { to: "/points", icon: "⭐", label: t("sidebar.points") },
    { to: "/tasks", icon: "📋", label: t("sidebar.tasks") },
    { to: "/shop", icon: "🎁", label: t("sidebar.shop") },
    { to: "/child", icon: "🧒", label: t("sidebar.corrector") },
  ];

  return (
    <div className={"sidebar-root" + (open ? " open" : "")} aria-hidden={!open}>
      {/* Gradient backdrop */}
      <div className="sidebar-backdrop-v2" onClick={onClose} />

      {/* Panel */}
      <aside className="sidebar-panel-v2">
        {/* ── Header: Ocean Wave + User Info ── */}
        <div className="sidebar-header-v2">
          <div className="sidebar-header-wave" aria-hidden="true" />
          <div className="sidebar-header-close">
            <button className="sidebar-close-btn" onClick={onClose}>✕</button>
          </div>
          {loggedIn && user ? (
            <div className="sidebar-user-v2">
              <div className="sidebar-user-avatar-v2">
                {user.name?.charAt(0) || "👤"}
              </div>
              <div className="sidebar-user-info-v2">
                <div className="sidebar-user-name-v2">{user.name}</div>
                <div className="sidebar-user-role-v2">家长</div>
                <div className="sidebar-user-email-v2">{user.email}</div>
              </div>
            </div>
          ) : (
            <div className="sidebar-user-v2">
              <div className="sidebar-user-avatar-v2">👤</div>
              <div className="sidebar-user-info-v2">
                <div className="sidebar-user-name-v2" style={{ opacity: 0.5 }}>{t("sidebar.guest")}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="sidebar-nav-v2">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "sidebar-nav-item-v2" + (isActive ? " active" : "")
              }
              onClick={onClose}
            >
              <span className="sidebar-nav-icon-v2">{item.icon}</span>
              <span className="sidebar-nav-label-v2">{item.label}</span>
              <span className="sidebar-nav-arrow-v2">›</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Secondary Section ── */}
        {loggedIn && (
          <>
            <div className="sidebar-divider-v2" />

            <div className="sidebar-nav-v2" style={{ paddingTop: 0, paddingBottom: 0 }}>
              <button className="sidebar-section-toggle-v2" onClick={() => setPointsOpen(!pointsOpen)}>
                <span>📂</span>
                <span style={{ flex: 1, textAlign: "left" }}>{t("sidebar.more")}</span>
                <span style={{ transform: pointsOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>›</span>
              </button>
              {pointsOpen && (
                <div className="sidebar-section-children-v2">
                  <NavLink to="/history" className={({ isActive }) => "sidebar-nav-item-v2" + (isActive ? " active" : "")} onClick={onClose}>
                    <span className="sidebar-nav-icon-v2">📊</span>
                    <span className="sidebar-nav-label-v2">{t("sidebar.history")}</span>
                  </NavLink>
                  <NavLink to="/orders" className={({ isActive }) => "sidebar-nav-item-v2" + (isActive ? " active" : "")} onClick={onClose}>
                    <span className="sidebar-nav-icon-v2">📦</span>
                    <span className="sidebar-nav-label-v2">{t("sidebar.orders")}</span>
                  </NavLink>
                  <NavLink to="/settings" className={({ isActive }) => "sidebar-nav-item-v2" + (isActive ? " active" : "")} onClick={onClose}>
                    <span className="sidebar-nav-icon-v2">⚙️</span>
                    <span className="sidebar-nav-label-v2">{t("sidebar.settings")}</span>
                  </NavLink>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Footer ── */}
        <div className="sidebar-footer-v2">
          {loggedIn ? (
            <button className="sidebar-footer-item-v2 danger" onClick={handleLogout}>
              <span>🚪</span>
              <span>{t("sidebar.logout")}</span>
            </button>
          ) : (
            <a
              href="#/login"
              className="sidebar-footer-item-v2"
              style={{ textDecoration: "none" }}
              onClick={onClose}
            >
              <span>🔑</span>
              <span>{t("sidebar.login")}</span>
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
