# V2 重构设计：edit-store-item — 编辑商品

> 源分析：`v1/edit-store-item.md`

---

## V2 布局

```
┌──────────────────────────────┐
│  ← 返回   ✏️ 编辑商品       │
├──────────────────────────────┤
│                               │
│  ┌──────────────────────┐    │
│  │  商品名称             │    │
│  │ ┌──────────────────┐ │    │
│  │ │ 🧸 毛绒玩具      │ │    │
│  │ └──────────────────┘ │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  选择图标             │    │
│  │  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐│    │
│  │  │🧸│ │🎮│ │📚│ │🍭││    │
│  │  └─┘ └─┘ └─┘ └─┘ └─┘│    │
│  │  ← 滑动浏览更多 →     │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  所需积分             │    │
│  │ ┌──────────────────┐ │    │
│  │ │  ●──○─── 50 分  │ │    │  ← 滑块选择
│  │ └──────────────────┘ │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  库存                 │    │
│  │ ┌──────────────────┐ │    │
│  │ │  ─ 10 +          │ │    │  ← 步进器
│  │ └──────────────────┘ │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  商品分类             │    │
│  │  [玩具] [学习] [零食] │    │  ← 标签选择
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  上架状态             │    │
│  │  ● 已上架  ○ 下架    │    │  ← 开关
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  🌊 保存商品         │    │
│  └──────────────────────┘    │
│  ┌──────────────────────┐    │
│  │  删除商品             │    │  ← 红色
│  └──────────────────────┘    │
└──────────────────────────────┘
```

## V2 设计要点

- 图标选择器：横向滚动网格，带分页指示器
- 积分滑块：直观的滑动选择替代纯数字输入
- 库存步进器：圆形加减按钮
- 分类标签：可多选的标签组
- 上架开关：iOS 风格切换

## V2 Prompt

```markdown
Design the edit store item page for 海底世界 parent management panel.

Header: ← back, title "✏️ 编辑商品"

Form fields:
1. Item name: Text input with emoji preview
2. Icon picker: Horizontally scrollable grid of emoji icons (🧸🎮📚🍭🎨⚽🎵🧩), selected one has blue border glow. Page dots indicator below.
3. Points cost: Slider control ●──○─── with numeric display "50 分". Draggable thumb with ocean blue color.
4. Stock: Stepper with circular -/+ buttons, "10" in center
5. Category: Tag group [玩具] [学习] [零食] [其他], multi-select, selected tags have blue fill
6. Status: Toggle switch "● 已上架 / ○ 下架"

Bottom: Gradient save button "🌊 保存商品". Below: Red "删除商品" button with confirmation dialog.

Style: Parent-focused clean form design, ocean blue accents, smooth sliders and steppers. Rounded input fields, frosted glass card sections.
```
