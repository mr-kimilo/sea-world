import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.seaworld.family",
  appName: "SeaWorld",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  android: {
    minSdkVersion: 34,
  },
  ios: {
    minVersion: "17.0",
  },
  plugins: {
    Preferences: {
      group: "com.seaworld.family",
    },
    CapacitorUpdater: {
      autoUpdate: true,
      autoUpdateUrl: "https://capgo.app/api/auto_update",
    },
  },
};

export default config;
