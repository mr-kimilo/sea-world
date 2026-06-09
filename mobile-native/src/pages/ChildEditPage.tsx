import { useEffect, useState } from "react";
import { useFamilyStore } from "../store";
import { familyApi } from "../api";
import { t } from "../i18n";

const AVATARS = ["🧒", "👦", "👧", "🐱", "🐶", "🦊", "🐸", "🐼"];
const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

function YearMonthPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const now = new Date();
  const [y, m] = value ? value.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const curYear = y || now.getFullYear();
  const curMonth = m || now.getMonth() + 1;
  const apply = (year: number, month: number) => {
    onChange(`${year}-${String(month).padStart(2,"0")}-01`);
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t("childEdit.year")}</span>
        <button onClick={() => apply(curYear - 1, curMonth)}
          style={{ border: "none", background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", color: "#fff" }}>‹</button>
        <span style={{ fontSize: 18, fontWeight: 700, minWidth: 52, textAlign: "center", color: "#fff" }}>{curYear}</span>
        <button onClick={() => apply(curYear + 1, curMonth)}
          style={{ border: "none", background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", color: "#fff" }}>›</button>
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {MONTHS.map((label, i) => (
          <button key={i} onClick={() => apply(curYear, i + 1)}
            style={{ flexShrink: 0, padding: "8px 10px", borderRadius: 8, border: curMonth === i + 1 ? "1px solid rgba(0,180,216,0.5)" : "0.5px solid rgba(255,255,255,0.1)", background: curMonth === i + 1 ? "rgba(0,119,182,0.3)" : "rgba(255,255,255,0.06)", fontSize: 12, fontFamily: "inherit", color: "#fff" }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChildEditPage() {
  const { selectedFamilyId, children, selectChild, setChildren } = useFamilyStore();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [birthDate, setBirthDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fid = selectedFamilyId;
  const kidId = new URLSearchParams(window.location.hash.split("?")[1] || "").get("id");
  const kids = fid ? children[fid] || [] : [];
  const kid = kids.find(k => k.id === kidId);

  useEffect(() => {
    if (kid) {
      setName(kid.name || "");
      setAvatar(kid.avatar || kid.avatarUrl || AVATARS[0]);
      setBirthDate((kid as any).birthDate || "");
    }
  }, [kid?.id]);

  const handleSave = async () => {
    if (!fid || !kidId || !name.trim()) return;
    setSaving(true);
    try {
      const updatedData = { name: name.trim(), avatar, birthDate: birthDate || undefined } as any;
      await familyApi.updateChild(fid, kidId, updatedData);
      const updated = kids.map(c => c.id === kidId ? { ...c, name: name.trim(), avatar } : c);
      setChildren(fid, updated);
      selectChild(kidId);
      setTimeout(() => window.history.back(), 50);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!fid || !kidId) return;
    if (!confirm(t("childEdit.deleteConfirm"))) return;
    setDeleting(true);
    try {
      await familyApi.deleteChild(fid, kidId);
      const remaining = kids.filter(c => c.id !== kidId);
      setChildren(fid, remaining);
      if (remaining.length > 0) selectChild(remaining[0].id);
      setTimeout(() => window.history.back(), 50);
    } catch {} finally { setDeleting(false); }
  };

  return (
    <div className="home-v2">
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>

      <nav className="home-nav-v2">
        <span className="home-nav-title">{kid ? "✏️ " + t("childEdit.title") : "👶 " + t("childEdit.addTitle")}</span>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Avatar */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 72, display: "inline-block", background: "rgba(255,255,255,0.08)", borderRadius: "50%", width: 100, height: 100, lineHeight: "100px", marginBottom: 8 }}>{avatar}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{t("childEdit.avatar")}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
          {AVATARS.map(a => (
            <button key={a} onClick={() => setAvatar(a)}
              style={{ width: 48, height: 48, borderRadius: 14, fontSize: 24, border: avatar === a ? "2px solid rgba(0,180,216,0.6)" : "1px solid rgba(255,255,255,0.1)", background: avatar === a ? "rgba(0,119,182,0.3)" : "rgba(255,255,255,0.06)", fontFamily: "inherit" }}>
              {a}
            </button>
          ))}
        </div>

        {/* Name */}
        <div className="child-card-v2" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("childEdit.name")}</div>
          <input className="points-input-v2" placeholder={t("childEdit.namePlaceholder")} value={name} onChange={e => setName(e.target.value)} />
        </div>

        {/* Birth Date */}
        {kid && (
          <div className="child-card-v2" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("childEdit.birthDate")}</div>
            <YearMonthPicker value={birthDate} onChange={setBirthDate} />
          </div>
        )}

        {/* Save */}
        <button className="login-submit-v2" style={{ marginBottom: 10 }} disabled={saving || !name.trim()} onClick={handleSave}>
          {saving ? "..." : `🌊 ${kid ? t("childEdit.save") : t("childEdit.addBtn")}`}
        </button>

        {/* Delete */}
        {kid && (
          <button style={{ width: "100%", padding: 14, border: "none", borderRadius: 16, background: "rgba(229,62,62,0.15)", color: "#FC8181", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }} disabled={deleting} onClick={handleDelete}>
            🗑️ {deleting ? t("childEdit.deleting") : t("childEdit.delete")}
          </button>
        )}
      </div>

      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
