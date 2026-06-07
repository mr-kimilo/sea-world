import { useEffect, useState } from "react";
import { orderApi, familyApi } from "../api";
import { useFamilyStore } from "../store";
import { t } from "../i18n";

type Order = { id: string; childId: string; itemId: string; itemName: string; itemImageUrl?: string; cost: number; status: string; purchasedAt: string; completedAt?: string };

const getStatusLabel = (status: string) => t(`shop.orderStatus.${status}`) || status;
const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  PENDING: { color: "#ff9500", bg: "#fff3e0" },
  COMPLETED: { color: "#34c759", bg: "#e8f8ed" },
  CANCELLED: { color: "#ff3b30", bg: "#ffeaea" },
};

export default function OrdersPage() {
  const { selectedFamilyId, selectedChildId, selectChild, families, setFamilies, children, setChildren } = useFamilyStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const fid = selectedFamilyId;
  const cid = selectedChildId;
  const kids = fid ? children[fid] || [] : [];

  // Auto-load families & children if not loaded yet
  useEffect(() => {
    if (fid || initializing) return;
    setInitializing(true);
    familyApi.mine()
      .then(res => {
        const families: any[] = res.data ?? [];
        setFamilies(families);
        if (families.length === 0) return;
        const firstFid = families[0].id;
        // If store already has a selectedFamilyId, use it
        const activeFid = useFamilyStore.getState().selectedFamilyId || firstFid;
        if (activeFid !== firstFid && !families.some((f: any) => f.id === activeFid)) {
          useFamilyStore.getState().selectFamily(firstFid);
        }
        return familyApi.children(activeFid || firstFid);
      })
      .then(res => {
        if (!res) return;
        const kids: any[] = res.data ?? [];
        const currentFid = useFamilyStore.getState().selectedFamilyId || families[0]?.id;
        if (currentFid) {
          setChildren(currentFid, kids);
          const store = useFamilyStore.getState();
          if (kids.length > 0 && !store.selectedChildId) {
            selectChild(kids[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, []);

  // Lock body scroll when sheet open
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
    try {
      const res = await orderApi.list(cid);
      setOrders((res.data ?? []) as Order[]);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [cid]);

  const handleConfirm = async (order: Order) => {
    try {
      await orderApi.confirm(order.childId, order.id);
      refreshChildren();
      load();
    } catch { alert(t("shop.confirmFailed")); }
  };

  const openCancelConfirm = (order: Order) => {
    setCancelTarget(order);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await orderApi.cancel(cancelTarget.childId, cancelTarget.id);
      setCancelTarget(null);
      refreshChildren();
      load();
    } catch { alert(t("shop.cancelFailed")); }
  };

  const formatTime = (ts: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  if (!cid || kids.length === 0) {
    return (
      <div className="page-padded">
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{t("shop.ordersTitle")}</h2>
        {initializing || !fid ? (
          <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>{t("shop.loading")}</div>
        ) : (
          <div className="empty-state" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>📋<br/>{t("shop.noChildHint")}</div>
        )}
      </div>
    );
  }

  const kid = kids.find(k => k.id === cid);

  return (
    <div className="page-padded">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{t("shop.ordersTitle")}</h2>

      {/* Child Selector */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 2 }}>
        {kids.map(c => (
          <button key={c.id} onClick={() => selectChild(c.id)}
            style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 14px", borderRadius: 14, border: c.id === cid ? "2px solid var(--active)" : "2px solid transparent", background: c.id === cid ? "var(--active-bg)" : "rgba(118,118,128,0.06)", fontFamily: "inherit" }}>
            <span style={{ fontSize: 22 }}>{c.avatar || "🧒"}</span>
            <span style={{ fontSize: 11, fontWeight: 500 }}>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Child Score Summary */}
      {kid && (
        <div className="apple-card" style={{ padding: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 40 }}>{kid.avatar || "🧒"}</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{kid.name}</div>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>⭐ 总分 <strong style={{ color: "var(--ink)" }}>{(kid as any).totalScore ?? "?"}</strong></span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>💎 可用 <strong style={{ color: "var(--ink)" }}>{(kid as any).availableScore ?? "?"}</strong></span>
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>{t("shop.loading")}</div>}

      {!loading && orders.length === 0 && (
        <div className="empty-state" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 15 }}>{t("shop.noOrders")}</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{t("shop.noOrdersHint")}</div>
        </div>
      )}

      {orders.map(order => {
        const stColor = STATUS_COLORS[order.status] || { color: "#999", bg: "#f0f0f0" };
        return (
          <div key={order.id} className="apple-card" style={{ padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(118,118,128,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                {order.itemImageUrl ? <img src={order.itemImageUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover" }} /> : "🎁"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{order.itemName}</span>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 10, background: stColor.bg, color: stColor.color, fontWeight: 600 }}>{getStatusLabel(order.status)}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {t("shop.points")}: <strong>{order.cost}</strong>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  {formatTime(order.purchasedAt)}
                </div>
                {order.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="apple-btn" style={{ flex: 1, padding: "8px 0", fontSize: 13 }} onClick={() => handleConfirm(order)}>{t("shop.confirmConsume")}</button>
                    <button className="apple-btn danger" style={{ flex: 1, padding: "8px 0", fontSize: 13 }} onClick={() => openCancelConfirm(order)}>{t("shop.cancelOrderBtn")}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Cancel Confirm Sheet */}
      {cancelTarget && (
        <div className="sheet-overlay" onClick={() => setCancelTarget(null)} onTouchMove={e => e.stopPropagation()}>
          <div className="sheet-mask" />
          <div className="sheet-body" onClick={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
            <div style={{ padding: "16px 20px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 15, marginBottom: 16 }}>{t("shop.cancelOrderConfirm")}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="apple-btn secondary" style={{ flex: 1 }} onClick={() => setCancelTarget(null)}>{t("shop.cancel")}</button>
                <button className="apple-btn danger" style={{ flex: 1 }} onClick={handleCancel}>{t("shop.cancelOrderBtn")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
