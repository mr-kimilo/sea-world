import { Outlet } from "react-router-dom";
import TabBar from "./TabBar";

export default function Layout() {
  return (
    <div className="app">
      <main className="app-main">
        <Outlet />
      </main>
      <TabBar
        items={[
          { to: "/", icon: "⭐", label: "积分" },
          { to: "/tasks", icon: "📋", label: "任务" },
          { to: "/shop", icon: "🎁", label: "商店" },
          { to: "/child", icon: "🧒", label: "纠正器" },
          { to: "/settings", icon: "⚙", label: "我的" },
        ]}
      />
    </div>
  );
}
