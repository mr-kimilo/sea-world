import { useLocation, useNavigate } from "react-router-dom";
import { t } from "../i18n";

interface Props { onMenu: () => void; }

const TABS = [
  { path: "/", icon: "🏠", label: "nav.home" },
  { path: "/points", icon: "⭐", label: "nav.points" },
  { path: "/tasks", icon: "📋", label: "nav.tasks" },
  { path: "/shop", icon: "🎁", label: "nav.shop" },
  { path: "/settings", icon: "👤", label: "nav.me" },
];

export default function TabBar({ onMenu }: Props) {
  const loc = useLocation();
  const nav = useNavigate();
  const active = (path: string) => loc.pathname === path;

  return (
    <div className="nav-pill-wrap">
      <div className="nav-pill">
        <button className="nav-pill-btn nav-pill-menu" onClick={onMenu}>
          <span className="nav-pill-icon">☰</span>
        </button>
        {TABS.map(tab => (
          <button key={tab.path} className={"nav-pill-btn" + (active(tab.path) ? " active" : "")} onClick={() => nav(tab.path)}>
            <span className="nav-pill-icon">{tab.icon}</span>
            {t(tab.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
