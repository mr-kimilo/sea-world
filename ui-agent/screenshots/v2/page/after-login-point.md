# V2 重构设计：after-login-point — 积分主页

> 源分析：`v1/after-login-point.md`

---

## 设计理念

V1 积分主页以列表为主，V2 升级为**积分仪表盘**——让积分数据可视化，孩子能直观看到自己的成长轨迹。

## V2 布局

```
┌──────────────────────────────┐
│  Status Bar (透明)           │
├──────────────────────────────┤
│  ← 返回    ⭐ 积分中心       │  ← 毛玻璃导航栏
├──────────────────────────────┤
│  👶 小明             ▼       │  ← 孩子选择器 (下拉)
├──────────────────────────────┤
│  ┌──────────────────────────┐│
│  │     ⭐                   ││  ← 大号积分数字
│  │     150                  ││  ← 计数动画
│  │   当前积分               ││
│  │                          ││
│  │  ┌─────┐    ┌─────┐     ││
│  │  │ +50 │    │ -20 │     ││  ← 今日收支
│  │  │ 收入 │    │ 支出 │     ││
│  │  └─────┘    └─────┘     ││
│  │  ━━━━━━━━━━━━━━ 本周趋势 ││  ← 迷你折线图
│  └──────────────────────────┘│
├──────────────────────────────┤
│  📊 积分分析                  │
│  ┌────┐ ┌────┐ ┌────┐       │
│  │学习│ │劳动│ │品德│       │  ← 维度分布
│  │45% │ │30% │ │25% │       │
│  └────┘ └────┘ └────┘       │
├──────────────────────────────┤
│  最近记录                    │
│  🟢 今天 08:00  完成作业  +10│
│  🟢 昨天 19:00  阅读     +10│
│  🔴 昨天 16:00  买玩具   -50│
│                               │
│  📋 查看全部记录 →            │
├──────────────────────────────┤
│  🏠  ⭐  📅  📋  👤          │
└──────────────────────────────┘
```

## V2 设计要点

1. **积分数字**：超大字体 + 滚动计数动画 (0→150，带弹性效果)
2. **今日收支**：使用卡片分开展示，正分绿色 (#2D6A4F)，负分红色 (#E53E3E)
3. **本周趋势**：迷你折线图(Sparkline)，用 `react-native-svg` 绘制
4. **维度分布**：圆角进度条展示各维度积分占比，带 Emoji 图标
5. **最近记录**：时间线式，左右侧色点标识正负，左滑可删除/编辑

## V2 Prompt

```markdown
Design a points dashboard page for "海底世界" family rewards app.

Layout:
1. Top: Frosted glass nav bar with back arrow ← and title "⭐ 积分中心"
2. Child selector: 👶 小明 with dropdown ▼ arrow
3. Hero section: Large gold ⭐ star with animated count-up number "150", label "当前积分". Two small stat badges: green "+50 收入" and red "-20 支出". Mini sparkline chart showing weekly trend.
4. Category breakdown: 3 rounded progress bars showing points by dimension — 📚 学习 45%, 🧹 劳动 30%, 🌟 品德 25%. Each with ocean-themed colors.
5. Recent activity: Timeline list with green dot (positive) / red dot (negative), showing time + action + points. "📋 查看全部记录 →" link at bottom.
6. Bottom TabBar: Home🏠, Points⭐(active), Check-in📅, Tasks📋, Profile👤

Style: Ocean blue palette, glassmorphism cards, gold accents for points, animated counters, sparkline chart. Child-friendly and motivational.
```
