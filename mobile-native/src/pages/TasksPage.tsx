import { t } from "../i18n";
export default function TasksPage() {
  return (
    <div className="home-v2">
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>
      <nav className="home-nav-v2">
        <span className="home-nav-title">📋 {t("tasks.title")}</span>
      </nav>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🏗️</div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>{t("tasks.title")}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>{t("tasks.empty")}</div>
      </div>
      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
