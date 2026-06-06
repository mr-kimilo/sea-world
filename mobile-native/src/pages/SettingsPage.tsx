import { useNavigate } from "react-router-dom";
import { Button, Dialog } from "vant";
import { useAuthStore } from "../store";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();

  const handleLogout = () => {
    Dialog.confirm({
      title: "退出登录",
      message: "退出后需要重新输入密码",
    }).then(() => {
      logout();
      nav("/login");
    }).catch(() => {});
  };

  return (
    <div className="page">
      <h2>⚙ 我的</h2>

      <div className="settings-card">
        <div className="user-info">
          <span className="user-avatar">🧑</span>
          <span className="user-email">{user?.email ?? "未登录"}</span>
        </div>
      </div>

      <div className="settings-card">
        <h4>关于</h4>
        <p>SeaWorld 家庭积分 · v1.0.0</p>
        <p>帮孩子攒积分，换奖励。规则你自己定。</p>
      </div>

      <Button type="danger" round block onClick={handleLogout}>
        退出登录
      </Button>
    </div>
  );
}
