import { useSearchParams, useNavigate } from "react-router-dom";
import { t } from "../i18n";

export default function ErrorPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const type = params.get("type") || "unknown";
  const detail = params.get("detail") || "";
  const isNetwork = type === "network";

  return (
    <div className="home-v2" style={{ minHeight: "100vh" }}>
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{isNetwork ? "📡" : "🌊"}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
          {isNetwork ? t("error.networkTitle") : t("error.unknownTitle")}
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 20, whiteSpace: "pre-line" }}>
          {isNetwork ? t("error.networkDesc") : t("error.unknownDesc")}
        </p>
        {detail && (
          <p style={{ fontSize: 12, color: "#FC8181", marginBottom: 16, padding: "8px 12px", background: "rgba(229,62,62,0.1)", borderRadius: 8, wordBreak: "break-all", maxWidth: "100%" }}>{detail}</p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
          <button className="login-submit-v2" onClick={() => nav("/")}>
            🌊 {t("error.backHome")}
          </button>
          {isNetwork && (
            <button className="login-submit-v2" style={{ background: "rgba(255,255,255,0.1)", boxShadow: "none" }} onClick={() => window.location.reload()}>
              🔄 {t("error.retry")}
            </button>
          )}
        </div>
      </div>
      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
