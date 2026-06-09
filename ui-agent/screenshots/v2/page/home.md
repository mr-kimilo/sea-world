# V2 重构设计：home — 首页

> 源分析：`v1/home.md`

---

## 设计理念

围绕"海底世界"主题，打造**沉浸式海洋家庭空间**。V2 在 V1 基础上强化海洋视觉氛围、优化信息层级、增加微交互动效，让孩子和家长都能感受到"潜入海底"的体验感。

## V2 配色方案

| 角色 | 色值 | 用途 |
|------|------|------|
| 深海主色 | `#0A2647` | 顶部导航栏、底部 TabBar 背景 |
| 海洋蓝 | `#0077B6` | 按钮、选中态、链接 |
| 浅海蓝 | `#00B4D8` | 渐变过渡、装饰元素 |
| 海泡白 | `#F0F8FF` | 卡片背景、内容区 |
| 珊瑚橙 | `#FF6B6B` | 提醒、Red Dot 角标 |
| 金色 | `#FFD700` | 积分数字、星星图标 |
| 海草绿 | `#2D6A4F` | 正分/成长色 |
| 半透深蓝 | `rgba(10,38,71,0.6)` | 遮罩层 |

## V2 布局规范

```
┌─ Status Bar (透明浮层) ───────┐
├────────────────────────────────┤
│  🐠 海底世界           👤 ☰   │  ← 毛玻璃导航栏
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │  ┌──┐                    │  │
│  │  │👶│  小明              │  │  ← 孩子卡片(气泡风格)
│  │  └──┘  ⭐ 150 积分       │  │
│  │        ━━━━━━●━━━━ 80%  │  │  ← 积分进度条
│  │        [ + 加分 ]        │  │
│  └──────────────────────────┘  │
├────────────────────────────────┤
│  快捷功能                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│  │📊  │ │📅  │ │📋  │ │🏆  │ │  ← 圆角卡片+微动效
│  │积分│ │打卡│ │任务│ │成就│ │
│  └────┘ └────┘ └────┘ └────┘ │
├────────────────────────────────┤
│  最近动态                      │
│  🕐 10分钟前                   │
│  ┌─ 小明 完成数学作业  +10 ──┐│  ← 时间线式动态
│  │  奖励: 学习维度            ││
│  └────────────────────────────┘│
│  🕐 2小时前                    │
│  ┌─ 小红 整理房间      +5  ──┐│
│  └────────────────────────────┘│
├────────────────────────────────┤
│  🏠  积分  📅打卡  📋任务  👤 │  ← 底部TabBar(毛玻璃)
└────────────────────────────────┘
```

## 组件设计规范

### 1. 导航栏 (AppBar)
- 毛玻璃效果 (`backdrop-filter: blur(20px)`)
- 左侧 App Logo "🐠 海底世界"，右侧用户头像 + 汉堡菜单
- 滚动时自动隐藏/显示
- 背景色: `rgba(10,38,71,0.85)` 毛玻璃

### 2. 孩子卡片 (ChildCard)
- 气泡式圆角设计 (`border-radius: 24px`)
- 渐变边框: `linear-gradient(135deg, #0077B6, #00B4D8)`
- 积分进度条动画: 从 0 到当前值平滑过渡
- "加分"按钮: 珊瑚橙渐变色，点击有波纹扩散效果
- 左右滑动切换孩子，带弹性动画

### 3. 快捷功能卡片 (QuickActionCard)
- 4 列网格布局
- 每个卡片: Emoji + 标题 + 副标题
- 点击缩放动画 (scale 0.95 → 1.0)
- 背景: `rgba(255,255,255,0.9)` + 底部彩色装饰条

### 4. 动态列表 (ActivityFeed)
- 时间线式布局，左侧蓝色竖线
- 每项: 时间戳 + 用户头像 + 行为描述 + 分数(彩色标签)
- 正分绿底，负分红底
- 新动态有从右滑入动画

### 5. 底部 TabBar
- 毛玻璃背景
- 选中图标: 海洋蓝填充 + 微幅上浮动画
- 未选中: 灰色线条图标
- 5 个标签: 首页🏠、积分⭐、打卡📅、任务📋、我的👤

## 动画与交互

| 元素 | 动画效果 |
|------|---------|
| 页面加载 | 子元素依次从底部滑入 (stagger 0.1s) |
| 积分数字 | 滚动计数动画 (count up) |
| 孩子卡片滑动 | 弹性切换 + 背景色渐变过渡 |
| 加分按钮 | 波纹扩散 (ripple) |
| TabBar 切换 | 图标弹跳 + 内容滑动切换 |
| 下拉刷新 | 波浪形加载指示器 |
| 背景 | 持续微动的水波 + 气泡上升 (GPU 加速) |

## V2 Prompt

```markdown
Design a mobile app home page for "海底世界 (Sea World)" — a family reward points management system for parents and children. 

Theme: Underwater/Ocean fantasy. Deep blue (#0A2647) to ocean blue (#0077B6) gradient background with subtle animated wave patterns and rising bubbles.

Layout:
1. Top: Frosted glass navigation bar with app name "🐠 海底世界", user avatar (right), hamburger menu (right)
2. Section 1: Child profile bubble card — circular child avatar, name "小明", gold ⭐ 150 points with animated progress bar, coral "+Add Points" button with ripple effect. Card has gradient border. Swipeable left/right to switch children.
3. Section 2: Quick action grid (4 columns) — rounded cards with emoji icons: Points Detail📊, Check-in📅, Tasks📋, Achievements🏆. Subtle scale animation on tap.
4. Section 3: Activity feed timeline — left blue timeline bar, items show time + child action + score change (green for positive, red for negative). New items slide in from right.
5. Bottom: Frosted glass TabBar with 5 tabs: Home🏠, Points⭐, Check-in📅, Tasks📋, Profile👤. Active tab has blue fill and slight lift animation.

Visual style: Glassmorphism cards, ocean color palette, soft rounded corners (24px), subtle shadows, animated ocean background with floating bubbles. The overall feel should be magical, warm, and child-friendly.
```

## 技术实现建议

- 使用 `Animated` / `react-native-reanimated` 实现动画
- `LinearGradient` 背景渐变
- `blur-radius` 毛玻璃效果
- `FlatList` + `Animated.View` 实现时间线
- `ScrollView` + `pagingEnabled` 实现孩子卡片滑动
