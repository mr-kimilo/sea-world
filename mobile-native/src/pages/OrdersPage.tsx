import { useEffect, useState } from "react";
import { orderApi, familyApi } from "../api";
import { useFamilyStore } from "../store";
import { t } from "../i18n";

type Order = { id: string; childId: string; itemId: string; itemName: string; itemImageUrl?: string; cost: number; status: string; purchasedAt: string; completedAt?: string };
const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  PENDING: { color: "#FF8C00", bg: "rgba(255,140,0,0.15)" },
  COMPLETED: { color: "#2D6A4F", bg: "rgba(45,106,79,0.15)" },
  CANCELLED: { color: "#E53E3E", bg: "rgba(229,62,62,0.12)" },
};

export default function OrdersPage() {
  const { selectedFamilyId, selectedChildId, selectChild, families, setFamilies, children, setChildren } = useFamilyStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [displayCount, setDisplayCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const fid = selectedFamilyId;
  const cid = selectedChildId;
  const kids = fid ? children[fid] || [] : [];

  useEffect(() => {
    if (fid || initializing) return;
    setInitializing(true);
    familyApi.mine()
      .then(res => {
        const families: any[] = res.data ?? [];
        setFamilies(families);
        if (families.length === 0) return;
        const firstFid = families[0].id;
        const activeFid = useFamilyStore.getState().selectedFamilyId || firstFid;
        if (activeFid !== firstFid && !families.some((f: any) => f.id === activeFid)) {
          useFamilyStore.getState().selectFamily(firstFid);
        }
        return familyApi.children(activeFid || firstFid);
      })
      .then(res => {
        if (!res) return;
        const kidsData: any[] = res.data ?? [];
        const currentFid = useFamilyStore.getState().selectedFamilyId || families[0]?.id;
        if (currentFid) {
          setChildren(currentFid, kidsData);
          const store = useFamilyStore.getState();
          if (kidsData.length > 0 && !store.selectedChildId) selectChild(kidsData[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    document.body.style.overflow = cancelTarget ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cancelTarget]);

  const refreshChildren = () => {
    if (fid) {
      familyApi.children(fid).then(r => {
        useFamilyStore.getState().setChildren(fid, (r.data ?? []) as any);
      }).catch(() => {});
    }
  };

  const load = async () => {
    if (!cid) { setOrders([]); return; }
    setLoading(true);
    try { const res = await orderApi.list(cid); setOrders((res.data ?? []) as Order[]); }
    catch { setOrders([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { setDisplayCount(10); load(); }, [cid]);

  const handleConfirm = async (order: Order) => {
    try { await orderApi.confirm(order.childId, order.id); refreshChildren(); load(); }
    catch { alert(t("shop.confirmFailed")); }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try { await orderApi.cancel(cancelTarget.childId, cancelTarget.id); setCancelTarget(null); refreshChildren(); load(); }
    catch { alert(t("shop.cancelFailed")); }
  };

  const formatTime = (ts: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (!cid || kids.length === 0) {
    return (
      <div className="home-v2">
        <div className="ocean-bg" aria-hidden="true">
          <div className="ocean-bubbles" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
          </div>
        </div>
        <nav className="home-nav-v2"><span className="home-nav-title">📦 {t("shop.ordersTitle")}</span></nav>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: 48, color: "rgba(255,255,255,0.3)" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
          <div>{initializing || !fid ? t("shop.loading") : t("shop.noChildHint")}</div>
        </div>
        <div className="ocean-wave" aria-hidden="true" />
      </div>
    );
  }

  const kid = kids.find(k => k.id === cid);

  return (
    <div className="home-v2">
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>

      <nav className="home-nav-v2"><span className="home-nav-title">📦 {t("shop.ordersTitle")}</span></nav>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Child Selector */}
        {kids.length > 0 && (
          <div className="shop-child-scroll-v2">
            {kids.map(c => (
              <button key={c.id} onClick={() => selectChild(c.id)}
                className={"shop-child-chip-v2" + (c.id === cid ? " active" : "")}>
                <span className="shop-child-chip-avatar-v2">{c.avatar || "🧒"}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Child Summary */}
        {kid && (
          <div className="shop-child-bar-v2">
            <div className="shop-child-row-v2">
              <span className="shop-child-avatar-v2">{kid.avatar || "🧒"}</span>
              <span className="shop-child-name-v2">{kid.name}</span>
              <span className="shop-child-points-v2">⭐{kid.totalScore ?? "?"}</span>
            </div>
          </div>
        )}

        {loading && <div style={{ textAlign: "center", padding: 32, color: "rgba(255,255,255,0.3)" }}>{t("shop.loading")}</div>}

        {!loading && orders.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 15 }}>{t("shop.noOrders")}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{t("shop.noOrdersHint")}</div>
          </div>
        )}

        {/* Order Cards */}
        <div style={{ padding: "0 16px" }}>
          {orders.slice(0, displayCount).map(order => {
            const stColor = STATUS_COLORS[order.status] || { color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)" };
            return (
              <div key={order.id} className="points-section-card-v2" style={{ marginBottom: 10, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    🎁
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{order.itemName}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: stColor.bg, color: stColor.color, fontWeight: 600 }}>{order.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>⭐ {order.cost}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{formatTime(order.purchasedAt)}</div>
                    {order.status === "PENDING" && (
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button className="shop-form-btn-v2" style={{ flex: 1, padding: "8px 0", fontSize: 12 }} onClick={() => handleConfirm(order)}>
                          {t("shop.confirmConsume")}
                        </button>
                        <button className="shop-form-btn-v2 danger" style={{ flex: 1, padding: "8px 0", fontSize: 12 }} onClick={() => setCancelTarget(order)}>
                          {t("shop.cancelOrderBtn")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {orders.length > displayCount && (
          <button className="shop-load-more-v2" onClick={() => setDisplayCount(prev => prev + 10)}>
            {t("shop.loadMore")}
          </button>
        )}
      </div>

      {/* Cancel Sheet */}
      {cancelTarget && (
        <div className="sheet-overlay shop-sheet-v2" onClick={() => setCancelTarget(null)}>
          <div className="sheet-mask" />
          <div className="sheet-body" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "16px 20px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 15, marginBottom: 16, color: "rgba(255,255,255,0.7)" }}>{t("shop.cancelOrderConfirm")}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="shop-form-btn-v2 secondary" style={{ flex: 1 }} onClick={() => setCancelTarget(null)}>{t("shop.cancel")}</button>
                <button className="shop-form-btn-v2 danger" style={{ flex: 1 }} onClick={handleCancel}>{t("shop.cancelOrderBtn")}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="ocean-wave" aria-hidden="true" />
    </div>
  );
}
