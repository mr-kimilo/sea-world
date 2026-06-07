import { useEffect, useState } from "react";
import { useFamilyStore } from "../store";
import { scoreApi, categoryApi } from "../api";
import { t } from "../i18n";

type ScoreRecord = { id: string; category: string; score: number; reason: string; createdAt: string };
const CATS = [
  { key: "intelligence", emoji: "\uD83E\uDDE0", label: t("points.categoryLabels.intelligence") },
  { key: "physical", emoji: "\uD83D\uDCAA", label: t("points.categoryLabels.physical") },
  { key: "moral", emoji: "\u2764\uFE0F", label: t("points.categoryLabels.moral") },
  { key: "hygiene", emoji: "\uD83E\uDEA7", label: t("points.categoryLabels.hygiene") },
  { key: "handcraft", emoji: "\uD83D\uDEE0\uFE0F", label: t("points.categoryLabels.handcraft") },
];
const COLORS: Record<string, string> = { intelligence: "#007aff", physical: "#34c759", moral: "#ff9500", hygiene: "#5ac8fa", handcraft: "#af52de" };

function FilterSheet({ show, onClose, cats, selected, onSelect }: { show: boolean; onClose: () => void; cats: { key: string; emoji: string; label: string }[]; selected: string; onSelect: (k: string) => void }) {
  if (!show) return null;
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-mask" />
      <div className="sheet-body" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "center", padding: "8px 0 4px" }}>{t("history.selectDim")}</div>
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
    <div className="page-padded">
      {kids.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 2 }}>
          {kids.map(c => (
            <button key={c.id} onClick={() => selectChild(c.id)}
              style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 14px", borderRadius: 14, border: c.id === cid ? "2px solid var(--active)" : "2px solid transparent", background: c.id === cid ? "var(--active-bg)" : "rgba(118,118,128,0.06)", fontFamily: "inherit" }}>
              <span style={{ fontSize: 22 }}>{c.avatar || "🧒"}</span>
              <span style={{ fontSize: 11, fontWeight: 500 }}>{c.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="segmented">
        <button className={tab === "history" ? "on" : ""} onClick={() => setTab("history")}>{t("history.title")}</button>
        <button className={tab === "dimensions" ? "on" : ""} onClick={() => setTab("dimensions")}>{t("history.dimensions")}</button>
      </div>

      {tab === "history" ? (
        <>
          <div className="apple-card" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => setShowFilter(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", fontSize: 15, fontFamily: "inherit", color: "var(--ink)", padding: 0 }}>
              📋 {curLabel} <span style={{ color: "var(--muted)", fontSize: 13 }}>›</span>
            </button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {filtered.length} {t("history.items")} · <span style={{ color: totalPoints >= 0 ? "#34c759" : "#ff3b30", fontWeight: 600 }}>{totalPoints >= 0 ? "+" : ""}{totalPoints}</span>
            </span>
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 15 }}>{t("history.noRecords")}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{t("history.goRecord")}</div>
            </div>
          )}
          {filtered.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "0.5px solid var(--line)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: COLORS[r.category] || "#ccc", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15 }}>{r.reason}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{formatTime(r.createdAt)}</div>
              </div>
              <span style={{ fontWeight: 600, fontSize: 16, color: r.score > 0 ? "#34c759" : "#ff3b30", flexShrink: 0 }}>{r.score > 0 ? "+" : ""}{r.score}</span>
            </div>
          ))}
        </>
      ) : (
        <>
          <div className="apple-card">
            <div className="section-title">{t("history.newDim")}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="apple-input" placeholder={t("history.dimName")} value={newCatName} onChange={e => setNewCatName(e.target.value)} style={{ flex: 1 }} />
              <input className="apple-input" placeholder={t("history.dimIcon")} value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} style={{ width: 56, textAlign: "center" }} />
              <button className="apple-btn" style={{ padding: "10px 16px", fontSize: 14 }} onClick={handleAdd}>{t("history.add")}</button>
            </div>
          </div>

          {cats.length === 0 && (
            <div style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏷️</div>
              <div style={{ fontSize: 14 }}>{t("history.noCustomDim")}</div>
            </div>
          )}
          {cats.map(c => (
            <div key={c.id} className="apple-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(118,118,128,0.08)", borderRadius: 12 }}>{c.icon}</span>
              <span style={{ flex: 1, fontSize: 16, fontWeight: 500 }}>{c.name}</span>
              <button className="apple-btn danger" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => handleDel(c.id)}>删除</button>
            </div>
          ))}
        </>
      )}

      <FilterSheet show={showFilter} onClose={() => setShowFilter(false)} cats={CATS} selected={filterCat} onSelect={setFilterCat} />
    </div>
  );
}
