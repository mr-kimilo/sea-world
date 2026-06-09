import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hyperone.family",
  appName: "HyperOne",
  webDir: "dist",
  server: {
    url: "http://192.168.31.168:5178", //open in local
    cleartext: true,
  },
  android: {
    minSdkVersion: 34,
  },
  ios: {
    minVersion: "17.0",
  },
  plugins: {
    Preferences: {
      group: "com.hyperone.family",
    },
    // CapacitorUpdater 暂时禁用 — 排查白屏
  },
};

export default config;
