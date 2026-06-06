import zh from "./locales/zh";
import en from "./locales/en";

type Lang = "zh" | "en";
const msgs = { zh, en };

export function getLang(): Lang { return (localStorage.getItem("lang") as Lang) || "zh"; }
export function setLang(l: Lang) { localStorage.setItem("lang", l); window.location.reload(); }

export function t(path: string): string {
  const keys = path.split(".");
  let val: any = msgs[getLang()];
  for (const k of keys) val = val?.[k];
  return typeof val === "string" ? val : path;
}
