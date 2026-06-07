import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store";
import { t } from "../i18n";

interface Props { open: boolean; onClose: () => void; }

export default function MobileSidebar({ open, onClose }: Props) {
  const { token, logout } = useAuthStore();
  const loggedIn = !!token;
  const [pointsOpen, setPointsOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);

  const subRoutes = [
    { to: "/points", icon: "⚡", label: t("points.record") },
    { to: "/history", icon: "📊", label: t("sidebar.history") },
    { to: "/shop", icon: "🎁", label: t("sidebar.shop") },
    { to: "/orders", icon: "📦", label: t("sidebar.orders") },
  ];

  const moreRoutes = [
    { to: "#", icon: "👶", label: "孩子管理" },
    { to: "#", icon: "📈", label: "数据洞察" },
    { to: "#", icon: "⚙️", label: "家庭设置" },
  ];

  return (
    <div className={"sidebar-root" + (open ? " open" : "")} aria-hidden={!open}>
      <div className="sidebar-backdrop" onClick={onClose} />
      <aside className="sidebar-panel">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/favicon.svg" alt="HyperOne" className="sidebar-logo" style={{ width: 32, height: 32 }} />
            <span className="sidebar-name">{t("sidebar.brandName")}</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>

        {/* ── 一级导航 ── */}
        <nav className="sidebar-nav">
          {/* 首页 */}
          <NavLink to="/" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")} onClick={onClose}>
            <span className="sidebar-link-icon">🏠</span>
            <span>{t("sidebar.home")}</span>
          </NavLink>

          {/* 积分中心（可折叠 — 标题不跳转） */}
          {loggedIn && (
            <>
              <button className="sidebar-collapse-btn" onClick={() => setPointsOpen(!pointsOpen)}>
                <span className="sidebar-link-icon" style={{ fontSize: 20 }}>⭐</span>
                <span style={{ fontWeight: 600, flex: 1, textAlign: "left" }}>{t("sidebar.points")}</span>
                <span className={"collapse-arrow" + (pointsOpen ? " open" : "")}>▶</span>
              </button>
              {pointsOpen && (
                <div style={{ paddingLeft: 20 }}>
                  {subRoutes.map((r) => (
                    <NavLink key={r.to} to={r.to} className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")} onClick={onClose}>
                      <span className="sidebar-link-icon">{r.icon}</span>
                      <span>{r.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 价值观纠正器 */}
          <NavLink to="/child" className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")} onClick={onClose}>
            <span className="sidebar-link-icon">🧒</span>
            <span>{t("sidebar.corrector")}</span>
          </NavLink>
        </nav>

        {/* ── 扩展预留区 ── */}
        {loggedIn && (
          <div className="sidebar-nav" style={{ marginTop: 2 }}>
            <button className="sidebar-collapse-btn" onClick={() => setMoreOpen(!moreOpen)}>
              <span className="sidebar-link-icon" style={{ fontSize: 16 }}>📂</span>
              <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, flex: 1, textAlign: "left" }}>{t("sidebar.more")}</span>
              <span className={"collapse-arrow" + (moreOpen ? " open" : "")}>▶</span>
            </button>
            {moreOpen && (
              <div style={{ paddingLeft: 20 }}>
                {moreRoutes.map((r, i) => (
                  <div key={i} className="sidebar-link" style={{ opacity: 0.4, cursor: "default" }}>
                    <span className="sidebar-link-icon">{r.icon}</span>
                    <span>{r.label} <span style={{ fontSize: 10, color: "var(--muted)" }}>soon</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 底部 ── */}
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
