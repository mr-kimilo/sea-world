import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api";
import { useAuthStore } from "../store";
import { t } from "../i18n";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
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
    <div className="login-v2">
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>

      <div className="login-logo-v2">
        <span className="login-fish-v2">🐠</span>
        <h1 className="login-title-v2">{t("auth.register")}</h1>
        <p className="login-subtitle-v2">{t("auth.registerTitle")}</p>
      </div>

      <form className="login-form-v2" onSubmit={handleRegister}>
        <div className="login-input-group-v2">
          <div className="login-input-wrap-v2">
            <span className="login-input-icon-v2">📧</span>
            <input className="login-input-v2" type="email" placeholder={t("auth.placeholderEmailReg")} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="login-input-wrap-v2">
            <span className="login-input-icon-v2">🔒</span>
            <input className="login-input-v2" type={showPwd ? "text" : "password"} placeholder={t("auth.placeholderPwdReg")} value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" className="login-pwd-toggle-v2" onClick={() => setShowPwd(!showPwd)}>{showPwd ? "🙈" : "👁"}</button>
          </div>
          <div className="login-input-wrap-v2">
            <span className="login-input-icon-v2">✓</span>
            <input className="login-input-v2" type={showPwd ? "text" : "password"} placeholder={t("auth.placeholderConfirm")} value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="login-submit-v2" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? t("auth.registering") : `🚀 ${t("auth.registerBtn")}`}
        </button>
      </form>
      {error && <div className="login-error-v2">{error}</div>}
      <div className="login-links-v2"><Link to="/login" className="login-link-v2">{t("auth.hasAccount")}</Link></div>
      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
