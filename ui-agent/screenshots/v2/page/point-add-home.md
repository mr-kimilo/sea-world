# V2 重构设计：point-add-home — 加分首页

> 源分析：`v1/point-add-home.md`

---

## V2 布局

```
┌──────────────────────────────┐
│  ← 返回    ➕ 加分           │
├──────────────────────────────┤
│  👶 小明 ⭐ 150 积分         │
├──────────────────────────────┤
│  🌊 选择加分维度              │
│                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 📚   │ │ 🧹   │ │ 🌟   │ │  ← 维度卡片
│  │ 学习  │ │ 劳动  │ │ 品德  │ │
│  │ +5分  │ │ +3分  │ │ +10分│ │  (3列，可多选)
│  └──────┘ └──────┘ └──────┘ │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 🏃   │ │ 🎨   │ │ 🎵   │ │
│  │ 运动  │ │ 艺术  │ │ 音乐  │ │
│  │ +3分  │ │ +5分  │ │ +3分  │ │
│  └──────┘ └──────┘ └──────┘ │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 🌸   │ │ 🍳   │ │ ➕   │ │
│  │ 礼仪  │ │ 家务  │ │ 自定义│ │
│  │ +2分  │ │ +2分  │ │      │ │
│  └──────┘ └──────┘ └──────┘ │
│                               │
│  ┌──────────────────────┐    │
│  │ 已选: 学习+5 劳动+3  │    │
│  │ 共: +8 分            │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │ 备注:                │    │
│  │ ┌──────────────────┐ │    │
│  │ │ 输入具体说明...   │ │    │
│  │ └──────────────────┘ │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  🌊 确认加分 🐟      │    │  ← 渐变按钮
│  └──────────────────────┘    │
└──────────────────────────────┘
```

## V2 设计要点

- **多选模式**：维度卡片可多选，选中态有波浪形边框动画
- **实时汇总**：底部实时显示已选维度和累计分数
- **自定义维度**：点击弹出编辑框，可设置名称、图标、分数
- **分数可调**：点击分数数字弹出微调器
- **加分成功**：全屏气泡上升 + 积分飞入动画

## V2 Prompt

```markdown
Design the "Add Points" page for 海底世界 app.

Layout:
1. Frosted glass nav bar: ← back, title "➕ 加分"
2. Child info bar: 👶 小明 ⭐ 150 积分
3. Grid of dimension cards (3 columns): 📚 学习 +5, 🧹 劳动 +3, 🌟 品德 +10, 🏃 运动 +3, 🎨 艺术 +5, 🎵 音乐 +3, 🌸 礼仪 +2, 🍳 家务 +2, ➕ Custom. 
   - Cards are rounded bubbles with emoji + name + points
   - Multi-select: selected cards have glowing wave border animation and light blue fill
   - Tap points number to adjust (微调器弹出)
4. Summary bar: "已选: 学习+5 劳动+3, 共: +8 分"
5. Optional note input
6. Gradient confirm button "🌊 确认加分 🐟" with ripple

On success: Full-screen bubble rising animation, points fly into top bar. Feels celebratory!

Style: Ocean theme, bubble cards, soft blue/white, wave animations, celebratory feedback.
```
