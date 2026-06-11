import { useEffect, useState } from "react";
import { useFamilyStore } from "../store";
import { familyApi, type ChildInfo, type FamilyInfo } from "../api";
import { t } from "../i18n";
import "./TasksPage.css";

export default function TasksPage() {
  const { selectedFamilyId, selectedChildId, selectChild, setFamilies, children, setChildren } = useFamilyStore();
  const [initializing, setInitializing] = useState(true);

  const fid = selectedFamilyId;
  const cid = selectedChildId;
  const kids = fid ? children[fid] || [] : [];
  const currentChild = kids.find((k: ChildInfo) => k.id === cid) || kids[0];

  // Load families & children data when page mounts
  useEffect(() => {
    setInitializing(true);
    // Case 1: fid exists and children already loaded → done
    if (fid && kids.length > 0) {
      setInitializing(false);
      return;
    }
    // Case 2: fid exists but children not loaded yet → load children
    if (fid && kids.length === 0) {
      familyApi.children(fid)
        .then((res) => {
          setChildren(fid, (res.data ?? []) as ChildInfo[]);
          const kidsData = res.data ?? [];
          if (kidsData.length > 0 && !useFamilyStore.getState().selectedChildId) {
            selectChild(kidsData[0].id);
          }
        })
        .catch(() => {})
        .finally(() => setInitializing(false));
      return;
    }
    // Case 3: no fid → load families first, then children
    familyApi.mine()
      .then((res) => {
        const loadedFamilies = (res.data ?? []) as FamilyInfo[];
        setFamilies(loadedFamilies);
        if (loadedFamilies.length > 0) {
          const activeFid = useFamilyStore.getState().selectedFamilyId || loadedFamilies[0].id;
          return familyApi.children(activeFid).then((r) => ({ fid: activeFid, res: r }));
        }
        return null;
      })
      .then((result) => {
        if (!result) return;
        setChildren(result.fid, (result.res.data ?? []) as ChildInfo[]);
        const kidsData = result.res.data ?? [];
        if (kidsData.length > 0 && !useFamilyStore.getState().selectedChildId) {
          selectChild(kidsData[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, []);

  return (
    <div className="home-v2">
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>

      <nav className="home-nav-v2">
        <span className="home-nav-title">📋 {t("tasks.title")}</span>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Child Switcher */}
        {kids.length > 0 && (
          <div className="shop-child-scroll-v2" style={{ paddingTop: 4 }}>
            {kids.map((c: ChildInfo) => (
              <button key={c.id} onClick={() => selectChild(c.id)}
                className={"shop-child-chip-v2" + (c.id === (cid || currentChild?.id) ? " active" : "")}>
                <span className="shop-child-chip-avatar-v2">{c.avatar || "🧒"}</span>
                <span>{c.name}</span>
                <span style={{ fontSize: 10, opacity: 0.6 }}>⭐{c.totalScore ?? "?"}</span>
              </button>
            ))}
          </div>
        )}

        {/* Child Info Card */}
        {currentChild ? (
          <div className="shop-child-bar-v2" style={{ margin: "0 16px 14px" }}>
            <div className="shop-child-row-v2">
              <span className="shop-child-avatar-v2">{currentChild.avatar || "🧒"}</span>
              <span className="shop-child-name-v2">{currentChild.name}</span>
              <span className="shop-child-points-v2">⭐{currentChild.totalScore ?? "?"}</span>
            </div>
          </div>
        ) : initializing ? (
          <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,0.4)" }}>
            <div className="spinner" style={{ margin: "0 auto 8px" }} />
            <span style={{ fontSize: 13 }}>{t("shop.loading")}</span>
          </div>
        ) : null}

        {/* Empty content placeholder */}
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🏗️</div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>{t("tasks.title")}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>{t("tasks.empty")}</div>
        </div>
      </div>

      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
