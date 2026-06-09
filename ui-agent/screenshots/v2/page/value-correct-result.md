# V2 重构设计：value-correct-result — 纠正结果页

> 源分析：`v1/value-correct-result.md`

---

## V2 布局

```
┌──────────────────────────────┐
│  ← 返回   ✅ 纠正结果       │
├──────────────────────────────┤
│                               │
│      🎉🌊🎉                  │  ← 庆祝动画
│   纠正完成！                  │
│   已对 2 项行为进行纠正       │
│                               │
│  ┌──────────────────────┐    │
│  │ 🔴 说谎       -5 分  │    │  ← 已纠正清单
│  │ 🟡 打人      -10 分  │    │    带严重程度色标
│  └──────────────────────┘    │
│                               │
│  ─────────────────────        │
│  共纠正 2 项     -15 分      │
│  ─────────────────────        │
│                               │
│  ┌──────────────────────┐    │
│  │  ⭐ 当前积分: 135 分  │    │  ← 新余额
│  │        ━━━●━━━ 90%   │    │  ← 进度条
│  └──────────────────────┘    │
│                               │
│  💡 给家长的建议               │
│  ┌──────────────────────┐    │
│  │ 📌 与孩子沟通说谎     │    │
│  │     的原因             │    │
│  │ 📌 鼓励诚实的行为     │    │
│  │ 📌 设定明确的规则     │    │
│  │ 📌 观看相关教育视频   │    │  ← 可点击
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  🌊 返回首页          │    │
│  └──────────────────────┘    │
│  ┌──────────────────────┐    │
│  │  继续纠正              │    │
│  └──────────────────────┘    │
└──────────────────────────────┘
```

## V2 设计要点

- **庆祝动画**：成功图标有弹性缩放 + 气泡扩散动画
- **进度变化**：积分进度条从旧值动画过渡到新值
- **教育建议**：可点击展开详细内容或关联文章/视频
- **正向引导**：不仅展示扣分，更强调"帮助孩子成长"

## V2 Prompt

```markdown
Design the correction result page for 海底世界 app — shown after parents confirm behavioral corrections.

Layout:
1. Success animation: 🎉🌊🎉 large celebration icon with elastic scale animation and bubble particles
2. Title: "纠正完成！" + subtitle "已对 2 项行为进行纠正"
3. Corrected items list: 🔴 说谎 -5分, 🟡 打人 -10分 (with left color bars matching severity)
4. Summary: "共纠正 2 项 | -15 分"
5. Updated points: ⭐ 当前积分: 135 分 with animated progress bar (counts down from 150 to 135)
6. Parent advice section: 💡 给家长的建议
   - 📌 与孩子沟通说谎的原因 (tappable → detailed article)
   - 📌 鼓励诚实的行为
   - 📌 设定明确的规则 (tappable → video)
7. Two buttons: "🌊 返回首页" (primary), "继续纠正" (ghost)

Visual: Celebratory ocean theme with bubble animations. Green success icon, gold points display, educational advice cards with ocean blue background. Positive and constructive tone.
```
