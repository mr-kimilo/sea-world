import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Field, Button, Toast } from "vant";
import { authApi } from "../api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      Toast.success("验证码已发送到邮箱");
      setStep("code");
    } catch {
      Toast.fail("该邮箱未注册");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (newPassword.length < 6) {
      Toast.fail("密码至少 6 位");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      Toast.success("密码重置成功");
      navigate("/login", { replace: true });
    } catch {
      Toast.fail("验证码不对或已过期");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>忘记密码</h1>
        <p>{step === "email" ? "输入注册邮箱" : "输入验证码和新密码"}</p>
      </div>

      {step === "email" ? (
        <Form className="auth-form">
          <Field label="邮箱" placeholder="注册时用的邮箱" value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} type="email" clearable />
          <Button type="primary" block round loading={loading} onClick={handleSendCode} style={{ marginTop: 16 }}>
            发送验证码
          </Button>
        </Form>
      ) : (
        <Form className="auth-form">
          <Field label="验证码" placeholder="6 位数字" value={code} onInput={(e) => setCode((e.target as HTMLInputElement).value)} maxlength={6} />
          <Field label="新密码" placeholder="至少 6 位" value={newPassword} onInput={(e) => setNewPassword((e.target as HTMLInputElement).value)} type="password" clearable />
          <Button type="primary" block round loading={loading} onClick={handleReset} style={{ marginTop: 16 }}>
            重置密码
          </Button>
        </Form>
      )}

      <div className="auth-links">
        <Link to="/login">返回登录</Link>
      </div>
    </div>
  );
}
