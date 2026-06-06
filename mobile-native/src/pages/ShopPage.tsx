import { useEffect, useState } from "react";
import { shopApi, productApi, familyApi } from "../api";
import { useFamilyStore } from "../store";
import { t } from "../i18n";

type Product = { id: string; name: string; description?: string; imageUrl?: string; price: number; rarity: string; isActive: boolean; allowedChildIds?: string[] };
const RARITY_LABELS: Record<string, string> = { common: "普通", rare: "稀有", epic: "史诗", legendary: "传说" };

export default function ShopPage() {
  const { selectedFamilyId, children, selectedChildId } = useFamilyStore();
  const [items, setItems] = useState<Product[]>([]);
  const [selCid, setSelCid] = useState(selectedChildId || "");
  const [redeeming, setRedeeming] = useState(false);

  // Admin modals
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPriceStr, setFormPriceStr] = useState("10");
  const [formImage, setFormImage] = useState("");
  const [formAllowed, setFormAllowed] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Purchase flow
  const [buyTarget, setBuyTarget] = useState<Product | null>(null);
  const [buySuccess, setBuySuccess] = useState<Product | null>(null);

  const fid = selectedFamilyId;
  const kids = fid ? children[fid] || [] : [];
  const sheetOpen = showEdit || showDeleteConfirm || buyTarget || buySuccess;

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  const load = () => {
    productApi.list().then(r => setItems((r.data ?? []) as Product[])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const openBuy = (item: Product) => {
    if (!selCid && !selectedChildId) { alert(t("shop.noChild")); return; }
    setBuyTarget(item);
  };

  const handleBuy = async () => {
    if (!buyTarget) return;
    const cid = selCid || selectedChildId;
    if (!cid) return;
    setRedeeming(true);
    try {
      await shopApi.redeem(cid, buyTarget.id);
      // Refresh children to update available scores
      if (fid) {
        familyApi.children(fid).then(r => {
          const k = r.data ?? [];
          useFamilyStore.getState().setChildren(fid, k as any);
        }).catch(() => {});
      }
      setBuyTarget(null);
      setBuySuccess(buyTarget);
    } catch { alert(t("shop.noPoints")); setBuyTarget(null); }
    finally { setRedeeming(false); }
  };

  const openNew = () => {
    setEditItem(null); setFormName(""); setFormDesc(""); setFormPriceStr("10"); setFormImage(""); setFormAllowed([]); setShowEdit(true);
  };
  const openEdit = async (item: Product) => {
    try {
      const r = await productApi.detail(item.id);
      const d = r.data as any;
      setEditItem(item); setFormName(d.name || ""); setFormDesc(d.description || "");
      setFormPriceStr(String(d.price || 10)); setFormImage(d.imageUrl || "");
      setFormAllowed(d.allowedChildIds || []);
    } catch {
      setEditItem(item); setFormName(item.name); setFormDesc(item.description || "");
      setFormPriceStr(String(item.price)); setFormImage(item.imageUrl || ""); setFormAllowed([]);
    }
    setShowEdit(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    const data = {
      name: formName.trim(), description: formDesc, imageUrl: formImage,
      price: parseInt(formPriceStr) || 0, allowedChildIds: formAllowed.length > 0 ? formAllowed : undefined,
    };
    try {
      if (editItem) { await productApi.update(editItem.id, data as any); }
      else { await productApi.create(data); }
      setShowEdit(false); load();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try { await productApi.remove(id); setShowDeleteConfirm(null); load(); } catch {}
  };

  return (
    <div className="page-padded">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{t("shop.title")}</h2>
        <button className="apple-btn" style={{ padding: "8px 16px", fontSize: 14 }} onClick={openNew}>
          + {t("shop.addProduct")}
        </button>
      </div>

      {kids.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 2 }}>
          {kids.map(c => (
            <button key={c.id} onClick={() => setSelCid(c.id)}
              style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 14px", borderRadius: 14, border: c.id === (selCid || selectedChildId) ? "2px solid var(--active)" : "2px solid transparent", background: c.id === (selCid || selectedChildId) ? "var(--active-bg)" : "rgba(118,118,128,0.06)", fontFamily: "inherit" }}>
              <span style={{ fontSize: 22 }}>{c.avatar || "🧒"}</span>
              <span style={{ fontSize: 11, fontWeight: 500 }}>{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {items.length === 0 && <div className="empty-state" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>🎁<br/>{t("shop.empty")}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.filter(p => p.isActive).map(item => (
          <div key={item.id} className="apple-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 72, height: 72, borderRadius: 14, background: "rgba(118,118,128,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>
                {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: 14, objectFit: "cover" }} /> : "🎁"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{item.name}</div>
                    {item.description && <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{item.description}</div>}
                  </div>
                  <button onClick={() => openEdit(item)}
                    style={{ border: "none", background: "rgba(118,118,128,0.08)", borderRadius: 8, padding: "4px 8px", fontSize: 12, fontFamily: "inherit", color: "var(--muted)" }}>⋯</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{RARITY_LABELS[item.rarity] || item.rarity}</span>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>⭐ {item.price} {t("shop.points")}</span>
                </div>
              </div>
            </div>
            <button className="apple-btn" style={{ width: "100%", marginTop: 12 }} onClick={() => openBuy(item)}>
              {t("shop.redeem")} · ⭐{item.price}
            </button>
          </div>
        ))}
      </div>

      {/* Buy Confirmation Sheet */}
      {buyTarget && (
        <div className="sheet-overlay" onClick={() => setBuyTarget(null)} onTouchMove={e => e.stopPropagation()}>
          <div className="sheet-mask" />
          <div className="sheet-body" onClick={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} style={{ overscrollBehavior: "contain" }}>
            <div style={{ padding: "20px 20px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>确认购买</h3>
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>
                确定要购买 <strong style={{ color: "var(--ink)" }}>{buyTarget.name}</strong> 吗？
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
                将暂扣 <strong style={{ color: "#ff9500" }}>{buyTarget.price}</strong> 积分，确认消费后真实扣除。
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="apple-btn secondary" style={{ flex: 1 }} onClick={() => setBuyTarget(null)} disabled={redeeming}>{t("shop.cancel")}</button>
                <button className="apple-btn" style={{ flex: 1 }} onClick={handleBuy} disabled={redeeming}>
                  {redeeming ? "…" : "确认购买"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Success Sheet */}
      {buySuccess && (
        <div className="sheet-overlay" onClick={() => setBuySuccess(null)} onTouchMove={e => e.stopPropagation()}>
          <div className="sheet-mask" />
          <div className="sheet-body" onClick={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} style={{ overscrollBehavior: "contain" }}>
            <div style={{ padding: "20px 20px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>操作成功</h3>
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>
                购买成功，积分已暂扣
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="apple-btn secondary" style={{ flex: 1 }} onClick={() => setBuySuccess(null)}>取消</button>
                <button className="apple-btn" style={{ flex: 1 }} onClick={() => setBuySuccess(null)}>确认</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="sheet-overlay" onClick={() => setShowEdit(false)} onTouchMove={e => e.stopPropagation()}>
          <div className="sheet-mask" />
          <div className="sheet-body" onClick={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} style={{ maxHeight: "80vh", overflowY: "auto", overscrollBehavior: "contain" }}>
            <div style={{ padding: "12px 20px 24px" }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16, textAlign: "center" }}>
                {editItem ? t("shop.editProduct") : t("shop.addProduct")}
              </h3>
              <div className="section-title">{t("shop.productName")}</div>
              <input className="apple-input" placeholder={t("shop.productNamePlaceholder")} value={formName} onChange={e => setFormName(e.target.value)} style={{ marginBottom: 12 }} />
              <div className="section-title">{t("shop.productDesc")}</div>
              <input className="apple-input" placeholder={t("shop.productDescPlaceholder")} value={formDesc} onChange={e => setFormDesc(e.target.value)} style={{ marginBottom: 12 }} />
              <div className="section-title">{t("shop.productImage")}</div>
              <input className="apple-input" placeholder={t("shop.productImagePlaceholder")} value={formImage} onChange={e => setFormImage(e.target.value)} style={{ marginBottom: 12 }} />
              <div className="section-title">{t("shop.productPrice")}</div>
              <input inputMode="numeric" pattern="[0-9]*" className="apple-input" placeholder={t("shop.productPricePlaceholder")} value={formPriceStr} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ""); setFormPriceStr(v); }} style={{ marginBottom: 12 }} />
              {kids.length > 0 && (
                <>
                  <div className="section-title">{t("shop.productAllowed")}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>{t("shop.productAllowedHint")}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {kids.map(c => (
                      <button key={c.id} onClick={() => setFormAllowed(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                        style={{ padding: "8px 14px", borderRadius: 20, border: formAllowed.includes(c.id) ? "1.5px solid var(--active)" : "1px solid var(--line)", background: formAllowed.includes(c.id) ? "var(--active-bg)" : "#fff", fontSize: 13, fontFamily: "inherit", color: formAllowed.includes(c.id) ? "var(--active)" : "#555", fontWeight: formAllowed.includes(c.id) ? 500 : 400 }}>
                        {c.avatar || "🧒"} {c.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="apple-btn secondary" style={{ flex: 1 }} onClick={() => setShowEdit(false)}>{t("shop.cancel")}</button>
                <button className="apple-btn" style={{ flex: 1 }} disabled={!formName.trim()} onClick={handleSave}>{t("shop.save")}</button>
              </div>
              {editItem && (
                <button className="apple-btn danger" style={{ width: "100%", marginTop: 10 }} onClick={() => { setShowEdit(false); setShowDeleteConfirm(editItem.id); }}>
                  {t("shop.deleteProduct")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="sheet-overlay" onClick={() => setShowDeleteConfirm(null)} onTouchMove={e => e.stopPropagation()}>
          <div className="sheet-mask" />
          <div className="sheet-body" onClick={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
            <div style={{ padding: "16px 20px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 15, marginBottom: 16 }}>{t("shop.deleteConfirm")}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="apple-btn secondary" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(null)}>{t("shop.cancel")}</button>
                <button className="apple-btn danger" style={{ flex: 1 }} onClick={() => handleDelete(showDeleteConfirm!)}>{t("shop.deleteProduct")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
