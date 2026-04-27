import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN_common from './locales/zh-CN/common.json';
import zhCN_auth from './locales/zh-CN/auth.json';
import zhCN_home from './locales/zh-CN/home.json';
import zhCN_family from './locales/zh-CN/family.json';
import zhCN_score from './locales/zh-CN/score.json';
import zhCN_child from './locales/zh-CN/child.json';
import zhCN_shop from './locales/zh-CN/shop.json';
import zhCN_profile from './locales/zh-CN/profile.json';

import enUS_common from './locales/en-US/common.json';
import enUS_auth from './locales/en-US/auth.json';
import enUS_home from './locales/en-US/home.json';
import enUS_family from './locales/en-US/family.json';
import enUS_score from './locales/en-US/score.json';
import enUS_child from './locales/en-US/child.json';
import enUS_shop from './locales/en-US/shop.json';
import enUS_profile from './locales/en-US/profile.json';

i18n
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 传递 i18n 实例给 react-i18next
  .init({
    resources: {
      'zh-CN': {
        common: zhCN_common,
        auth: zhCN_auth,
        home: zhCN_home,
        family: zhCN_family,
        score: zhCN_score,
        child: zhCN_child,
        shop: zhCN_shop,
        profile: zhCN_profile,
      },
      'en-US': {
        common: enUS_common,
        auth: enUS_auth,
        home: enUS_home,
        family: enUS_family,
        score: enUS_score,
        child: enUS_child,
        shop: enUS_shop,
        profile: enUS_profile,
      },
    },
    fallbackLng: 'zh-CN', // 默认语言
    defaultNS: 'common', // 默认命名空间
    interpolation: {
      escapeValue: false, // React 已经自动转义
    },
    detection: {
      order: ['localStorage', 'navigator'], // 优先从 localStorage 读取
      caches: ['localStorage'], // 持久化到 localStorage
    },
  });

export default i18n;
