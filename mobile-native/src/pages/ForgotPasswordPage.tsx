import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api";
import { t } from "../i18n";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await authApi.forgotPassword(email); setMsg(t("auth.codeSent")); setStep("code"); }
    catch { setError(t("auth.notRegistered")); }
    finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (newPassword.length < 6) { setError(t("auth.pwdShort")); return; }
    setLoading(true);
    try { await authApi.resetPassword(email, code, newPassword); setMsg(t("auth.resetOk")); setStep("email"); }
    catch { setError(t("auth.codeWrong")); }
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
        <span className="login-fish-v2" style={{ fontSize: 48 }}>🔐</span>
        <h1 className="login-title-v2">{t("auth.forgotPwd")}</h1>
        <p className="login-subtitle-v2">{step === "email" ? t("auth.enterEmail") : t("auth.enterCode")}</p>
      </div>

      {step === "email" ? (
        <form className="login-form-v2" onSubmit={handleSendCode}>
          <div className="login-input-group-v2">
            <div className="login-input-wrap-v2">
              <span className="login-input-icon-v2">📧</span>
              <input className="login-input-v2" type="email" placeholder={t("auth.placeholderEmailReg")} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="login-submit-v2" disabled={loading}>
            {loading ? t("auth.sending") : `🌊 ${t("auth.sendCode")}`}
          </button>
        </form>
      ) : (
        <form className="login-form-v2" onSubmit={handleReset}>
          <div className="login-input-group-v2">
            <div className="login-input-wrap-v2">
              <span className="login-input-icon-v2">🔢</span>
              <input className="login-input-v2" placeholder={t("auth.placeholderCode")} value={code} onChange={e => setCode(e.target.value)} maxLength={6} />
            </div>
            <div className="login-input-wrap-v2">
              <span className="login-input-icon-v2">🔒</span>
              <input className="login-input-v2" type="password" placeholder={t("auth.placeholderNewPwd")} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="login-submit-v2" disabled={loading}>
            {loading ? t("auth.resetting") : `🌊 ${t("auth.resetPwd")}`}
          </button>
        </form>
      )}
      {msg && <div className="login-error-v2" style={{ background: "rgba(52,199,89,0.15)", color: "#68D391", border: "0.5px solid rgba(52,199,89,0.2)" }}>{msg}</div>}
      {error && <div className="login-error-v2">{error}</div>}
      <div className="login-links-v2"><Link to="/login" className="login-link-v2">{t("auth.backLogin")}</Link></div>
      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
