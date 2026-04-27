---
description: "Use when writing UI text, form labels, error messages, or any user-facing strings in React components."
applyTo: "frontend/src/**/*.{ts,tsx}"
---

# Frontend Internationalization (i18n) — 前端多语言规范

## 核心原则

**禁止在 JSX 或组件中硬编码任何用户可见的字符串**。所有界面文本必须通过 i18n 系统管理，支持中英双语切换。

## 技术栈

- **库**: `react-i18next` + `i18next`
- **支持语言**: 中文 (zh-CN)、英文 (en-US)
- **默认语言**: zh-CN
- **持久化**: localStorage (`i18nextLng`)

## 文件组织

```
src/
├── i18n/
│   ├── index.ts          # i18next 配置和初始化
│   ├── locales/
│   │   ├── zh-CN/
│   │   │   ├── common.json      # 通用文本（按钮、标签）
│   │   │   ├── auth.json        # 登录注册验证
│   │   │   ├── family.json      # 家庭相关
│   │   │   ├── score.json       # 积分相关
│   │   │   ├── shop.json        # 商城相关
│   │   │   └── validation.json  # 表单校验错误
│   │   └── en-US/
│   │       ├── common.json
│   │       ├── auth.json
│   │       └── ...
```

## 使用规范

### 1. 组件内使用

```tsx
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation('auth'); // 指定命名空间

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('login.submit')}</button>
      <p>{t('register.hint', { count: 3 })}</p> {/* 插值 */}
    </div>
  );
}
```

### 2. JSON 文件命名约定

```json
// locales/zh-CN/auth.json
{
  "welcome": "欢迎回来",
  "login": {
    "submit": "登录",
    "loading": "登录中...",
    "emailPlaceholder": "请输入邮箱",
    "passwordPlaceholder": "请输入密码"
  },
  "register": {
    "hint": "还没有账号？立即注册"
  },
  "errors": {
    "invalidCredentials": "邮箱或密码错误",
    "passwordMismatch": "两次输入的密码不一致"
  }
}

// locales/en-US/auth.json
{
  "welcome": "Welcome Back",
  "login": {
    "submit": "Login",
    "loading": "Logging in...",
    "emailPlaceholder": "Enter your email",
    "passwordPlaceholder": "Enter your password"
  },
  "register": {
    "hint": "Don't have an account? Register now"
  },
  "errors": {
    "invalidCredentials": "Invalid email or password",
    "passwordMismatch": "Passwords do not match"
  }
}
```

### 3. 动态内容插值

```tsx
// ❌ 错误：拼接字符串
<p>{`欢迎，${name}！`}</p>

// ✅ 正确：使用插值
<p>{t('greeting', { name })}</p>

// JSON: "greeting": "欢迎，{{name}}！"
```

### 4. 复数/单数处理

```json
{
  "itemCount": "{{count}} 个项目",
  "itemCount_plural": "{{count}} 个项目"
}
```

```tsx
{t('itemCount', { count: items.length })}
```

## 强制规则

| ❌ 禁止 | ✅ 必须 |
|--------|--------|
| `<button>登录</button>` | `<button>{t('auth:login.submit')}</button>` |
| `placeholder="请输入邮箱"` | `placeholder={t('auth:login.emailPlaceholder')}` |
| `setError('密码错误')` | `setError(t('validation:passwordInvalid'))` |
| API 错误直接显示后端消息 | 映射错误码到本地化 key |

## 语言切换组件

```tsx
// components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
    i18n.changeLanguage(newLang);
  };

  return (
    <button onClick={toggleLanguage}>
      {i18n.language === 'zh-CN' ? 'English' : '中文'}
    </button>
  );
}
```

## 后端错误消息处理

后端返回的 `message` 字段不直接显示，而是映射到本地化 key：

```tsx
catch (err: any) {
  const errorCode = err.response?.data?.code; // 假设后端返回 code
  const fallbackKey = 'common:errors.unknownError';
  setError(t(`errors:${errorCode}`, fallbackKey));
}
```

## 检查清单

开发新页面时，必须确保：

- [ ] 所有界面文本使用 `t()` 函数
- [ ] 所有 placeholder、label、button 文本已国际化
- [ ] 表单校验错误消息已国际化
- [ ] 成功/失败提示已国际化
- [ ] 已添加对应的英文翻译文件
- [ ] 动态内容使用插值而非字符串拼接

## 初始化配置示例

```ts
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN_common from './locales/zh-CN/common.json';
import zhCN_auth from './locales/zh-CN/auth.json';
import enUS_common from './locales/en-US/common.json';
import enUS_auth from './locales/en-US/auth.json';

i18n
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': {
        common: zhCN_common,
        auth: zhCN_auth,
      },
      'en-US': {
        common: enUS_common,
        auth: enUS_auth,
      },
    },
    fallbackLng: 'zh-CN',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React 已转义
    },
  });

export default i18n;
```

```tsx
// src/main.tsx
import './i18n'; // 在应用启动前导入
```
