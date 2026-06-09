# V2 重构设计：confirm-buy-items — 确认购买

> 源分析：`v1/confirm-buy-items.md`

---

## V2 布局

```
┌──────────────────────────────┐
│  ← 返回   ✅ 确认兑换        │
├──────────────────────────────┤
│                               │
│  🎁 兑换清单                  │
│                               │
│  ┌──────────────────────┐    │
│  │ 🧸 毛绒玩具          │    │  ← 商品项
│  │    单价: ⭐ 50 分    │    │
│  │    ─ ① +       50分 │    │  ← 数量调节
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │ 🍭 棒棒糖            │    │
│  │    单价: ⭐ 10 分    │    │
│  │    ─ ② +       20分 │    │
│  └──────────────────────┘    │
│                               │
│  ────────────────────         │
│  兑换给: 👶 小明     ▼      │
│  ────────────────────         │
│                               │
│  ┌──────────────────────┐    │
│  │  合计: ⭐ 70 分      │    │  ← 大号合计
│  │  当前积分: 150 分    │    │
│  │  兑换后剩余: 80 分   │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  🌊 确认兑换 🎁      │    │  ← 主按钮
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  取消                │    │  ← 次按钮
│  └──────────────────────┘    │
│                               │
│  ⚠️ 兑换后不可撤销            │
└──────────────────────────────┘
```

## V2 设计要点

- **数量调节**：圆形加减按钮，带弹性动画
- **实时合计**：积分自动汇总，颜色变化（绿色充裕/红色不足）
- **兑换对象**：下拉选择不同孩子
- **确认动画**：确认后积分飞向余额 + 礼盒打开动画
- **安全提示**：底部小字提示，带 ⚠️ 图标

## V2 Prompt

```markdown
Design the order confirmation page for 海底世界 app.

Layout:
1. Frosted glass nav: ← back, title "✅ 确认兑换"
2. Item list: Each item shows emoji + name + unit price + quantity stepper (circular -/+ buttons with spring animation)
   - 🧸 毛绒玩具 ×1 = 50分
   - 🍭 棒棒糖 ×2 = 20分
3. Recipient selector: "兑换给: 👶 小明 ▼"
4. Total section: Large "合计: ⭐ 70 分", current balance "当前积分: 150 分", remaining "兑换后剩余: 80 分" (green if sufficient, red if insufficient)
5. Confirm button: "🌊 确认兑换 🎁" gradient blue, disabled if insufficient points
6. Cancel button (ghost style)
7. Footer note: "⚠️ 兑换后不可撤销"

On confirm: points fly animation from total to balance, gift box opening animation, then navigate to orders page.

Style: Ocean blue theme, clean order summary, animated stepper buttons, celebratory confirmation flow.
```
