import { useEffect } from "react";
import { useAuthStore, useFamilyStore } from "../store";
import { familyApi } from "../api";
import { t } from "../i18n";

const AVATARS = ["🧒", "👦", "👧", "🐱", "🐶", "🦊", "🐸", "🐼"];

export default function HomePage() {
  const token = useAuthStore((s) => s.token);
  return token ? <Dashboard /> : <Landing />;
}

function Dashboard() {
  const { selectedFamilyId, selectedChildId, selectChild, children, setFamilies, setChildren } = useFamilyStore();

  const fid = selectedFamilyId;
  const cid = selectedChildId;
  const kids = fid ? children[fid] || [] : [];

  useEffect(() => {
    if (!fid) {
      familyApi.mine().then(res => {
        const families: any[] = res.data ?? [];
        setFamilies(families);
        if (families.length > 0) {
          const f = families[0];
          familyApi.children(f.id).then(r => {
            setChildren(f.id, (r.data ?? []) as any);
          }).catch(() => {});
        }
      }).catch(() => {});
    } else if (kids.length === 0 && fid) {
      familyApi.children(fid).then(r => {
        setChildren(fid, (r.data ?? []) as any);
      }).catch(() => {});
    }
  }, []);

  return (
    <div>
      <div className="landing-hero" style={{ marginBottom: 20 }}>
        <img src="/favicon.svg" alt="HyperOne" className="landing-emoji" style={{ width: 56, height: 56 }} />
        <h1 style={{ fontSize: 28 }}>HyperOne</h1>
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{t("home.subtitle")}</p>
      </div>

      {/* Child Switcher (if logged in with children) */}
      {kids.length > 0 && (
        <div className="apple-card" style={{ padding: "12px 16px", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {kids.map(c => (
              <button key={c.id} onClick={() => selectChild(c.id)}
                style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 16px", borderRadius: 14, border: c.id === cid ? "2px solid var(--active)" : "2px solid transparent", background: c.id === cid ? "var(--active-bg)" : "rgba(118,118,128,0.06)", fontFamily: "inherit" }}>
                <span style={{ fontSize: 28 }}>{c.avatar || AVATARS[0]}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>⭐{c.totalScore ?? "?"}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feature Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <a href="#/points" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <div className="feature-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 36 }}>⭐</span>
            <div>
              <h3 style={{ fontSize: 17 }}>{t("home.points")}</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>{t("home.pointsDesc")}</p>
            </div>
          </div>
        </a>
        <a href="#/child" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <div className="feature-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 36 }}>🧒</span>
            <div>
              <h3 style={{ fontSize: 17 }}>{t("home.corrector")}</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>{t("home.correctorDesc")}</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="landing-page-inline">
      <div className="landing-hero">
        <img src="/favicon.svg" alt="HyperOne" className="landing-emoji" style={{ width: 56, height: 56 }} />
        <h1>HyperOne</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{t("home.subtitle")}</p>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
          {t("app.slogan")}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <a href="#/login" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="feature-card">
            <span className="feature-icon">⭐</span>
            <h3>{t("home.points")}</h3>
            <p>{t("home.pointsDesc")}</p>
          </div>
        </a>
        <a href="#/child" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="feature-card">
            <span className="feature-icon">🧒</span>
            <h3>{t("home.corrector")}</h3>
            <p>{t("home.correctorDesc")}</p>
          </div>
        </a>
      </div>
      <a href="#/login" className="auth-btn" style={{ display: "flex", textDecoration: "none", marginTop: 16 }}>
        {t("home.start")}
      </a>
    </div>
  );
}
