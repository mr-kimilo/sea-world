# V2 重构设计：store-home — 积分商城

> 源分析：`v1/store-home.md`

---

## V2 布局

```
┌──────────────────────────────┐
│  ← 返回   🛒 积分商城   ✏️  │  ← 管理按钮(家长)
├──────────────────────────────┤
│  👶 小明 ⭐ 150 积分         │
│  ━━━━━━━━━━━━━━━━━━━━       │  ← 积分进度条
│  还差 20 分可兑换 🧸         │  ← 智能推荐
├──────────────────────────────┤
│  🔍 搜索商品...        🎯   │  ← 搜索+分类筛选
├──────────────────────────────┤
│  热门推荐 🔥                 │
│  ┌──────────┐ ┌──────────┐  │
│  │ 🔥🧸    │ │ 🎮      │  │  ← 2列商品卡片
│  │ 毛绒玩具 │ │ 游戏时间  │  │
│  │ ⭐ 50分 │ │ ⭐ 30分  │  │
│  │ 可兑换   │ │ 可兑换   │  │  ← 状态标签
│  │ ┌──────┐ │ │ ┌──────┐│  │
│  │ │ 兑换  │ │ │ │ 兑换  ││  │
│  │ └──────┘ │ │ └──────┘│  │
│  └──────────┘ └──────────┘  │
│                               │
│  🆕 新品上架                  │
│  ┌──────────┐ ┌──────────┐  │
│  │ 🆕📚    │ │ 🍭      │  │
│  │ 绘本      │ │ 零食     │  │
│  │ ⭐ 20分 │ │ ⭐ 10分  │  │
│  │ ┌──────┐ │ │ ┌──────┐│  │
│  │ │ 兑换  │ │ │ │ 兑换  ││  │
│  │ └──────┘ │ │ └──────┘│  │
│  └──────────┘ └──────────┘  │
├──────────────────────────────┤
│  🏠  ⭐  📅  📋  👤          │
└──────────────────────────────┘
```

## V2 设计要点

1. **积分进度条**：显示当前积分和"还差 XX 分可兑换 XXX"的智能推荐
2. **分类筛选**：热门🔥 / 新品🆕 / 全部，水平滑动标签
3. **卡片升级**：增加库存状态标签（可兑换/即将售罄/积分不足）
4. **兑换态**：积分不足时卡片半透明 + "积分不足"灰标
5. **空状态**：无商品时可展示可爱海洋生物"商品还在游来的路上~"

## V2 Prompt

```markdown
Design the points shop page for 海底世界 app — a rewards store where children spend points.

Layout:
1. Nav bar: ← back, title "🛒 积分商城", ✏️ edit button (visible for parents)
2. Child info: 👶 小明 ⭐ 150 积分 with animated progress bar "还差 20 分可兑换 🧸"
3. Search bar: 🔍 with category filter pills (🔥热门, 🆕新品, 🎁全部)
4. Product grid (2 columns): Each card shows emoji icon, product name, ⭐ price, availability status badge ("可兑换" green / "积分不足" gray). "兑换" button at bottom of each card.
   - Hot items have 🔥 corner badge
   - New items have 🆕 corner badge
   - Out-of-stock/low-points items have semi-transparent overlay
5. Pull-to-refresh with wave animation

Style: Shop cards with ocean bubble style, gold price tags, clean grid. Animated progress bar at top. Empty state shows 🐟 "商品还在游来的路上~".
```
