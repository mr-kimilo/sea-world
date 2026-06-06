import { useEffect, useState } from "react";
import { shopApi } from "../api";
import { t } from "../i18n";

type Item = { id: number; name: string; points: number };

export default function ShopPage() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => { shopApi.items().then(r => setItems(r.data ?? [])).catch(() => setItems([])); }, []);

  const redeem = async (item: Item) => {
    try { await shopApi.redeem("demo-child", item.id); alert(t("shop.redeemOk")); }
    catch { alert(t("shop.noPoints")); }
  };

  return (
    <div>
      <h1 className="page-title">{t("shop.title")}</h1>
      {items.length === 0 && <div className="empty-state">{t("shop.empty")}</div>}
      {items.map(item => (
        <div key={item.id} className="shop-card">
          <span className="shop-name">{item.name}</span>
          <span className="shop-pts">{item.points} 分</span>
          <button className="shop-btn" onClick={() => redeem(item)}>{t("shop.redeem")}</button>
        </div>
      ))}
    </div>
  );
}
