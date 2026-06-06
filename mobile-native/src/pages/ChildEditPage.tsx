import { useEffect, useState } from "react";
import { useFamilyStore } from "../store";
import { familyApi } from "../api";
import { t } from "../i18n";

const AVATARS = ["🧒", "👦", "👧", "🐱", "🐶", "🦊", "🐸", "🐼"];
const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

function YearMonthPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const now = new Date();
  const [y, m, d] = value ? value.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1, 1];
  const curYear = y || now.getFullYear();
  const curMonth = m || now.getMonth() + 1;

  const apply = (year: number, month: number, day: number) => {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${year}-${mm}-${dd}`);
  };

  return (
    <div>
      {/* Year quick-jump */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: "var(--muted)", minWidth: 20 }}>{t("childEdit.year")}</span>
        <button onClick={() => apply(curYear - 10, curMonth, 1)}
          style={{ border: "none", background: "rgba(118,118,128,0.08)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "inherit" }}>«</button>
        <button onClick={() => apply(curYear - 1, curMonth, 1)}
          style={{ border: "none", background: "rgba(118,118,128,0.08)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "inherit" }}>‹</button>
        <span style={{ fontSize: 20, fontWeight: 700, minWidth: 56, textAlign: "center" }}>{curYear}</span>
        <button onClick={() => apply(curYear + 1, curMonth, 1)}
          style={{ border: "none", background: "rgba(118,118,128,0.08)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "inherit" }}>›</button>
        <button onClick={() => apply(curYear + 10, curMonth, 1)}
          style={{ border: "none", background: "rgba(118,118,128,0.08)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "inherit" }}>»</button>
      </div>
      {/* Month row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: "var(--muted)", minWidth: 20 }}>{t("childEdit.month")}</span>
        <div style={{ display: "flex", gap: 4, flex: 1, overflowX: "auto" }}>
          {MONTHS.map((label, i) => (
            <button key={i} onClick={() => apply(curYear, i + 1, 1)}
              style={{ flexShrink: 0, padding: "8px 10px", borderRadius: 8, border: curMonth === i + 1 ? "1.5px solid var(--active)" : "1px solid var(--line)", background: curMonth === i + 1 ? "var(--active-bg)" : "#fff", fontSize: 12, fontFamily: "inherit", color: curMonth === i + 1 ? "var(--active)" : "#555", fontWeight: curMonth === i + 1 ? 600 : 400 }}>{label}</button>
          ))}
        </div>
      </div>
      {/* Day: direct input */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: "var(--muted)", minWidth: 20 }}>{t("childEdit.day")}</span>
        <input type="number" min={1} max={31} value={d || ""} placeholder="1"
          onChange={e => { const nd = parseInt(e.target.value) || 1; apply(curYear, curMonth, Math.min(31, Math.max(1, nd))); }}
          className="apple-input" style={{ width: 80, textAlign: "center" }} />
        {value && <span style={{ fontSize: 13, color: "var(--muted)" }}>{value}</span>}
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
      // Update store directly for immediate refresh on back-navigation
      const updated = kids.map(c => c.id === kidId ? { ...c, name: name.trim(), avatar } : c);
      setChildren(fid, updated);
      selectChild(kidId);
      // Small delay to let React flush store update before navigation
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
    <div className="page-padded">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <a href="#/child" style={{ fontSize: 18, textDecoration: "none", color: "var(--active)" }}>
          ‹ {t("childEdit.back")}
        </a>
        <span style={{ fontSize: 18, fontWeight: 700 }}>
          {kid ? t("childEdit.title") : t("childEdit.addTitle")}
        </span>
      </div>

      {/* Avatar Picker */}
      <div className="apple-card">
        <div className="section-title">{t("childEdit.avatar")}</div>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 64, display: "inline-block" }}>{avatar}</span>
        </div>
        <div className="avatar-grid">
          {AVATARS.map(a => (
            <button key={a} className={"avatar-option" + (avatar === a ? " on" : "")} onClick={() => setAvatar(a)}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="apple-card">
        <div className="section-title">{t("childEdit.name")}</div>
        <input className="apple-input" placeholder={t("childEdit.namePlaceholder")} value={name} onChange={e => setName(e.target.value)} />
      </div>

      {/* Birth Date */}
      {kid && (
        <div className="apple-card">
          <div className="section-title">{t("childEdit.birthDate")}</div>
          <YearMonthPicker value={birthDate} onChange={setBirthDate} />
        </div>
      )}

      {/* Save */}
      <button className="apple-btn" style={{ width: "100%", marginTop: 8 }} disabled={saving || !name.trim()} onClick={handleSave}>
        {saving ? t("childEdit.saving") : kid ? t("childEdit.save") : t("childEdit.addBtn")}
      </button>

      {/* Delete */}
      {kid && (
        <button className="apple-btn danger" style={{ width: "100%", marginTop: 12 }} disabled={deleting} onClick={handleDelete}>
          {deleting ? t("childEdit.deleting") : t("childEdit.delete")}
        </button>
      )}
    </div>
  );
}
