# 截图清单 — world-under-the-sea UI 重构

> 用途：截取所有核心 UI 页面 → Ollama 分析 → Penpot 重构  
> 路径：截图文件放入 `ui-agent/screenshots/`  
> 命名规范：`{优先级}_{页面名}_{视图}.png`  
> 如：`P01_Login_Web.png`、`P02_Home_Mobile.png`

---

## P0 — 核心页面（用户主路径）

| # | 页面 | 截图文件名 | Web | Mobile | 说明 |
|---|------|-----------|:---:|:------:|------|
| 1 | Login | `P01_Login_Web.png` / `P01_Login_Mobile.png` | ✅ | ✅ | 登录表单 + 海洋背景 |
| 2 | Register | `P02_Register_Web.png` / `P02_Register_Mobile.png` | ✅ | ✅ | 注册表单 |
| 3 | Home（家长） | `P03_Home_Parent_Web.png` / `P03_Home_Parent_Mobile.png` | ✅ | ✅ | 首页 — 家长视图，含孩子卡片 + 积分录入 |
| 4 | Home（孩子） | `P04_Home_Child_Web.png` / `P04_Home_Child_Mobile.png` | ✅ | ✅ | 首页 — 孩子视图，仅看积分 |
| 5 | Shop | `P05_Shop_Web.png` / `P05_Shop_Mobile.png` | ✅ | ✅ | 积分商城 — 商品列表 |
| 6 | Profile | `P06_Profile_Web.png` / `P06_Profile_Mobile.png` | ✅ | ✅ | 个人中心 — 家庭管理 + 孩子管理 |

## P1 — 次要交互页面

| # | 页面 | 截图文件名 | Web | Mobile | 说明 |
|---|------|-----------|:---:|:------:|------|
| 7 | Orders | `P07_Orders_Web.png` / `P07_Orders_Mobile.png` | ✅ | ✅ | 订单列表（待处理/已完成） |
| 8 | ScoreMaintenance | `P08_Score_Web.png` / `P08_Score_Mobile.png` | ✅ | ✅ | 积分维护 — 历史记录 + 维度管理 |
| 9 | ShopAdmin | `P09_ShopAdmin_Web.png` / `P09_ShopAdmin_Mobile.png` | ✅ | ✅ | 商城管理（家长：添加/编辑商品） |
| 10 | VerifyEmail | `P10_VerifyEmail_Web.png` / `P10_VerifyEmail_Mobile.png` | ✅ | ✅ | 邮箱验证页 |

## P2 — Portal 门户页面

| # | 页面 | 截图文件名 | 说明 |
|---|------|-----------|------|
| 11 | PortalHome | `P11_Portal_Home_Web.png` | 超级家庭门户首页 |
| 12 | Portal ChildValue | `P12_Portal_ChildValue_Web.png` | 孩子价值页面 |

## P3 — Mobile Native 专用页面

| # | 页面 | 截图文件名 | 说明 |
|---|------|-----------|------|
| 13 | Mobile Home | `P13_Mobile_Home.png` | Capacitor 首页 |
| 14 | Mobile Points | `P14_Mobile_Points.png` | 积分详情 |
| 15 | Mobile Tasks | `P15_Mobile_Tasks.png` | 任务列表 |
| 16 | Mobile Child | `P16_Mobile_Child.png` | 孩子管理 |
| 17 | Mobile Settings | `P17_Mobile_Settings.png` | 设置 |
| 18 | Mobile ScoreHistory | `P18_Mobile_History.png` | 积分历史 |
| 19 | Mobile ForgotPassword | `P19_Mobile_ForgotPwd.png` | 忘记密码 |

## P4 — 特殊状态页面

| # | 页面 | 截图文件名 | 说明 |
|---|------|-----------|------|
| 20 | Empty State | `P20_Empty_State.png` | 空数据/无孩子/无商品 |
| 21 | Error State | `P21_Error_State.png` | 网络错误/加载失败 |
| 22 | Loading State | `P22_Loading_State.png` | 骨架屏/加载动画 |
| 23 | Mobile TabBar | `P23_Mobile_TabBar.png` | 底部导航栏各标签页 |

---

## 截图操作步骤

### Web 端截图

```powershell
# 1. 启动前端
cd world-under-the-sea/frontend
npm run dev

# 2. 浏览器打开 http://localhost:5173
# 3. 逐页截取（建议 1920×1080 全屏 + 移动端 375×812 模拟）
```

### Mobile 端截图

```powershell
# 方式 A: 浏览器 DevTools 移动端模式
# 方式 B: Capacitor 模拟器
cd world-under-the-sea/mobile-native
npm run dev

# 方式 C: Android 模拟器截图
#   adb shell screencap -p /sdcard/screenshot.png
#   adb pull /sdcard/screenshot.png ./screenshots/
```

### 文件命名规则

```
P{两位数优先级}_{英文页面名}_{视图}.{扩展名}

示例:
  P01_Login_Web.png          # Web 端登录页
  P01_Login_Mobile.png       # 移动端登录页  
  P03_Home_Parent_Web.png    # Web 端首页（家长视图）
  P13_Mobile_Home.png        # Capacitor 首页
```

---

## 截图后处理流程

```
截图完成
    ↓
放入 ui-agent/screenshots/
    ↓
运行分析脚本
    ├─ python screenshot_analyzer.py --watch        # 自动监视处理
    └─ python screenshot_analyzer.py --interactive   # 手动交互处理
    ↓
Ollama 输出 UI 结构化描述 → 自动复制到剪贴板
    ↓
粘贴到 Penpot AI Assistant → 生成设计稿
    ↓
人工微调 → 导出/生成代码
```
