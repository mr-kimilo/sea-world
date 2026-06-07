import { useSearchParams, useNavigate } from "react-router-dom";
import { t } from "../i18n";

/**
 * 错误页面 — 支持两种模式：
 *   type=network  → 网络不通 / 无法连接
 *   type=unknown  → 未知错误（兜底）
 */
export default function ErrorPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const type = params.get("type") || "unknown";
  const detail = params.get("detail") || "";

  const isNetwork = type === "network";

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon">{isNetwork ? "📡" : "⚠️"}</div>
        <h2 className="error-title">
          {isNetwork ? t("error.networkTitle") : t("error.unknownTitle")}
        </h2>
        <p className="error-desc">
          {isNetwork ? t("error.networkDesc") : t("error.unknownDesc")}
        </p>
        {detail && (
          <p className="error-detail">{detail}</p>
        )}
        <div className="error-actions">
          <button className="auth-btn" onClick={() => nav("/")}>
            {t("error.backHome")}
          </button>
          {isNetwork && (
            <button
              className="auth-btn"
              style={{ background: "var(--cream)", color: "var(--active)", border: "1px solid var(--active)" }}
              onClick={() => window.location.reload()}
            >
              {t("error.retry")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
