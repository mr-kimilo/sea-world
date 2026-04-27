import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import OceanBackground from '../../components/OceanBackground';
import './Login.css';
import './Login.mobile.css';

export default function Login() {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login(form);
      if (res.data.success && res.data.data) {
        const { accessToken, refreshToken, user } = res.data.data;
        login(accessToken, refreshToken, user);
        navigate('/');
      } else {
        setError(res.data.message || t('auth:errors.loginFailed'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth:errors.loginFailed'));
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
            <label htmlFor="email">{t('auth:login.emailLabel')}</label>
            <input
              id="email"
              type="email"
              placeholder={t('auth:login.emailPlaceholder')}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth:login.passwordLabel')}</label>
            <input
              id="password"
              type="password"
              placeholder={t('auth:login.passwordPlaceholder')}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? t('auth:login.loading') : t('auth:login.submit')}
          </button>
        </form>

        <div className="auth-footer">
          <span>{t('auth:login.noAccount')}</span>
          <Link to="/register">{t('auth:login.registerNow')}</Link>
        </div>
      </div>
    </div>
  );
}
