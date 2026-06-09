# V2 重构设计：add-child — 添加孩子

> 源分析：`v1/add-child.md`

---

## V2 布局

```
┌──────────────────────────────┐
│  ← 返回   👶 添加孩子       │
├──────────────────────────────┤
│                               │
│  ┌──────────────────────┐    │
│  │      ┌────┐          │    │  ← 头像选择
│  │      │ ➕ │          │    │
│  │      │📷  │          │    │
│  │      └────┘          │    │
│  │  点击设置头像         │    │
│  │  或从海洋生物中选择   │    │
│  │  🐠 🐟 🐡 🐙 🦀 🐬  │    │  ← 预设头像
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  👶 孩子昵称          │    │
│  │ ┌──────────────────┐ │    │
│  │ │ 请输入昵称        │ │    │
│  │ └──────────────────┘ │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  📝 真实姓名          │    │
│  │ ┌──────────────────┐ │    │
│  │ │ 请输入真实姓名    │ │    │
│  │ └──────────────────┘ │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  🎂 出生日期          │    │
│  │ ┌──────────────────┐ │    │
│  │ │ 2020-01-01   📅 │ │    │
│  │ └──────────────────┘ │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  性别                 │    │
│  │  ┌──────┐ ┌──────┐  │    │
│  │  │👦小王│ │👧小公│  │    │  ← 卡片式选择
│  │  │  子  │ │  主  │  │    │
│  │  └──────┘ └──────┘  │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  ⭐ 初始积分: 0      │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  🌊 欢迎新成员 🎉    │    │  ← 保存按钮
│  └──────────────────────┘    │
└──────────────────────────────┘
```

## V2 设计要点

- **预设海洋头像**：提供多种海洋生物 Emoji 头像可选 🐠🐟🐡🐙🦀🐬
- **性别选择**：卡片式设计，带 Emoji + 文字，选中高亮
- **日期选择**：圆形滚轮选择器（iOS风格）
- **成功动画**：保存后全屏气泡 + "欢迎新成员 🎉" 庆祝

## V2 Prompt

```markdown
Design the "Add Child" page for 海底世界 app.

Header: ← back, title "👶 添加孩子"

Form:
1. Avatar picker: Large circular placeholder with ➕ camera icon. Below: preset ocean animal emoji options 🐠🐟🐡🐙🦀🐬 in horizontal scroll. Selected one has blue wave border.
2. Nickname: Text input with 👶 icon
3. Real name: Text input with 📝 icon
4. Birthday: Date input with 🎂 icon, opens iOS-style date picker wheel
5. Gender: Two card-style options 👦 小王子 / 👧 小公主, selected card has blue gradient border and light blue fill. Interactive tap animation.
6. Initial points: Number input with ⭐ icon (default 0)

Bottom: Gradient button "🌊 欢迎新成员 🎉". On success: full-screen celebration with bubbles, "🎉 欢迎小明加入海底世界!" message, auto-navigate to home.

Style: Warm, welcoming ocean theme. Soft blue gradients, bubble decorations. Childish and fun emoji usage. Rounded corners everywhere.
```
