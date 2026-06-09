import { useEffect, useState } from "react";
import { shopApi, productApi, familyApi } from "../api";
import { useFamilyStore } from "../store";
import { t } from "../i18n";

type Product = { id: string; name: string; description?: string; imageUrl?: string; price: number; rarity: string; isActive: boolean; allowedChildIds?: string[] };
const AVATARS = ["🧒", "👦", "👧", "🐱", "🐶", "🦊", "🐸", "🐼"];

const SHOP_ICONS = ["🎁", "🧸", "🎮", "📚", "🍭", "🎨", "⚽", "🎵", "🧩", "🌈", "🦄", "🚀"];

export default function ShopPage() {
  const { selectedFamilyId, children, selectedChildId } = useFamilyStore();
  const [items, setItems] = useState<Product[]>([]);
  const [displayCount, setDisplayCount] = useState(10);
  const [selCid, setSelCid] = useState(selectedChildId || "");
  const [redeeming, setRedeeming] = useState(false);
  const [buyTarget, setBuyTarget] = useState<Product | null>(null);
  const [buySuccess, setBuySuccess] = useState<Product | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPriceStr, setFormPriceStr] = useState("10");
  const [formImage, setFormImage] = useState("");
  const [formAllowed, setFormAllowed] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

  const activeItems = items.filter(p => p.isActive);
  const kid = kids.find(k => k.id === (selCid || selectedChildId));

  return (
    <div className="shop-v2">
      {/* Ocean Background */}
      <div className="ocean-bg" aria-hidden="true">
        <div className="ocean-bubbles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="ocean-bubble" />))}
        </div>
      </div>

      {/* Header */}
      <div className="shop-header-v2">
        <span className="shop-header-title-v2">🛒 {t("shop.title")}</span>
        <button className="shop-header-btn-v2" onClick={openNew}>✏️ {t("shop.addProduct")}</button>
      </div>

      {/* Child Info + Progress */}
      {kid && (
        <div className="shop-child-bar-v2">
          <div className="shop-child-row-v2">
            <span className="shop-child-avatar-v2">{kid.avatar || "🧒"}</span>
            <span className="shop-child-name-v2">{kid.name}</span>
            <span className="shop-child-points-v2">⭐{kid.totalScore ?? "?"}</span>
          </div>
          <div className="shop-progress-v2">
            <div className="shop-progress-bar-v2">
              <div className="shop-progress-fill-v2" style={{
                width: `${Math.min(((kid.totalScore ?? 0) % 100) / 100 * 100, 100)}%`
              }} />
            </div>
            <div className="shop-progress-hint-v2">{t("home.pointsProgress")}</div>
          </div>
        </div>
      )}

      {/* Child Switcher */}
      {kids.length > 0 && (
        <div className="shop-child-scroll-v2">
          {kids.map(c => (
            <button key={c.id} onClick={() => setSelCid(c.id)}
              className={"shop-child-chip-v2" + (c.id === (selCid || selectedChildId) ? " active" : "")}>
              <span className="shop-child-chip-avatar-v2">{c.avatar || "🧒"}</span>
              <span>{c.name}</span>
              <span style={{ fontSize: 10, opacity: 0.6 }}>⭐{c.totalScore ?? "?"}</span>
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {activeItems.length === 0 ? (
        <div className="shop-empty-v2">
          <span className="shop-empty-icon-v2">🐟</span>
          <div>{t("shop.empty")}</div>
        </div>
      ) : (
        <>
          <div className="shop-grid-v2">
            {activeItems.slice(0, displayCount).map(item => (
              <div key={item.id} className="shop-card-v2">
                <div className="shop-card-badge-v2">{item.rarity === "legendary" ? "🔥" : item.rarity === "epic" ? "💎" : ""}</div>
                <div className="shop-card-icon-v2">{item.imageUrl ? "🎁" : SHOP_ICONS[item.name.length % SHOP_ICONS.length]}</div>
                <div className="shop-card-name-v2">{item.name}</div>
                <div className="shop-card-price-v2">⭐{item.price}</div>
                <button className="shop-card-btn-v2" onClick={() => openBuy(item)}>
                  {t("shop.redeem")}
                </button>
              </div>
            ))}
          </div>
          {activeItems.length > displayCount && (
            <button className="shop-load-more-v2" onClick={() => setDisplayCount(prev => prev + 10)}>
              {t("shop.loadMore")}
            </button>
          )}
        </>
      )}

      {/* Wave */}
      <div className="ocean-wave" aria-hidden="true" />

      {/* ─── Buy Confirmation Sheet ─── */}
      {buyTarget && (
        <div className="sheet-overlay shop-sheet-v2" onClick={() => setBuyTarget(null)}>
          <div className="sheet-mask" />
          <div className="sheet-body" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 20px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: "#fff" }}>{t("shop.buyConfirm")}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{buyTarget.name}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>⭐ {buyTarget.price} {t("shop.points")}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="shop-form-btn-v2 secondary" style={{ flex: 1 }} onClick={() => setBuyTarget(null)} disabled={redeeming}>{t("shop.cancel")}</button>
                <button className="shop-form-btn-v2" style={{ flex: 1 }} onClick={handleBuy} disabled={redeeming}>
                  {redeeming ? "…" : "🌊 " + t("shop.buyConfirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Buy Success Sheet ─── */}
      {buySuccess && (
        <div className="sheet-overlay shop-sheet-v2" onClick={() => setBuySuccess(null)}>
          <div className="sheet-mask" />
          <div className="sheet-body" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 20px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: "#fff" }}>{t("shop.redeemOk")}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
                {t("shop.redeemOkDesc")}
              </p>
              <button className="shop-form-btn-v2" style={{ width: "100%" }} onClick={() => setBuySuccess(null)}>
                🌊 {t("shop.confirmConsume")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Product Sheet ─── */}
      {showEdit && (
        <div className="sheet-overlay shop-sheet-v2" onClick={() => setShowEdit(false)}>
          <div className="sheet-mask" />
          <div className="sheet-body" onClick={e => e.stopPropagation()} style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ padding: "12px 20px 24px" }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16, textAlign: "center", color: "#fff" }}>
                {editItem ? t("shop.editProduct") : t("shop.addProduct")}
              </h3>
              <div className="shop-form-label-v2">{t("shop.productName")}</div>
              <input className="shop-input-v2" placeholder={t("shop.productNamePlaceholder")} value={formName} onChange={e => setFormName(e.target.value)} />
              <div className="shop-form-label-v2">{t("shop.productDesc")}</div>
              <input className="shop-input-v2" placeholder={t("shop.productDescPlaceholder")} value={formDesc} onChange={e => setFormDesc(e.target.value)} />
              <div className="shop-form-label-v2">{t("shop.productImage")}</div>
              <input className="shop-input-v2" placeholder={t("shop.productImagePlaceholder")} value={formImage} onChange={e => setFormImage(e.target.value)} />
              <div className="shop-form-label-v2">{t("shop.productPrice")}</div>
              <input inputMode="numeric" className="shop-input-v2" placeholder={t("shop.productPricePlaceholder")}
                value={formPriceStr} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ""); setFormPriceStr(v); }} />
              {kids.length > 0 && (
                <>
                  <div className="shop-form-label-v2">{t("shop.productAllowed")}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>{t("shop.productAllowedHint")}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {kids.map(c => (
                      <button key={c.id} onClick={() => setFormAllowed(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                        className={"shop-tag-v2" + (formAllowed.includes(c.id) ? " active" : "")}>
                        {c.avatar || "🧒"} {c.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="shop-form-btn-v2 secondary" style={{ flex: 1 }} onClick={() => setShowEdit(false)}>{t("shop.cancel")}</button>
                <button className="shop-form-btn-v2" style={{ flex: 1 }} disabled={!formName.trim()} onClick={handleSave}>{t("shop.save")}</button>
              </div>
              {editItem && (
                <button className="shop-form-btn-v2 danger" style={{ width: "100%", marginTop: 10 }}
                  onClick={() => { setShowEdit(false); setShowDeleteConfirm(editItem.id); }}>
                  🗑️ {t("shop.deleteProduct")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ─── */}
      {showDeleteConfirm && (
        <div className="sheet-overlay shop-sheet-v2" onClick={() => setShowDeleteConfirm(null)}>
          <div className="sheet-mask" />
          <div className="sheet-body" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "16px 20px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 15, marginBottom: 16, color: "rgba(255,255,255,0.7)" }}>{t("shop.deleteConfirm")}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="shop-form-btn-v2 secondary" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(null)}>{t("shop.cancel")}</button>
                <button className="shop-form-btn-v2 danger" style={{ flex: 1 }} onClick={() => handleDelete(showDeleteConfirm!)}>{t("shop.deleteProduct")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
