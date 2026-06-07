import { useAuthStore } from "../store";
import { t } from "../i18n";

export default function HomePage() {
  const token = useAuthStore((s) => s.token);
  return token ? <Dashboard /> : <Landing />;
}

function Dashboard() {
  return (
    <div>
      <div className="landing-hero" style={{ marginBottom: 24 }}>
        <span className="landing-emoji" style={{ fontSize: 48 }}>🌐</span>
        <h1 style={{ fontSize: 28 }}>HyperOne</h1>
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{t("home.subtitle")}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <a href="#/points" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <div className="feature-card">
            <span className="feature-icon">⭐</span>
            <h3>{t("home.points")}</h3>
            <p>{t("home.pointsDesc")}</p>
          </div>
        </a>
        <a href="#/child" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <div className="feature-card">
            <span className="feature-icon">🧒</span>
            <h3>{t("home.corrector")}</h3>
            <p>{t("home.correctorDesc")}</p>
          </div>
        </a>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="landing-page-inline">
      <div className="landing-hero">
        <span className="landing-emoji">🌐</span>
        <h1>HyperOne</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{t("home.subtitle")}</p>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
          {t("app.slogan")}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <a href="#/login" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="feature-card">
            <span className="feature-icon">⭐</span>
            <h3>{t("home.points")}</h3>
            <p>{t("home.pointsDesc")}</p>
          </div>
        </a>
        <a href="#/child" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="feature-card">
            <span className="feature-icon">🧒</span>
            <h3>{t("home.corrector")}</h3>
            <p>{t("home.correctorDesc")}</p>
          </div>
        </a>
      </div>
      <a href="#/login" className="auth-btn" style={{ display: "flex", textDecoration: "none", marginTop: 16 }}>
        {t("home.start")}
      </a>
    </div>
  );
}
