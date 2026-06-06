import { useEffect, useState } from "react";
import { Button, Toast } from "vant";
import { shopApi } from "../api";

type ShopItem = { id: number; name: string; points: number; imageUrl: string };

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);

  useEffect(() => {
    shopApi.items().then(r => setItems(r.data ?? [])).catch(() => setItems([]));
  }, []);

  const handleRedeem = async (item: ShopItem) => {
    try {
      await shopApi.redeem("demo-child", item.id);
      Toast.success("兑换成功");
    } catch { Toast.fail("积分不足或兑换失败"); }
  };

  return (
    <div className="page">
      <h2>🎁 商店</h2>
      {items.length === 0 && <p className="empty">暂无商品</p>}
      {items.map((item) => (
        <div key={item.id} className="shop-card">
          <span className="shop-name">{item.name}</span>
          <span className="shop-points">{item.points} 分</span>
          <Button size="small" type="primary" round onClick={() => handleRedeem(item)}>兑换</Button>
        </div>
      ))}
    </div>
  );
}
