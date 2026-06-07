import zh from "./locales/zh";
import en from "./locales/en";

type Lang = "zh" | "en";
const msgs = { zh, en };

export function getLang(): Lang { return (localStorage.getItem("lang") as Lang) || "zh"; }
export function setLang(l: Lang) { localStorage.setItem("lang", l); window.location.reload(); }

export function t(path: string, params?: Record<string, string | number>): string {
  const keys = path.split(".");
  let val: any = msgs[getLang()];
  for (const k of keys) val = val?.[k];
  let str = typeof val === "string" ? val : path;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

/** Get an array value from i18n (for quick reasons, etc.) */
export function ta(path: string): string[] {
  const keys = path.split(".");
  let val: any = msgs[getLang()];
  for (const k of keys) val = val?.[k];
  return Array.isArray(val) ? val : [];
}
