import { useEffect, useState } from "react";
import { useAuthStore, useFamilyStore } from "../store";
import { scoreApi, familyApi } from "../api";
import { t, ta } from "../i18n";

type ScoreRecord = { id: string; category: string; score: number; reason: string };
const CATEGORIES = [
  { key: "intelligence", emoji: "🧠", label: t("points.categoryLabels.intelligence") },
  { key: "physical", emoji: "💪", label: t("points.categoryLabels.physical") },
  { key: "moral", emoji: "❤️", label: t("points.categoryLabels.moral") },
  { key: "hygiene", emoji: "🫧", label: t("points.categoryLabels.hygiene") },
  { key: "handcraft", emoji: "🛠️", label: t("points.categoryLabels.handcraft") },
];
const QUICK_REASONS = ta("points.quickReasons");
const COLORS: Record<string, string> = { intelligence: "#007aff", physical: "#34c759", moral: "#ff9500", hygiene: "#5ac8fa", handcraft: "#af52de", custom: "#ff3b30" };
const AVATARS = ["🧒", "👦", "👧", "🐱", "🐶", "🦊", "🐸", "🐼"];

function CategorySheet({ show, onClose, cats, selected, onSelect }: { show: boolean; onClose: () => void; cats: typeof CATEGORIES; selected: string; onSelect: (k: string) => void }) {
  if (!show) return null;
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-mask" />
      <div className="sheet-body" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "center", padding: "8px 0 4px" }}>{t("points.selectCategory")}</div>
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

function ScoreStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <button onClick={() => onChange(Math.max(-10, value - 1))}
        style={{ width: 40, height: 40, borderRadius: 20, border: "1.5px solid var(--line)", background: "#fff", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}>−</button>
      <span style={{ fontSize: 36, fontWeight: 700, minWidth: 60, textAlign: "center", color: value > 0 ? "#34c759" : value < 0 ? "#ff3b30" : "#999" }}>
        {value > 0 ? "+" + value : value}
      </span>
      <button onClick={() => onChange(Math.min(10, value + 1))}
        style={{ width: 40, height: 40, borderRadius: 20, border: "1.5px solid var(--line)", background: "#fff", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}>+</button>
    </div>
  );
}

export default function PointsPage() {
  const token = useAuthStore((s) => s.token);
  const { selectedFamilyId, selectedChildId, selectChild, children, setFamilies, setChildren } = useFamilyStore();
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [score, setScore] = useState(2);
  const [category, setCategory] = useState("moral");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCatSheet, setShowCatSheet] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newName, setNewName] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  // Local active child ID — synced from store via useEffect
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const fid = selectedFamilyId;
  const cid = activeChildId ?? selectedChildId;
  const kids = fid ? children[fid] || [] : [];
  const kid = kids.find(k => k.id === cid);
  const curCat = CATEGORIES.find(c => c.key === category) || CATEGORIES[2];

  // Sync local activeChildId from store — runs on mount and when store changes
  useEffect(() => {
    if (selectedChildId && selectedChildId !== activeChildId) {
      setActiveChildId(selectedChildId);
    } else if (!activeChildId && kids.length > 0) {
      const firstId = kids[0].id;
      setActiveChildId(firstId);
      if (!selectedChildId) selectChild(firstId);
    }
  }, [selectedChildId, kids.length]);

  const load = async () => {
    if (!token) return;
    try {
      const res = await familyApi.mine();
      const families: any[] = res.data ?? [];
      setFamilies(families);
      if (families.length === 0) { setRecords([]); return; }

      const store = useFamilyStore.getState();
      const validFid = families.some((f: any) => f.id === store.selectedFamilyId)
        ? store.selectedFamilyId : families[0].id;
      if (validFid !== store.selectedFamilyId) {
        useFamilyStore.getState().selectFamily(validFid);
      }

      for (const f of families) {
        try {
          const cr = await familyApi.children(f.id);
          const kids: any[] = cr.data ?? [];
          setChildren(f.id, kids);
          if (f.id === validFid && kids.length > 0) {
            const validCid = kids.some((k: any) => k.id === store.selectedChildId)
              ? store.selectedChildId : kids[0].id;
            if (validCid !== store.selectedChildId) {
              selectChild(validCid);
            } else if (!store.selectedChildId) {
              selectChild(kids[0].id);
            }
          }
        } catch { /* skip */ }
      }

      const latest = useFamilyStore.getState();
      if (latest.selectedFamilyId && latest.selectedChildId) {
        loadRecords(latest.selectedFamilyId, latest.selectedChildId, 0);
      }
    } catch { /* skip */ }
  };
  useEffect(() => { load(); }, [token]);

  const loadRecords = async (fidOverride?: string, cidOverride?: string, page?: number) => {
    const f = fidOverride ?? fid;
    const c = cidOverride ?? cid;
    if (!f || !c) return;
    try {
      const p = page ?? 0;
      const res = await scoreApi.list(f, c, p, 10);
      const list = res.data?.content ?? [];
      setRecords(prev => p === 0 ? list : [...prev, ...list]);
      setTotalScore(list.reduce((s: number, r: ScoreRecord) => s + r.score, 0));
      setHasMore(!res.data?.last && list.length === 10);
      setCurrentPage(p);
    } catch { setRecords([]); }
  };
  useEffect(() => { loadRecords(fid, cid, 0); }, [fid, cid]);

  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const handleRecord = async () => {
    const currentFid = fid;
    const currentCid = cid;
    if (!currentFid || !currentCid) return;
    setLoading(true);
    try {
      await scoreApi.add(currentFid, currentCid, category, score, reason || QUICK_REASONS[0]);
      setScore(2); setReason("");
      // Fire-and-forget: refresh children, then reload records
      familyApi.children(currentFid)
        .then(r => {
          const k = r.data ?? [];
          useFamilyStore.getState().setChildren(currentFid, k as any);
        })
        .catch(() => {});
      loadRecords(currentFid, currentCid, 0);
    }
    catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t("points.saveFailed");
      alert(msg);
    } finally { setLoading(false); }
  };

  const handleAddChild = async () => {
    if (!fid || !newName.trim()) return;
    try { await familyApi.addChild(fid, newName.trim()); setNewName(""); setShowAddChild(false); load(); } catch {}
  };

  if (!token) return <div className="page-padded"><div className="empty-state">{t("points.notLoggedIn")}</div></div>;

  return (
    <div className="page-padded">
      {/* Child Header */}
      <div className="apple-card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 48 }}>{kid?.avatar || AVATARS[kids.indexOf(kid!) % AVATARS.length] || "🧒"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{kid?.name || t("points.noChild")}</span>
              {kid && <a href={"#/child/edit?id=" + kid.id} style={{ fontSize: 13, color: "var(--active)", textDecoration: "none" }}>{t("points.editChild")}</a>}
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>⭐ {t("points.totalScore")} <strong style={{ color: "var(--ink)", fontSize: 18 }}>{totalScore}</strong></span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>💎 {t("points.available")} <strong style={{ color: "var(--ink)", fontSize: 18 }}>{kid?.availableScore ?? totalScore}</strong></span>
            </div>
          </div>
        </div>
        {kids.length > 0 && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 12, paddingBottom: 2 }}>
            {kids.map(c => (
              <button key={c.id} onClick={() => { selectChild(c.id); setActiveChildId(c.id); }}
                style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 14px", borderRadius: 14, border: c.id === cid ? "2px solid var(--active)" : "2px solid transparent", background: c.id === cid ? "var(--active-bg)" : "rgba(118,118,128,0.06)", fontFamily: "inherit" }}>
                <span style={{ fontSize: 22 }}>{c.avatar || AVATARS[0]}</span>
                <span style={{ fontSize: 11, fontWeight: 500 }}>{c.name}</span>
              </button>
            ))}
            <button onClick={() => setShowAddChild(true)} style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 14, border: "1.5px dashed var(--line)", background: "none", fontSize: 22, color: "var(--active)", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
        )}
      </div>

      {/* Score Entry Card */}
      <div className="apple-card">
        {/* Category Picker */}
        <div className="section-title">{t("points.category")}</div>
        <button onClick={() => setShowCatSheet(true)}
          style={{ width: "100%", padding: "14px 16px", border: "none", borderRadius: 10, background: "rgba(118,118,128,0.08)", fontSize: 16, display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", textAlign: "left", color: "var(--ink)", marginBottom: 20 }}>
          <span style={{ fontSize: 20 }}>{curCat.emoji}</span> {curCat.label}
          <span style={{ marginLeft: "auto", color: "var(--muted)" }}>›</span>
        </button>

        {/* Score Stepper */}
        <div className="section-title">{t("points.score")}</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, marginTop: 8 }}>
          <ScoreStepper value={score} onChange={setScore} />
        </div>

        {/* Quick Reasons */}
        <div className="section-title">{t("points.reason")}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {QUICK_REASONS.map(r => (
            <button key={r} onClick={() => setReason(reason === r ? "" : r)}
              style={{ padding: "8px 14px", borderRadius: 20, border: reason === r ? "1.5px solid var(--active)" : "1.5px solid var(--line)", background: reason === r ? "var(--active-bg)" : "#fff", fontSize: 13, fontFamily: "inherit", color: reason === r ? "var(--active)" : "#555", fontWeight: reason === r ? 500 : 400 }}>
              {r}
            </button>
          ))}
        </div>
        <input className="apple-input" placeholder={t("points.reasonPlaceholder")} value={reason} onChange={e => setReason(e.target.value)} style={{ marginTop: 4, marginBottom: 16 }} />

        <button className="apple-btn" style={{ width: "100%" }} disabled={loading || !cid} onClick={handleRecord}>
          {loading ? t("points.recording") : t("points.record")}
        </button>
      </div>

      {/* Recent Records */}
      <div className="section-title" style={{ marginTop: 8 }}>{t("points.recentRecords")}</div>
      {records.length === 0 && <div className="empty-state" style={{ padding: 24 }}>{t("points.noRecords")}</div>}
      {records.map(r => (
        <div key={r.id} className="record-item" style={{ padding: "14px 0" }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: COLORS[r.category] || "#ccc", flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 15 }}>{r.reason}</span>
          <span style={{ fontWeight: 600, fontSize: 16, color: r.score > 0 ? "#34c759" : "#ff3b30" }}>{r.score > 0 ? "+" : ""}{r.score}</span>
        </div>
      ))}
      {hasMore && (
        <button className="apple-btn secondary" style={{ width: "100%", marginTop: 8 }} onClick={() => loadRecords(fid, cid, currentPage + 1)}>
          {t("points.loadMore")}
        </button>
      )}

      <CategorySheet show={showCatSheet} onClose={() => setShowCatSheet(false)} cats={CATEGORIES} selected={category} onSelect={setCategory} />

      {showAddChild && (
        <div className="sheet-overlay" onClick={() => setShowAddChild(false)}>
          <div className="sheet-mask" />
          <div className="sheet-body" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "0 20px" }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>{t("points.addChild")}</h3>
              <input className="apple-input" placeholder={t("points.childName")} value={newName} onChange={e => setNewName(e.target.value)} autoFocus style={{ marginBottom: 12 }} />
              <button className="apple-btn" style={{ width: "100%" }} disabled={!newName.trim()} onClick={handleAddChild}>{t("points.confirmAddChild")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
