import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Field, Button, Toast } from "vant";
import { authApi } from "../api";
import { useAuthStore } from "../store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setAuth(res.data.accessToken, res.data.user);
      navigate("/", { replace: true });
    } catch {
      Toast.fail("账号或密码不对");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>SeaWorld</h1>
        <p>家庭积分，简单好用</p>
      </div>

      <Form className="auth-form">
        <Field
          label="邮箱"
          placeholder="输入邮箱"
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          type="email"
          clearable
        />
        <Field
          label="密码"
          placeholder="输入密码"
          value={password}
          onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
          type="password"
          clearable
        />
        <Button
          type="primary"
          block
          round
          loading={loading}
          onClick={handleLogin}
          style={{ marginTop: 16 }}
        >
          登录
        </Button>
      </Form>

      <div className="auth-links">
        <Link to="/register">注册新账号</Link>
        <Link to="/forgot-password">忘记密码</Link>
      </div>
    </div>
  );
}
