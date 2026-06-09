# V2 重构设计：myself — 个人中心

> 源分析：`v1/myself.md`

---

## V2 布局

```
┌──────────────────────────────┐
│          🌊 我的             │  ← 透明导航栏
├──────────────────────────────┤
│  ┌──────────────────────┐    │
│  │  🌊🌊🌊🌊🌊🌊        │    │  ← 波浪动画头部
│  │    ┌──┐               │    │
│  │    │👤│ 王老师         │    │
│  │    └──┘ 家长           │    │
│  │    wang@example.com   │    │
│  │  🌊🌊🌊🌊🌊🌊        │    │
│  └──────────────────────┘    │
├──────────────────────────────┤
│  👶 我的孩子    2人      →  │  ← 统计角标
│  🏆 成就勋章    3/8     →  │
│  📊 家庭报告    本周+85 →  │
│  📅 打卡日历    连续5天  →  │  ← 带状态摘要
├──────────────────────────────┤
│  设置                        │
│  ⚙️ 账号安全             →  │
│  🔔 通知设置             →  │
│  🌐 语言: 中文           →  │
│  🎨 主题: 海洋            →  │  ← 新增
├──────────────────────────────┤
│  其他                        │
│  📖 使用帮助             →  │
│  💬 意见反馈             →  │
│  📝 关于我们     v2.0   →  │
├──────────────────────────────┤
│  ┌──────────────────────┐    │
│  │  🚪 退出登录          │    │
│  └──────────────────────┘    │
├──────────────────────────────┤
│  🏠  ⭐  📅  📋  👤          │
└──────────────────────────────┘
```

## V2 设计要点

- **波浪头部**：Lottie 波浪动画背景，比 V1 更生动
- **带摘要的菜单**：每个菜单项右侧显示摘要信息（孩子数量/成就进度/本周积分/连续打卡天数）
- **新增主题设置**：支持主题切换
- **版本信息**：关于我们显示版本号

## V2 Prompt

```markdown
Design the "Profile / My Page" for 海底世界 app.

Layout:
1. Header: Animated ocean wave background (Lottie), circular user avatar with wave border, name "王老师", role badge "家长", email. Bottom wave divider.
2. Menu Group 1 (with live summaries):
   - 👶 我的孩子 → "2人" (with blue badge)
   - 🏆 成就勋章 → "3/8" (with progress indicator)
   - 📊 家庭报告 → "本周+85" (green text)
   - 📅 打卡日历 → "连续5天" (fire emoji)
3. Menu Group 2 - Settings:
   - ⚙️ 账号安全
   - 🔔 通知设置
   - 🌐 语言: 中文
   - 🎨 主题: 海洋 (new)
4. Menu Group 3 - Other:
   - 📖 使用帮助
   - 💬 意见反馈
   - 📝 关于我们 v2.0
5. Red logout button "🚪 退出登录"
6. Bottom TabBar: Home🏠, Points⭐, Check-in📅, Tasks📋, Profile👤(active)

Visual: Each menu item is a frosted glass card with right arrow →. Summary info on the right side with colored badges. Ocean wave header animation. Deep blue theme (#0A2647).
```
