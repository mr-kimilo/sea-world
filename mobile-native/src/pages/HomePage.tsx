import { useAuthStore } from "../store";
import { t } from "../i18n";

export default function HomePage() {
  const token = useAuthStore((s) => s.token);
  return token ? <Dashboard /> : <Landing />;
}

function Dashboard() {
  return (
    <div>
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
    <div>
      <h1 className="page-title" style={{ fontSize: 24 }}>🐠 SeaWorld</h1>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
        {t("app.slogan")}
      </p>
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
