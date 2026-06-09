import { useEffect, useState, useRef } from "react";
import { useAuthStore, useFamilyStore } from "../store";
import { scoreApi, familyApi, type ChildInfo } from "../api";
import { t, ta } from "../i18n";

type ScoreRecord = { id: string; category: string; score: number; reason: string; createdAt?: string };
const CATEGORIES = [
  { key: "intelligence", emoji: "🧠", label: t("points.categoryLabels.intelligence") },
  { key: "physical", emoji: "💪", label: t("points.categoryLabels.physical") },
  { key: "moral", emoji: "❤️", label: t("points.categoryLabels.moral") },
  { key: "hygiene", emoji: "🫧", label: t("points.categoryLabels.hygiene") },
  { key: "handcraft", emoji: "🛠️", label: t("points.categoryLabels.handcraft") },
];
const QUICK_REASONS = ta("points.quickReasons");
const COLORS: Record<string, string> = {
  intelligence: "#0077B6", physical: "#2D6A4F", moral: "#FF8C00",
  hygiene: "#00B4D8", handcraft: "#7C3AED", custom: "#E53E3E",
};
const AVATARS = ["🧒", "👦", "👧", "🐱", "🐶", "🦊", "🐸", "🐼"];

// ── Category Sheet ──
function CategorySheet({ show, onClose, cats, selected, onSelect }: {
  show: boolean; onClose: () => void;
  cats: typeof CATEGORIES; selected: string; onSelect: (k: string) => void;
}) {
  if (!show) return null;
  return (
    <div className="sheet-overlay points-sheet-v2" onClick={onClose}>
      <div className="sheet-mask" />
      <div className="sheet-body" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "8px 0 4px" }}>
          {t("points.selectCategory")}
        </div>
        {cats.map(c => (
          <button key={c.key} className={"sheet-item" + (selected === c.key ? " selected" : "")}
            onClick={() => { onSelect(c.key); onClose(); }}>
            <span style={{ fontSize: 20 }}>{c.emoji}</span> {c.label}
            {selected === c.key && <span className="sheet-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main ──
export default function PointsPage() {
  const token = useAuthStore((s) => s.token);
  const { selectedFamilyId, selectedChildId, selectChild, children, setFamilies, setChildren } = useFamilyStore();
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [score, setScore] = useState(2);
  const [category, setCategory] = useState("moral");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCatSheet, setShowCatSheet] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [animPoints, setAnimPoints] = useState(0);
  const prevPoints = useRef(0);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fid = selectedFamilyId;
  const cid = activeChildId ?? selectedChildId;
  const kids: ChildInfo[] = fid ? children[fid] || [] : [];
  const kid = kids.find(k => k.id === cid);
  const curCat = CATEGORIES.find(c => c.key === category) || CATEGORIES[2];

  // Sync activeChildId from store
  useEffect(() => {
    if (selectedChildId && selectedChildId !== activeChildId) setActiveChildId(selectedChildId);
    else if (!activeChildId && kids.length > 0) {
      const firstId = kids[0].id;
      setActiveChildId(firstId);
      if (!selectedChildId) selectChild(firstId);
    }
  }, [selectedChildId, kids.length]);

  // Load families & children
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
      if (validFid !== store.selectedFamilyId) useFamilyStore.getState().selectFamily(validFid);
      for (const f of families) {
        try {
          const cr = await familyApi.children(f.id);
          const kidsData: any[] = cr.data ?? [];
          setChildren(f.id, kidsData);
          if (f.id === validFid && kidsData.length > 0) {
            const validCid = kidsData.some((k: any) => k.id === store.selectedChildId)
              ? store.selectedChildId : kidsData[0].id;
            if (validCid !== store.selectedChildId) selectChild(validCid);
            else if (!store.selectedChildId) selectChild(kidsData[0].id);
          }
        } catch { /* skip */ }
      }
      const latest = useFamilyStore.getState();
      if (latest.selectedFamilyId && latest.selectedChildId)
        loadRecords(latest.selectedFamilyId, latest.selectedChildId, 0);
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
  useEffect(() => { loadRecords(fid ?? undefined, cid ?? undefined, 0); }, [fid, cid]);

  // Animate points
  useEffect(() => {
    const target = kid?.totalScore ?? totalScore;
    if (target === prevPoints.current) { setAnimPoints(target); return; }
    const duration = 800;
    const start = prevPoints.current;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimPoints(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else prevPoints.current = target;
    };
    requestAnimationFrame(animate);
  }, [kid?.totalScore, totalScore]);

  const handleRecord = async () => {
    const currentFid = fid;
    const currentCid = cid;
    if (!currentFid || !currentCid) return;
    setLoading(true);
    try {
      await scoreApi.add(currentFid, currentCid, category, score, reason || QUICK_REASONS[0]);
      setScore(2); setReason("");
      familyApi.children(currentFid).then(r => {
        const k = r.data ?? [];
        useFamilyStore.getState().setChildren(currentFid, k as any);
      }).catch(() => {});
      loadRecords(currentFid, currentCid, 0);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t("points.saveFailed");
      alert(msg);
    } finally { setLoading(false); }
  };

  // Mock category distribution
  const catTotals = CATEGORIES.map(c => ({
    ...c,
    pct: records.filter(r => r.category === c.key).reduce((s, r) => s + Math.abs(r.score), 0),
  }));
  const maxCat = Math.max(...catTotals.map(c => c.pct), 1);

  if (!token) return <div className="page-padded"><div className="empty-state">{t("points.notLoggedIn")}</div></div>;

  return (
    <div className="points-v2">
      {/* Ocean Background */}
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>

      {/* ═══ Child Switcher Bar ═══ */}
      <div className="child-switcher-v2">
        {kids.map((c: ChildInfo) => (
          <button
            key={c.id}
            onClick={() => selectChild(c.id)}
            className={"child-switcher-chip-v2" + (c.id === cid ? " active" : "")}
          >
            <span className="child-switcher-avatar-v2">{c.avatar || AVATARS[0]}</span>
            <span className="child-switcher-name-v2">{c.name}</span>
            <span className="child-switcher-points-v2">⭐{c.totalScore ?? "?"}</span>
          </button>
        ))}
      </div>

      {/* ═══ Hero Card ═══ */}
      <div className="points-hero-card-v2">
        <div className="points-hero-top-v2">
          <div className="points-hero-avatar-v2">{kid?.avatar || AVATARS[0]}</div>
          <div className="points-hero-info-v2">
            <div className="points-hero-name-v2">{kid?.name || t("points.noChild")}</div>
            <div className="points-hero-label-v2">{t("points.balance")}</div>
          </div>
        </div>

        <div className="points-big-display-v2">
          <span className="points-big-star-v2">⭐</span>
          <div className="points-big-number-v2">{animPoints}</div>
          <div className="points-big-label-v2">{t("points.balance")}</div>
        </div>

        <div className="points-stats-row-v2">
          <div className="points-stat-v2">
            <div className="points-stat-icon-v2">📈</div>
            <div className="points-stat-value-v2 points-stat-value-positive">
              +{records.filter(r => r.score > 0).reduce((s, r) => s + r.score, 0)}
            </div>
            <div className="points-stat-label-v2">{t("points.record")}</div>
          </div>
          <div className="points-stat-v2">
            <div className="points-stat-icon-v2">📉</div>
            <div className="points-stat-value-v2 points-stat-value-negative">
              {records.filter(r => r.score < 0).reduce((s, r) => s + r.score, 0)}
            </div>
            <div className="points-stat-label-v2">{t("shop.redeem")}</div>
          </div>
        </div>
      </div>

      {/* ═══ Category Distribution ═══ */}
      <div className="points-section-card-v2">
        <div className="points-section-title-v2">📊 {t("history.dimensions")}</div>
        {catTotals.map(cat => (
          <div key={cat.key} className="cat-bar-v2">
            <span className="cat-bar-icon-v2">{cat.emoji}</span>
            <span className="cat-bar-label-v2">{cat.label}</span>
            <div className="cat-bar-track-v2">
              <div className="cat-bar-fill-v2" style={{
                width: `${(cat.pct / maxCat) * 100}%`,
                background: COLORS[cat.key] || "#0077B6",
              }} />
            </div>
            <span className="cat-bar-pct-v2">{cat.pct}</span>
          </div>
        ))}
      </div>

      {/* ═══ Score Entry ═══ */}
      <div className="points-entry-card-v2">
        <div className="points-entry-title-v2">➕ {t("points.addTitle")}</div>

        <button className="points-entry-cat-btn-v2" onClick={() => setShowCatSheet(true)}>
          <span style={{ fontSize: 20 }}>{curCat.emoji}</span>
          <span style={{ flex: 1, textAlign: "left" }}>{curCat.label}</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
        </button>

        <div className="points-stepper-wrap-v2">
          <div className="points-stepper-v2">
            <button className="stepper-btn-v2" onClick={() => setScore(Math.max(-10, score - 1))}>−</button>
            <span className={`stepper-value-v2 ${score > 0 ? "stepper-positive" : score < 0 ? "stepper-negative" : "stepper-zero"}`}>
              {score > 0 ? "+" + score : score}
            </span>
            <button className="stepper-btn-v2" onClick={() => setScore(Math.min(10, score + 1))}>+</button>
          </div>
        </div>

        <div className="points-reason-grid-v2">
          {QUICK_REASONS.slice(0, 6).map(r => (
            <button key={r} onClick={() => setReason(reason === r ? "" : r)}
              className={"points-reason-tag-v2" + (reason === r ? " active" : "")}>
              {r}
            </button>
          ))}
        </div>

        <input className="points-input-v2" placeholder={t("points.reasonPlaceholder")}
          value={reason} onChange={e => setReason(e.target.value)} />

        <button className="points-record-btn-v2" disabled={loading || !cid} onClick={handleRecord}>
          {loading ? <><span className="spinner" /> {t("points.recording")}</> : <>🌊 {t("points.record")}</>}
        </button>
      </div>

      {/* ═══ Recent Records ═══ */}
      <div className="points-records-v2">
        <div className="points-section-title-v2">📋 {t("points.recentRecords")}</div>
        {records.length === 0 && (
          <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            {t("points.noRecords")}
          </div>
        )}
        {records.map(r => (
          <div key={r.id} className="points-record-item-v2">
            <div className={`points-record-dot-v2 ${r.score >= 0 ? "positive" : "negative"}`} />
            <span className="points-record-reason-v2">{r.reason}</span>
            <span className={`points-record-score-v2 ${r.score >= 0 ? "positive" : "negative"}`}>
              {r.score >= 0 ? "+" : ""}{r.score}
            </span>
          </div>
        ))}
        {hasMore && (
          <button className="points-load-more-v2" onClick={() => loadRecords(fid ?? undefined, cid ?? undefined, currentPage + 1)}>
            {t("points.loadMore")}
          </button>
        )}
        {records.length > 0 && (
          <a href="#/history" className="points-view-all-v2">{t("home.viewAll")} →</a>
        )}
      </div>

      {/* Wave */}
      <div className="ocean-wave" aria-hidden="true" />

      {/* Category Sheet */}
      <CategorySheet show={showCatSheet} onClose={() => setShowCatSheet(false)}
        cats={CATEGORIES} selected={category} onSelect={setCategory} />
    </div>
  );
}
