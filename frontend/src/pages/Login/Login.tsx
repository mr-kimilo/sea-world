import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import OceanBackground from '../../components/OceanBackground';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import './Login.css';
import './Login.mobile.css';
import './OAuth.css';

export default function Login() {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const from = (location.state as { from?: string })?.from || '/home';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const OAUTH_CONFIG: Record<string, { authorizeUrl: string; appIdKey: string }> = {
    qq: {
      authorizeUrl: 'https://graph.qq.com/oauth2.0/authorize',
      appIdKey: 'VITE_QQ_APP_ID',
    },
    douyin: {
      authorizeUrl: 'https://open.douyin.com/platform/oauth/connect',
      appIdKey: 'VITE_DOUYIN_CLIENT_KEY',
    },
  };

  const handleOAuthLogin = (provider: string) => {
    const config = OAUTH_CONFIG[provider];
    if (!config) return;

    const appId = import.meta.env[config.appIdKey] as string | undefined;
    if (!appId) {
      setError(t('auth:oauthNotConfigured', `${provider} 登录尚未配置`));
      return;
    }

    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    // sessionStorage.setItem('oauth_state', state);

    const redirectUri = `${window.location.origin}/oauth/callback?provider=${provider}`;

    let url: string;
    if (provider === 'qq') {
      url = `${config.authorizeUrl}?response_type=code&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    } else {
      // Douyin
      url = `${config.authorizeUrl}?client_key=${appId}&response_type=code&scope=user_info&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    }

    window.location.href = url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login(form);
      if (res.data.success && res.data.data) {
        const { accessToken, refreshToken, user } = res.data.data;
        login(accessToken, refreshToken, user);
        navigate(from, { replace: true });
      } else {
        setError(res.data.message || t('auth:errors.loginFailed'));
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const maybeData = err.response?.data;
        const message =
          typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
            ? String((maybeData as { message?: unknown }).message ?? '')
            : '';
        setError(message || t('auth:errors.loginFailed'));
      } else {
        setError(t('auth:errors.loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <OceanBackground />
      <div className="auth-lang-btn">
        <LanguageSwitcher />
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <h1>🐠 {t('common:appName')}</h1>
          <p>{t('auth:welcome')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <Label htmlFor="email">{t('auth:login.emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth:login.emailPlaceholder')}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="password">{t('auth:login.passwordLabel')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth:login.passwordPlaceholder')}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="auth-button" disabled={loading}>
            {loading ? t('auth:login.loading') : t('auth:login.submit')}
          </Button>
        </form>

        {/* OAuth Login Buttons */}
        <div className="oauth-section">
          <div className="oauth-divider">
            <span>{t('common:or')}</span>
          </div>
          <div className="oauth-buttons">
            <button
              type="button"
              className="oauth-btn oauth-qq"
              onClick={() => handleOAuthLogin('qq')}
            >
              <span className="oauth-icon">🐧</span>
              <span>QQ {t('auth:login.submit')}</span>
            </button>
            <button
              type="button"
              className="oauth-btn oauth-douyin"
              onClick={() => handleOAuthLogin('douyin')}
            >
              <span className="oauth-icon">🎵</span>
              <span>抖音 {t('auth:login.submit')}</span>
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <span>{t('auth:login.noAccount')}</span>
          <Link to="/register">{t('auth:login.registerNow')}</Link>
        </div>
      </div>
    </div>
  );
}
