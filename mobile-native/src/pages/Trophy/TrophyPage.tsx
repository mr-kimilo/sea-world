import { useEffect, useState } from "react";
import { useFamilyStore } from "../../store";
import { familyApi, trophyApi, type ChildInfo, type FamilyInfo, type TrophyInfo } from "../../api";
import { t } from "../../i18n";
import "./TrophyPage.css";

export default function TrophyPage() {
  const { selectedFamilyId, selectedChildId, selectChild, setFamilies, children, setChildren } = useFamilyStore();
  const [trophies, setTrophies] = useState<TrophyInfo[]>([]);
  const [top3, setTop3] = useState<TrophyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "top3">("all");

  const fid = selectedFamilyId;
  const cid = selectedChildId;
  const kids = fid ? (children[fid] || []) : [];
  const currentChild = kids.find((k: ChildInfo) => k.id === cid) || kids[0];

  // Init: load families & children
  useEffect(() => {
    if (fid && kids.length > 0) return;
    if (fid && kids.length === 0) {
      familyApi.children(fid).then((res) => {
        setChildren(fid, (res.data ?? []) as ChildInfo[]);
        const kd = res.data ?? [];
        if (kd.length > 0 && !useFamilyStore.getState().selectedChildId) selectChild(kd[0].id);
      }).catch(() => {});
      return;
    }
    familyApi.mine().then((res) => {
      const fams = (res.data ?? []) as FamilyInfo[];
      setFamilies(fams);
      if (fams.length > 0) {
        const activeFid = useFamilyStore.getState().selectedFamilyId || fams[0].id;
        return familyApi.children(activeFid).then((r) => ({ fid: activeFid, res: r }));
      }
      return null;
    }).then((result) => {
      if (!result) return;
      setChildren(result.fid, (result.res.data ?? []) as ChildInfo[]);
      const kd = result.res.data ?? [];
      if (kd.length > 0 && !useFamilyStore.getState().selectedChildId) selectChild(kd[0].id);
    }).catch(() => {});
  }, []);

  // Load trophies
  useEffect(() => {
    if (!cid) return;
    setLoading(true);
    Promise.all([
      trophyApi.list(cid),
      trophyApi.top3(cid),
    ]).then(([allRes, topRes]) => {
      setTrophies(allRes.data ?? []);
      setTop3(topRes.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [cid]);

  const displayList = filter === "top3" ? top3 : trophies;

  return (
    <div className="home-v2">
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>

      <nav className="home-nav-v2">
        <span className="home-nav-title">🏆 {t("trophies.title")}</span>
      </nav>

      <div style={{ position: "relative", zIndex: 1, paddingBottom: 80 }}>
        {/* Child Switcher */}
        {kids.length > 0 && (
          <div className="shop-child-scroll-v2" style={{ paddingTop: 4 }}>
            {kids.map((c: ChildInfo) => (
              <button key={c.id} onClick={() => selectChild(c.id)}
                className={"shop-child-chip-v2" + (c.id === (cid || currentChild?.id) ? " active" : "")}>
                <span className="shop-child-chip-avatar-v2">{c.avatar || "🧒"}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Top 3 */}
        {top3.length > 0 && (
          <div className="trophy-section">
            <div className="trophy-section-title">{t("trophies.top3")}</div>
            <div className="top3-list">
              {top3.map((tr, idx) => (
                <div key={tr.id} className={`top3-item rank-${idx + 1}`}>
                  <span className="top3-medal">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                  <span className="top3-icon">{tr.icon || "🏆"}</span>
                  <div className="top3-info">
                    <span className="top3-name">{tr.name}</span>
                    <span className="top3-points">+{tr.points}</span>
                  </div>
                  <span className="top3-date">{new Date(tr.earnedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="trophy-tabs">
          <button className={`trophy-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}>
            {t("trophies.all")} ({trophies.length})
          </button>
          <button className={`trophy-tab ${filter === "top3" ? "active" : ""}`}
            onClick={() => setFilter("top3")}>
            {t("trophies.top3")} ({top3.length})
          </button>
        </div>

        {/* Trophy List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,0.4)" }}>
            <div className="spinner" style={{ margin: "0 auto 8px" }} />
          </div>
        ) : displayList.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: "rgba(255,255,255,0.3)" }}>
            {t("trophies.empty")}
          </div>
        ) : (
          <div className="trophy-list">
            {displayList.map((tr) => (
              <div key={tr.id} className="trophy-item">
                <span className="trophy-item-icon">{tr.icon || "🏆"}</span>
                <div className="trophy-item-info">
                  <span className="trophy-item-name">{tr.name}</span>
                  <span className="trophy-item-points">+{tr.points}</span>
                </div>
                <span className="trophy-item-date">{new Date(tr.earnedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
