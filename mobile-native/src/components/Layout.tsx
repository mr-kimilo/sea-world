import { useState } from "react";
import { Outlet } from "react-router-dom";
import TabBar from "./TabBar";
import MobileSidebar from "./MobileSidebar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet />
      </main>
      <TabBar onMenu={() => setSidebarOpen(true)} />
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
