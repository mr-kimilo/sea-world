import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api";
import { useAuthStore } from "../store";
import { t } from "../i18n";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const token = res.data?.accessToken;
      if (!token) { setError("Login failed"); return; }
      setAuth(token, res.data?.user);
      window.location.hash = "#/";
    } catch (e: any) {
      if (e?.message?.includes("Network")) setError(t("auth.networkErr"));
      else if (e?.response?.status === 401) setError(t("auth.wrongPwd"));
      else setError(e?.message || "");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>SeaWorld</h1>
        <p>{t("auth.loginTitle")}</p>
      </div>
      <form onSubmit={handleLogin}>
        <div className="auth-input-group">
          <div className="auth-input-row">
            <span className="auth-input-label">{t("auth.email")}</span>
            <input type="email" placeholder={t("auth.placeholderEmail")} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="auth-input-row">
            <span className="auth-input-label">{t("auth.password")}</span>
            <input type="password" placeholder={t("auth.placeholderPwd")} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
        </div>
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? t("auth.loggingIn") : t("auth.loginBtn")}
        </button>
      </form>
      {error && <div className="auth-error">{error}</div>}
      <div className="auth-links">
        <Link to="/register">{t("auth.noAccount")}</Link>
        <Link to="/forgot-password">{t("auth.forgotPwd")}</Link>
      </div>
    </div>
  );
}
