# V2 重构设计：point-add-history — 积分历史

> 源分析：`v1/point-add-history.md`

---

## V2 布局

```
┌──────────────────────────────┐
│  ← 返回   📋 积分历史   🔍  │  ← 导航栏+搜索
├──────────────────────────────┤
│  👶 小明         📅 本周 ▼  │  ← 孩子+时间筛选
├──────────────────────────────┤
│  ┌── 积分趋势 ────────────┐ │
│  │  📈 折线图 (最近7天)   │ │  ← 趋势图表
│  └────────────────────────┘ │
├──────────────────────────────┤
│  📅 今天                     │
│  🟢 10:30  数学作业     +10 │  ← 时间线列表
│  🟢 08:00  整理房间      +5 │
│  🔴 07:30  闹钟(自定义)  -3 │  ← 也可包含纠正
│                               │
│  📅 昨天                     │
│  🟢 19:00  阅读30分钟   +10 │
│  🟢 16:30  帮助洗碗      +3 │
│  🟢 10:00  考试进步     +20 │
│                               │
│  加载更多...                  │
├──────────────────────────────┤
│  🏠  ⭐  📅  📋  👤          │
└──────────────────────────────┘
```

## V2 设计要点

1. **趋势图表**：头部新增最近 7 天积分趋势折线图 (`react-native-svg`)
2. **多维筛选**：右上角 🔍 搜索，顶部下拉按日/周/月/自定义筛选
3. **交互升级**：左滑快速删除(家长)，长按批量操作
4. **分组折叠**：日期分组可折叠/展开
5. **正负色标**：左侧 🟢🔴 圆点标识，积分数字加粗

## V2 Prompt

```markdown
Design the points history page for 海底世界 app.

Header: Frosted glass bar with ← back, title "📋 积分历史", 🔍 search icon.
 below: Child selector "👶 小明" and time filter dropdown "📅 本周 ▼".

Section 1: Sparkline chart showing 7-day points trend (animated line graph with gradient fill). Small stats: "本周累计 +85 分".

Section 2: Grouped timeline list by date:
- "📅 今天": green dot + time + action + points (green bold for positive, red for negative)
- "📅 昨天": same format
- Each group collapsible
- Swipe left on item to delete (with confirmation)
- "加载更多..." at bottom with infinite scroll

Style: Ocean blue accents on timeline left bar, light background, clean typography. Chart area with subtle wave decoration. Timeline dot colors: 🟢 green for positive, 🔴 coral for negative.
```
