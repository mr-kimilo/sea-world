import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Field, Button, Toast } from "vant";
import { authApi } from "../api";
import { useAuthStore } from "../store";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleRegister = async () => {
    if (password !== confirm) {
      Toast.fail("两次密码不一样");
      return;
    }
    if (password.length < 6) {
      Toast.fail("密码至少 6 位");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register(email, password);
      setAuth(res.data.accessToken, res.data.user);
      navigate("/", { replace: true });
    } catch {
      Toast.fail("注册失败，换个邮箱试试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>注册</h1>
        <p>加入 SeaWorld 家庭积分</p>
      </div>

      <Form className="auth-form">
        <Field label="邮箱" placeholder="你的邮箱" value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} type="email" clearable />
        <Field label="密码" placeholder="至少 6 位" value={password} onInput={(e) => setPassword((e.target as HTMLInputElement).value)} type="password" clearable />
        <Field label="确认密码" placeholder="再输一次" value={confirm} onInput={(e) => setConfirm((e.target as HTMLInputElement).value)} type="password" clearable />
        <Button type="primary" block round loading={loading} onClick={handleRegister} style={{ marginTop: 16 }}>
          注册
        </Button>
      </Form>

      <div className="auth-links">
        <Link to="/login">已有账号？登录</Link>
      </div>
    </div>
  );
}
