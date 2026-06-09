# V2 重构设计：point-login — 登录页

> 源分析：`v1/point-login.md`

---

## 设计理念

将登录页从功能型表单升级为**沉浸式海底世界入口**。让用户打开 App 的第一眼就感受到海洋的氛围，登录流程简洁流畅。

## V2 布局

```
┌──────────────────────────────┐
│  Status Bar (透明)           │
├──────────────────────────────┤
│                               │
│         🐟🐠🐡              │  ← 游鱼动画
│                               │
│      🐠 海底世界             │  ← App Logo + 标题
│    家庭积分管理系统           │  ← 副标题
│                               │
│  ┌──────────────────────┐    │
│  │  📧 邮箱/手机号      │    │  ← 毛玻璃输入框
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │  🔒 密码             │    │  ← 毛玻璃输入框
│  │                  👁   │    │
│  └──────────────────────┘    │
│                               │
│  ┌──────────────────────┐    │
│  │    登  录  海  洋     │    │  ← 渐变按钮 + 波浪
│  └──────────────────────┘    │
│                               │
│    没有账号？🚀 立即注册    │
│    🌊 忘记密码？             │
│                               │
│  ──── 海洋相遇 ────          │
│                               │
│  [微信]  [QQ]  [📱]          │
│                               │
│  🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊     │  ← 底部波浪动画
└──────────────────────────────┘
```

## V2 设计要点

### 1. 背景
- 深海渐变 (`#0A2647` → `#1B4965` → `#0077B6`)
- 动态气泡上升 (大小随机，速度随机)
- 游鱼剪影缓慢游过 (SVG 路径动画)
- 底部波浪动画 (`Lottie` / `react-native-reanimated`)

### 2. Logo 区域
- 鱼形 Logo 3D 旋转或游动动画
- 标题 "🐠 海底世界" 大气字体
- 副标题 "家庭积分管理系统" 轻量小字

### 3. 输入框
- 毛玻璃效果 (`backdrop-filter`)
- 左侧 Emoji 图标
- 聚焦时边框发光动画
- 密码切换可见按钮

### 4. 登录按钮
- 海洋蓝到浅蓝渐变
- 波浪形边缘
- 点击时波浪扩散动画
- 加载态: 波浪形 loading 指示器

### 5. 第三方登录
- 圆形按钮，海洋风格边框
- 微信绿色 / QQ 蓝色 / 手机 珊瑚色

## V2 Prompt

```markdown
Design a login page for "海底世界 (Sea World)" mobile app — a family reward points system. 

This is the FIRST screen users see, make it immersive and magical.

Theme: Deep ocean — animated full-screen gradient background (#0A2647 → #1B4965 → #0077B6). Floating bubbles rise slowly (various sizes, random speed). Silhouettes of fish swim across the screen. Animated waves at the bottom edge.

Layout:
1. Top: Transparent status bar
2. Center: Animated fish logo "🐠" with gentle floating animation. App name "海底世界" in large white font (海洋体/rounded bold), subtitle "家庭积分管理系统" in smaller lighter text.
3. Login form: Two frosted glass input fields (backdrop-filter blur) — first with 📧 icon "邮箱/手机号", second with 🔒 icon "密码" and 👁 visibility toggle. Input fields glow blue when focused.
4. Login button: Full-width gradient button (#0077B6 → #00B4D8) with wave-shaped edges. Text "登录海洋". Ripple animation on press.
5. Links: "没有账号？🚀 立即注册" and "🌊 忘记密码？" in light blue (#90E0EF).
6. Divider: "── 海洋相遇 ──" 
7. Social login: 3 circular buttons — WeChat (green), QQ (blue), Phone (coral). Frosted glass style.
8. Bottom: Animated wave layer

Overall: Magical, immersive, child-friendly ocean entrance. Pure white text on dark blue gradient. Smooth animations everywhere.
```

## 动画

| 元素 | 效果 |
|------|------|
| 背景 | 持续渐变 + 气泡 + 游鱼 |
| Logo | 上下浮动 (3s ease-in-out infinite) |
| 输入框聚焦 | 边框光晕扩散 |
| 登录按钮 | 波纹扩散 + 波浪加载 |
| 页面切换 | 从下向上推入 |
| 底部波浪 | 持续左右摆动 |
