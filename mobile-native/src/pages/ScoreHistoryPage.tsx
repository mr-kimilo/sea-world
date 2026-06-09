import { useEffect, useState } from "react";
import { useFamilyStore } from "../store";
import { scoreApi, categoryApi } from "../api";
import { t } from "../i18n";

type ScoreRecord = { id: string; category: string; score: number; reason: string; createdAt: string };
const CATS = [
  { key: "intelligence", emoji: "🧠", label: t("points.categoryLabels.intelligence") },
  { key: "physical", emoji: "💪", label: t("points.categoryLabels.physical") },
  { key: "moral", emoji: "❤️", label: t("points.categoryLabels.moral") },
  { key: "hygiene", emoji: "🫧", label: t("points.categoryLabels.hygiene") },
  { key: "handcraft", emoji: "🛠️", label: t("points.categoryLabels.handcraft") },
];

function FilterSheet({ show, onClose, cats, selected, onSelect }: {
  show: boolean; onClose: () => void;
  cats: typeof CATS; selected: string; onSelect: (k: string) => void;
}) {
  if (!show) return null;
  return (
    <div className="sheet-overlay shop-sheet-v2" onClick={onClose}>
      <div className="sheet-mask" />
      <div className="sheet-body" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "8px 0 4px" }}>{t("history.selectDim")}</div>
        <button className={"sheet-item" + (selected === "all" ? " selected" : "")} onClick={() => { onSelect("all"); onClose(); }}>
          <span style={{ fontSize: 20 }}>📋</span> {t("history.all")}
          {selected === "all" && <span className="sheet-check">✓</span>}
        </button>
        {cats.map(c => (
          <button key={c.key} className={"sheet-item" + (selected === c.key ? " selected" : "")} onClick={() => { onSelect(c.key); onClose(); }}>
            <span style={{ fontSize: 20 }}>{c.emoji}</span> {c.label}
            {selected === c.key && <span className="sheet-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ScoreHistoryPage() {
  const { selectedFamilyId, children, selectedChildId, selectChild } = useFamilyStore();
  const [tab, setTab] = useState<"history" | "dimensions">("history");
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [cats, setCats] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [filterCat, setFilterCat] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("⭐");

  const fid = selectedFamilyId; const cid = selectedChildId;
  const kids = fid ? children[fid] || [] : [];

  useEffect(() => {
    if (!fid || !cid) return;
    scoreApi.list(fid, cid, 0, 100).then(res => setRecords(res.data?.content ?? [])).catch(() => {});
    categoryApi.list().then(res => setCats(res.data ?? [])).catch(() => {});
  }, [fid, cid]);

  const filtered = filterCat === "all" ? records : records.filter(r => r.category === filterCat);
  const curLabel = filterCat === "all" ? t("history.all") : CATS.find(c => c.key === filterCat)?.label || filterCat;
  const totalPoints = filtered.reduce((s, r) => s + r.score, 0);

  const formatTime = (ts: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return t("history.justNow");
    if (diff < 3600000) return Math.floor(diff / 60000) + t("history.minutesAgo");
    if (diff < 86400000) return Math.floor(diff / 3600000) + t("history.hoursAgo");
    if (diff < 172800000) return t("history.yesterday");
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  const handleAdd = async () => {
    if (!newCatName.trim()) return;
    try { await categoryApi.create(newCatName.trim(), newCatIcon); setNewCatName(""); setNewCatIcon("⭐"); categoryApi.list().then(res => setCats(res.data ?? [])); } catch {}
  };
  const handleDel = async (id: string) => {
    if (!confirm(t("history.delete"))) return;
    try { await categoryApi.remove(id); categoryApi.list().then(res => setCats(res.data ?? [])); } catch {}
  };

  return (
    <div className="points-v2">
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>

      {/* Child Switcher */}
      {kids.length > 0 && (
        <div className="shop-child-scroll-v2" style={{ paddingTop: 12 }}>
          {kids.map(c => (
            <button key={c.id} onClick={() => selectChild(c.id)}
              className={"shop-child-chip-v2" + (c.id === cid ? " active" : "")}>
              <span className="shop-child-chip-avatar-v2">{c.avatar || "🧒"}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Segmented Tabs */}
      <div style={{ padding: "0 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.08)", borderRadius: 9, padding: 2 }}>
          <button onClick={() => setTab("history")}
            style={{ flex: 1, padding: "6px 0", border: "none", borderRadius: 7, background: tab === "history" ? "rgba(255,255,255,0.15)" : "transparent", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#fff" }}>
            📋 {t("history.title")}
          </button>
          <button onClick={() => setTab("dimensions")}
            style={{ flex: 1, padding: "6px 0", border: "none", borderRadius: 7, background: tab === "dimensions" ? "rgba(255,255,255,0.15)" : "transparent", fontSize: 13, fontWeight: 500, fontFamily: "inherit", color: "#fff" }}>
            🏷️ {t("history.dimensions")}
          </button>
        </div>
      </div>

      {tab === "history" ? (
        <div style={{ padding: "0 16px" }}>
          {/* Filter + Summary */}
          <div className="points-section-card-v2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}>
            <button onClick={() => setShowFilter(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", fontSize: 14, fontFamily: "inherit", color: "rgba(255,255,255,0.7)", padding: 0 }}>
              📋 {curLabel} <span style={{ fontSize: 12, opacity: 0.5 }}>›</span>
            </button>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              {filtered.length} {t("history.items")} · <span style={{ color: totalPoints >= 0 ? "#2D6A4F" : "#E53E3E", fontWeight: 600 }}>{totalPoints >= 0 ? "+" : ""}{totalPoints}</span>
            </span>
          </div>

          {/* Records */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "rgba(255,255,255,0.3)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 15 }}>{t("history.noRecords")}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{t("history.goRecord")}</div>
            </div>
          ) : (
            <div className="points-records-v2">
              {filtered.map(r => (
                <div key={r.id} className="points-record-item-v2">
                  <div className={`points-record-dot-v2 ${r.score >= 0 ? "positive" : "negative"}`} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{r.reason}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{formatTime(r.createdAt)}</div>
                  </div>
                  <span className={`points-record-score-v2 ${r.score >= 0 ? "positive" : "negative"}`}>
                    {r.score >= 0 ? "+" : ""}{r.score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: "0 16px" }}>
          {/* Add Dimension */}
          <div className="points-entry-card-v2">
            <div className="points-entry-title-v2">➕ {t("history.newDim")}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="points-input-v2" placeholder={t("history.dimName")} value={newCatName} onChange={e => setNewCatName(e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
              <input className="points-input-v2" placeholder="⭐" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} style={{ width: 56, textAlign: "center", marginBottom: 0 }} />
              <button className="shop-form-btn-v2" style={{ padding: "10px 16px", fontSize: 14, flexShrink: 0 }} onClick={handleAdd}>{t("history.add")}</button>
            </div>
          </div>

          {/* Dimension List */}
          {cats.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "rgba(255,255,255,0.3)" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏷️</div>
              <div style={{ fontSize: 14 }}>{t("history.noCustomDim")}</div>
            </div>
          ) : (
            cats.map(c => (
              <div key={c.id} className="points-section-card-v2" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                <span style={{ fontSize: 28, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", borderRadius: 12 }}>{c.icon}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>{c.name}</span>
                <button className="shop-form-btn-v2 danger" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => handleDel(c.id)}>🗑️</button>
              </div>
            ))
          )}
        </div>
      )}

      <FilterSheet show={showFilter} onClose={() => setShowFilter(false)} cats={CATS} selected={filterCat} onSelect={setFilterCat} />
      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
