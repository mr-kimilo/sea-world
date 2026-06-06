import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api";
import { useAuthStore } from "../store";
import { t } from "../i18n";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (password !== confirm) { setError(t("auth.pwdMismatch")); return; }
    if (password.length < 6) { setError(t("auth.pwdShort")); return; }
    setLoading(true);
    try {
      const res = await authApi.register(email, password);
      setAuth(res.data.accessToken, res.data.user);
      window.location.hash = "#/";
    } catch { setError(t("auth.regFail")); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>{t("auth.register")}</h1>
        <p>{t("auth.registerTitle")}</p>
      </div>
      <form onSubmit={handleRegister}>
        <div className="auth-input-group">
          <div className="auth-input-row">
            <span className="auth-input-label">{t("auth.email")}</span>
            <input type="email" placeholder={t("auth.placeholderEmailReg")} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="auth-input-row">
            <span className="auth-input-label">{t("auth.password")}</span>
            <input type="password" placeholder={t("auth.placeholderPwdReg")} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="auth-input-row">
            <span className="auth-input-label">{t("auth.confirmPwd")}</span>
            <input type="password" placeholder={t("auth.placeholderConfirm")} value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? t("auth.registering") : t("auth.registerBtn")}
        </button>
      </form>
      {error && <div className="auth-error">{error}</div>}
      <div className="auth-links"><Link to="/login">{t("auth.hasAccount")}</Link></div>
    </div>
  );
}
