import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api";
import { useAuthStore } from "../store";
import { t } from "../i18n";
import "./LoginPage.css";

// QQ 登录配置

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleQQLogin = () => {
    const appId = import.meta.env["VITE_QQ_APP_ID"] as string | undefined;
    if (!appId) {
      setError("QQ 登录尚未配置");
      return;
    }

    const state = Math.random().toString(36).substring(2, 15);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const redirectUri = isMobile
      ? "hyperone://oauth/callback?provider=qq"
      : `${window.location.origin}/oauth/callback?provider=qq`;
    const url = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    window.location.href = url;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const token = res.data?.accessToken;
      if (!token) {
        setError("Login failed");
        return;
      }
      setAuth(token, res.data?.user);
      window.location.hash = "#/";
    } catch (e: any) {
      if (e?.message?.includes("Network")) setError(t("auth.networkErr"));
      else if (e?.response?.status === 401) setError(t("auth.wrongPwd"));
      else setError(e?.message || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-v2">
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="ocean-bubble" />
          ))}
        </div>
      </div>

      <div className="login-card-v2">
        {/* Logo */}
        <div className="login-logo-v2">
          <span className="login-fish-v2">🐠</span>
          <h1 className="login-title-v2">{t("home.appName")}</h1>
          <p className="login-subtitle-v2">{t("app.slogan")}</p>
        </div>

        {/* Form */}
        <form className="login-form-v2" onSubmit={handleLogin}>
          <div className="login-input-group-v2">
            <div className="login-input-wrap-v2">
              <span className="login-input-icon-v2">📧</span>
              <input
                className="login-input-v2"
                type="email"
                placeholder={t("auth.placeholderEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>
            <div className="login-input-wrap-v2">
              <span className="login-input-icon-v2">🔒</span>
              <input
                className="login-input-v2"
                type={showPwd ? "text" : "password"}
                placeholder={t("auth.placeholderPwd")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-pwd-toggle-v2"
                onClick={() => setShowPwd(!showPwd)}
                aria-label={showPwd ? "隐藏密码" : "显示密码"}
              >
                {showPwd ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-v2" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? t("auth.loggingIn") : `🌊 ${t("auth.loginBtn")}`}
          </button>
        </form>

        {error && <div className="login-error-v2">{error}</div>}

        <div className="login-links-v2">
          <Link to="/register" className="login-link-v2">🚀 {t("auth.noAccount")}</Link>
          <Link to="/forgot-password" className="login-link-v2">🌊 {t("auth.forgotPwd")}</Link>
        </div>

        <div className="login-divider-v2">
          <span className="login-divider-line-v2" />
          <span>── 第三方登录 ──</span>
          <span className="login-divider-line-v2" />
        </div>

        <div className="login-social-v2">
          <button
            className="login-social-btn-v2 login-social-btn-qq"
            aria-label="QQ登录"
            onClick={handleQQLogin}
          >
            <img src="https://static-res.qq.com/static-res/imqq/qq-logo.png" alt="QQ" width="22" height="22" />
          </button>
        </div>
      </div>

      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
