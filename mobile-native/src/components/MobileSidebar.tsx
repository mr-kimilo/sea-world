import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store";
import { t } from "../i18n";

interface Props { open: boolean; onClose: () => void; }

export default function MobileSidebar({ open, onClose }: Props) {
  const { token, logout } = useAuthStore();
  const loggedIn = !!token;

  const mainRoutes = [
    { to: "/", icon: "🏠", label: t("sidebar.home") },
    { to: "/child", icon: "🧒", label: t("sidebar.corrector") },
  ];

  const authRoutes = loggedIn ? [
    { to: "/points", icon: "⭐", label: t("sidebar.points") },
    { to: "/history", icon: "📊", label: "积分历史" },
    { to: "/tasks", icon: "📋", label: t("sidebar.tasks") },
    { to: "/shop", icon: "🎁", label: t("sidebar.shop") },
    { to: "/orders", icon: "📦", label: "我的订单" },
  ] : [];

  return (
    <div className={"sidebar-root" + (open ? " open" : "")} aria-hidden={!open}>
      <div className="sidebar-backdrop" onClick={onClose} />
      <aside className="sidebar-panel">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-logo">🐠</span>
            <span className="sidebar-name">SeaWorld</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>

        <nav className="sidebar-nav">
          {mainRoutes.map((r) => (
            <NavLink key={r.to} to={r.to} className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")} onClick={onClose}>
              <span className="sidebar-link-icon">{r.icon}</span>
              <span>{r.label}</span>
            </NavLink>
          ))}
        </nav>

        {loggedIn && (
          <nav className="sidebar-nav" style={{ marginTop: 8, borderTop: "0.5px solid var(--line)", paddingTop: 8 }}>
            {authRoutes.map((r) => (
              <NavLink key={r.to} to={r.to} className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")} onClick={onClose}>
                <span className="sidebar-link-icon">{r.icon}</span>
                <span>{r.label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        <div className="sidebar-footer">
          {loggedIn ? (
            <button className="sidebar-logout" onClick={() => { logout(); onClose(); window.location.hash = "#/"; }}>
              <span>🚪</span> <span>{t("sidebar.logout")}</span>
            </button>
          ) : (
            <a href="#/login" className="sidebar-logout" style={{ textDecoration: "none", justifyContent: "center" }} onClick={onClose}>
              {t("sidebar.login")}
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
