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
    <div>
      <h1 className="page-title">{t("settings.title")}</h1>

      <div className="set-card">
        <div className="set-user">
          <span className="set-avatar">🧑</span>
          <span className="set-email">{user?.email ?? t("settings.notLoggedIn")}</span>
        </div>
      </div>

      <div className="set-card">
        <h4>{t("settings.language")}</h4>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className={"gender-btn" + (lang === "zh" ? " on" : "")} onClick={() => setLang("zh")}>中文</button>
          <button className={"gender-btn" + (lang === "en" ? " on" : "")} onClick={() => setLang("en")}>English</button>
        </div>
      </div>

      <div className="set-card">
        <h4>{t("settings.about")}</h4>
        <p>{t("settings.version")}</p>
        <p>{t("app.slogan")}</p>
      </div>

      <button className="btn-logout" onClick={handleLogout}>{t("settings.logout")}</button>
    </div>
  );
}
