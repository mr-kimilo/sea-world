import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import "vant/lib/index.css";
import App from "./App";

// 热更新检测（仅 Capacitor 原生环境生效）
if (CapacitorUpdater) {
  CapacitorUpdater.notifyAppReady().catch(() => {});
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
