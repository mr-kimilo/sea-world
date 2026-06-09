import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api";
import { useAuthStore } from "../store";
import { t } from "../i18n";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);

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
      {/* Ocean Background — reuse the same ocean-bg class from home */}
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="ocean-bubble" />
          ))}
        </div>
      </div>

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

      {/* Error */}
      {error && <div className="login-error-v2">{error}</div>}

      {/* Links */}
      <div className="login-links-v2">
        <Link to="/register" className="login-link-v2">
          🚀 {t("auth.noAccount")}
        </Link>
        <Link to="/forgot-password" className="login-link-v2">
          🌊 {t("auth.forgotPwd")}
        </Link>
      </div>

      {/* Divider */}
      <div className="login-divider-v2">
        <span className="login-divider-line-v2" />
        <span>── 海洋相遇 ──</span>
        <span className="login-divider-line-v2" />
      </div>

      {/* Social Login */}
      <div className="login-social-v2">
        <button className="login-social-btn-v2" aria-label="微信登录" style={{ color: "#07C160" }}>💬</button>
        <button className="login-social-btn-v2" aria-label="QQ登录" style={{ color: "#12B7F5" }}>🐧</button>
        <button className="login-social-btn-v2" aria-label="手机登录" style={{ color: "#FF6B6B" }}>📱</button>
      </div>

      {/* Wave */}
      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
