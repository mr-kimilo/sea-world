# V2 重构设计：home-left-bar — 左侧抽屉导航

> 源分析：`v1/home-left-bar.md`

---

## 设计理念

将 V1 的简单白色抽屉升级为**沉浸式海洋导航面板**。用户区域使用动态海洋背景，菜单项增加精致微交互，让导航本身成为体验的一部分。

## V2 布局

```
┌──────────────────┬────────────┐
│  抽屉面板          │  主内容区   │
│  ┌──────────────┐ │  (模糊遮罩) │
│  │  🌊🌊🌊🌊🌊  │ │             │
│  │  ┌──┐        │ │             │
│  │  │👤│ 王老师  │ │             │
│  │  └──┘ 家长    │ │             │
│  │  wang@xx.com  │ │             │
│  │  🌊🌊🌊🌊🌊  │ │             │
│  └──────────────┘ │             │
│                    │             │
│  🏠 首页       ●  │ │  ← 高亮点 │
│  🛒 积分商城      │ │             │
│  📋 任务中心      │ │             │
│  📅 打卡记录      │ │             │
│  🏆 成就       5  │ │  ← Badge   │
│  ⚙️ 设置          │ │             │
│  ❓ 帮助反馈      │ │             │
│                    │             │
│  ─────────────    │ │             │
│                    │             │
│  👨‍👩‍👧‍👦 我的家庭  →│ │             │
│  🌐 语言: 中文  → │ │             │
│                    │ │             │
│  🚪 退出登录      │ │  ← 红色     │
└──────────────────┴────────────┘
```

## V2 设计要点

### 1. 用户头部区域
- 海洋波浪动态背景 (`Lottie` 波浪动画)
- 圆形头像 + 波浪形边框
- 姓名 + 角色标签(家长/孩子) + 邮箱
- 底部波浪形分割线

### 2. 菜单项
- 每项: Emoji + 标题 + 右箭头/角标
- 当前选中: 左侧蓝色竖条 + 浅蓝背景 + ● 指示点
- 悬停/按下: 背景色渐变
- 成就菜单: 右上角红色角标显示未读数量

### 3. 底部功能区
- 分隔线以上是主菜单，以下是辅助功能
- "我的家庭" 快速切换家庭
- "语言切换" 常用设置快捷入口

### 4. 退出按钮
- 红色文字，带 🚪 图标
- 点击有震动反馈

### 5. 遮罩层
- 点击关闭抽屉
- 半透明渐变色 (左深右浅)

## V2 Prompt

```markdown
Design a left drawer navigation menu for "海底世界 (Sea World)" mobile app.

Theme: Ocean blue. The drawer slides in from the left with a smooth animation.

Layout:
1. Header area: Animated ocean wave background (animated gradient/波浪), circular user avatar with wave-style border, user name "王老师" with role badge "家长", email. Bottom edge has a wave divider.
2. Navigation menu items: Each item has an emoji icon + label + right arrow. Active item has left blue accent bar + light blue background + ● dot indicator.
   - 🏠 Home (active)
   - 🛒 Shop
   - 📋 Tasks
   - 📅 Check-in History
   - 🏆 Achievements (with red badge "5")
   - ⚙️ Settings
   - ❓ Help & Feedback
3. Secondary section: divider line, then 👨‍👩‍👧‍👧 My Family →, 🌐 Language: 中文 →
4. Bottom: 🚪 Logout button in red
5. Right side: Semi-transparent gradient overlay (dark blue to transparent) that closes drawer on tap

Visual style: Ocean blue palette, glassmorphism, animated header, clean typography, rounded elements, subtle animations on menu item press. Dark blue `#0A2647` for active states, white for menu text.
```

## 动画

- 抽屉滑入: `translateX(-100% → 0)` + 弹性曲线
- 菜单项: 依次淡入 (stagger)
- 波浪头部: 持续流动动画
- 遮罩层: 从不透明到透明渐变
- 退出点击: 触觉反馈
