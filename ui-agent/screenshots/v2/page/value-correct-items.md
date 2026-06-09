# V2 重构设计：value-correct-items — 价值观纠正列表

> 源分析：`v1/value-correct-items.md`

---

## V2 布局

```
┌──────────────────────────────┐
│  ← 返回   🧭 价值观纠正     │
├──────────────────────────────┤
│                               │
│  👶 小明        本月纠正 3 次 │  ← 孩子选择+统计
│                               │
│  待纠正行为                   │
│                               │
│  ┌────────────────────────┐  │
│  │ ┃ 🔴 说谎             │  │  ← 左侧色条
│  │ ┃ 今天对妈妈说了谎话   │  │  ← 具体描述
│  │ ┃ 严重程度: ⚠️ 高     │  │  ← 程度标签
│  │ ┃ 建议扣分: -5 分     │  │
│  │ ┃ ┌──────┐ ┌────────┐│  │
│  │ ┃ │ 跳过 │ │ ✓ 纠正 ││  │  ← 操作按钮
│  │ ┃ └──────┘ └────────┘│  │
│  │ ┗━━━━━━━━━━━━━━━━━━━━┛  │
│  └────────────────────────┘  │
│                               │
│  ┌────────────────────────┐  │
│  │ ┃ 🟡 打人             │  │
│  │ ┃ 和弟弟打架          │  │
│  │ ┃ 严重程度: ⚠️ 中    │  │
│  │ ┃ 建议扣分: -10 分    │  │
│  │ ┃ ┌──────┐ ┌────────┐│  │
│  │ ┃ │ 跳过 │ │ ✓ 纠正 ││  │
│  │ ┃ └──────┘ └────────┘│  │
│  │ ┗━━━━━━━━━━━━━━━━━━━━┛  │
│  └────────────────────────┘  │
│                               │
│  ┌────────────────────────┐  │
│  │ ➕ 自定义纠正行为      │  │  ← 自定义
│  │    输入行为描述...     │  │
│  │    扣分: ─ 5 +        │  │
│  └────────────────────────┘  │
│                               │
│  ┌──────────────────────┐    │
│  │  已选择 2 项 | -15 分 │    │  ← 汇总条
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  🌊 确认纠正 🧭      │    │  ← 确认按钮
│  └──────────────────────┘    │
└──────────────────────────────┘
```

## V2 设计要点

- **左侧色条**：红色(高) / 橙色(中) / 黄色(低) 直观显示严重程度
- **纠正建议**：每条显示"建议扣分"数值（家长可调）
- **跳过/纠正**：双按钮操作，跳过则不处理
- **统计头部**：显示本月已纠正次数
- **自定义**：可输入行为描述 + 滑动选择扣分数值

## V2 Prompt

```markdown
Design the "Value Correction" page for 海底世界 app — where parents correct children's negative behaviors.

Header: ← back, title "🧭 价值观纠正", child selector "👶 小明", stats "本月纠正 3 次"

Behavior cards (one per behavior):
- Left color bar: 🔴 red (high severity), 🟠 orange (medium), 🟡 yellow (low)
- Behavior name + specific description
- Severity label ⚠️ 高/中/低
- Suggested deduction: "-5 分" (adjustable)
- Two action buttons: [跳过 Skip] outlined gray, [✓ 纠正 Correct] colored

Example behaviors:
1. 🔴 说谎 - "今天对妈妈说了谎话" - ⚠️ 高 - -5分
2. 🟡 打人 - "和弟弟打架" - ⚠️ 中 - -10分

Custom card: ➕ 自定义纠正行为 with text input + point slider

Bottom: Summary bar "已选择 2 项 | -15 分", gradient button "🌊 确认纠正 🧭"

Style: Clean behavior cards with severity color coding. Left colored accent bar. Child-friendly but clear disciplinary tone. Ocean blue theme.
```
