import { useLocation, useNavigate } from "react-router-dom";
import { t } from "../i18n";

interface Props { onMenu: () => void; }

export default function TabBar({ onMenu }: Props) {
  const loc = useLocation();
  const nav = useNavigate();
  const active = (path: string) => loc.pathname === path;

  return (
    <div className="nav-pill-wrap">
      <div className="nav-pill">
        <button className={"nav-pill-btn" + (active("/") ? " active" : "")} onClick={() => nav("/")}>
          <span className="nav-pill-icon">🏠</span>{t("nav.home")}
        </button>
        <button className="nav-pill-btn" onClick={onMenu}>
          <span className="nav-pill-icon">☰</span>{t("nav.menu")}
        </button>
        <button className={"nav-pill-btn" + (active("/settings") ? " active" : "")} onClick={() => nav("/settings")}>
          <span className="nav-pill-icon">🧑</span>{t("nav.me")}
        </button>
      </div>
    </div>
  );
}
