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
import OrdersPage from "./pages/OrdersPage";
import ErrorPage from "./pages/ErrorPage";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import TrophyPage from "./pages/Trophy/TrophyPage";
import FamilyPage from "./pages/Family/FamilyPage";
import JoinFamilyPage from "./pages/Family/JoinFamilyPage";
import { useAuthStore } from "./store";
import "./App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
    <HashRouter>
      <Routes>
        {/* 错误页面（无 TabBar） */}
        <Route path="/error" element={<ErrorPage />} />

        {/* 公开页面 + 认证页面（都有 TabBar） */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/child" element={<ChildPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 需登录页面（有 TabBar） */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/points" element={<PointsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/child/edit" element={<ChildEditPage />} />
          <Route path="/history" element={<ScoreHistoryPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/trophy" element={<TrophyPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/family/join" element={<JoinFamilyPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
    </ErrorBoundary>
  );
}
