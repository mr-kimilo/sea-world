import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PointsPage from "./pages/PointsPage";
import TasksPage from "./pages/TasksPage";
import ShopPage from "./pages/ShopPage";
import ChildPage from "./pages/ChildPage";
import SettingsPage from "./pages/SettingsPage";
import ChildEditPage from "./pages/ChildEditPage";
import ScoreHistoryPage from "./pages/ScoreHistoryPage";
import Layout from "./components/Layout";
import { useAuthStore } from "./store";
import "./App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* 认证页面（无 TabBar） */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* 公开页面（有 TabBar，无需登录） */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/child" element={<ChildPage />} />
        </Route>

        {/* 需登录页面（有 TabBar） */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/points" element={<PointsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/child/edit" element={<ChildEditPage />} />
          <Route path="/history" element={<ScoreHistoryPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
