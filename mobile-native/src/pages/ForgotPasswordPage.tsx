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
    <div className="auth-page">
      <div className="auth-header">
        <h1>{t("auth.forgotPwd")}</h1>
        <p>{step === "email" ? t("auth.enterEmail") : t("auth.enterCode")}</p>
      </div>
      {step === "email" ? (
        <form onSubmit={handleSendCode}>
          <div className="auth-input-group">
            <div className="auth-input-row">
              <span className="auth-input-label">{t("auth.email")}</span>
              <input type="email" placeholder={t("auth.placeholderEmailReg")} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? t("auth.sending") : t("auth.sendCode")}</button>
        </form>
      ) : (
        <form onSubmit={handleReset}>
          <div className="auth-input-group">
            <div className="auth-input-row">
              <span className="auth-input-label">{t("auth.code")}</span>
              <input placeholder={t("auth.placeholderCode")} value={code} onChange={e => setCode(e.target.value)} maxLength={6} />
            </div>
            <div className="auth-input-row">
              <span className="auth-input-label">{t("auth.newPwd")}</span>
              <input type="password" placeholder={t("auth.placeholderNewPwd")} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? t("auth.resetting") : t("auth.resetPwd")}</button>
        </form>
      )}
      {msg && <div className="auth-error" style={{background:"rgba(52,199,89,0.08)",color:"#34c759"}}>{msg}</div>}
      {error && <div className="auth-error">{error}</div>}
      <div className="auth-links"><Link to="/login">{t("auth.backLogin")}</Link></div>
    </div>
  );
}
