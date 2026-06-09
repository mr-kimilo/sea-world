import { useAuthStore } from "../store";
import { getLang, setLang, t } from "../i18n";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const lang = getLang();

  const handleLogout = () => {
    if (confirm(t("settings.logoutConfirm"))) {
      logout();
      window.location.hash = "#/login";
    }
  };

  return (
    <div className="home-v2">
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>

      <nav className="home-nav-v2">
        <span className="home-nav-title">👤 {t("settings.title")}</span>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* User Card */}
        <div className="child-card-v2" style={{ marginBottom: 14 }}>
          <div className="child-card-top">
            <div className="child-avatar-v2">🧑</div>
            <div className="child-info-v2">
              <div className="child-name-v2">{user?.email ?? t("settings.notLoggedIn")}</div>
              <div className="child-role-v2">{user ? "家长" : t("settings.notLoggedIn")}</div>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="activity-feed-v2" style={{ marginBottom: 14 }}>
          <div className="activity-feed-title">🌐 {t("settings.language")}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={() => setLang("zh")}
              style={{ flex: 1, padding: "12px", borderRadius: 14, border: lang === "zh" ? "1px solid rgba(0,180,216,0.5)" : "0.5px solid rgba(255,255,255,0.1)", background: lang === "zh" ? "rgba(0,119,182,0.3)" : "rgba(255,255,255,0.06)", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: lang === "zh" ? 600 : 400 }}>
              中文
            </button>
            <button onClick={() => setLang("en")}
              style={{ flex: 1, padding: "12px", borderRadius: 14, border: lang === "en" ? "1px solid rgba(0,180,216,0.5)" : "0.5px solid rgba(255,255,255,0.1)", background: lang === "en" ? "rgba(0,119,182,0.3)" : "rgba(255,255,255,0.06)", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: lang === "en" ? 600 : 400 }}>
              English
            </button>
          </div>
        </div>

        {/* About */}
        <div className="activity-feed-v2" style={{ marginBottom: 14 }}>
          <div className="activity-feed-title">📝 {t("settings.about")}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{t("settings.version")}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{t("app.slogan")}</div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          style={{ width: "100%", padding: "14px", border: "none", borderRadius: 16, background: "rgba(229,62,62,0.15)", color: "#FC8181", fontSize: 15, fontWeight: 600, fontFamily: "inherit", marginTop: 8 }}>
          🚪 {t("settings.logout")}
        </button>
      </div>

      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
